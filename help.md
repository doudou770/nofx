# NOFX 后端深度代码解析报告

## 1. 架构总览

NOFX 后端是一个基于 **Go** 语言构建的高性能、模块化量化交易系统。它采用了典型的分层架构，核心设计理念是**模块解耦**、**数据驱动**和**AI 决策**。

### 核心组件交互图

```mermaid
graph TD
    Main[main.go Entry] --> Config[Config & DB Layer]
    Main --> Manager[Trader Manager]
    Main --> API[API Server (Gin)]
    Main --> Market[Market Monitor (WS)]
    
    API --> Manager
    API --> Config
    
    Manager --> AutoTrader[AutoTrader Instances]
    
    AutoTrader --> Decision[Decision Engine (AI)]
    AutoTrader --> TraderInterface[Trader Interface]
    AutoTrader --> Market
    
    TraderInterface --> Binance[Binance Futures]
    TraderInterface --> Hyperliquid[Hyperliquid DEX]
    TraderInterface --> Aster[Aster DEX]
    
    Decision --> LLM[LLM Client (DeepSeek/Qwen)]
```

## 2. 核心模块深度解析

### 2.1 入口与生命周期 (`main.go`)
*   **初始化流程**:
    1.  加载 `.env` 和 `config.json`。
    2.  初始化 SQLite 数据库 (`config.db`)，并启用 **WAL 模式** (Write-Ahead Logging) 和 **FULL 同步**，确保高并发下的性能和数据安全性。
    3.  初始化 RSA 加密服务，用于保护 API Key 等敏感数据。
    4.  启动 `TraderManager` 并从数据库加载所有交易员实例。
    5.  启动 `WSMonitor` (WebSocket 市场数据监控)。
    6.  启动 HTTP API 服务器。
*   **优雅退出**: 监听 `SIGINT`/`SIGTERM` 信号，依次停止交易员、关闭 API 服务器、关闭数据库连接，防止数据丢失。

### 2.2 配置与持久化 (`config/`)
*   **数据库设计**: 使用 SQLite 存储所有状态。
    *   `users`: 用户管理，支持 OTP 双因素认证。
    *   `traders`: 交易员配置，包含杠杆、策略 Prompt、运行状态等。
    *   `exchanges`: 交易所 API 配置，支持多用户隔离。
    *   `ai_models`: AI 模型配置，支持自定义 API URL。
*   **安全性**:
    *   **字段加密**: API Key、Secret Key、私钥等敏感字段在存入数据库前均通过 RSA 加密。
    *   **WAL 模式**: 显式开启 `PRAGMA journal_mode=WAL`，大幅提升写入性能。

### 2.3 交易员管理 (`manager/`)
*   **并发控制**: `TraderManager` 使用 `sync.RWMutex` 保护内存中的 `traders` 映射，支持并发读写。
*   **动态加载**: 支持在运行时动态添加、更新、停止交易员，无需重启服务。
*   **性能优化**:
    *   **竞赛数据缓存**: `GetCompetitionData` 实现了 30 秒的内存缓存，避免频繁计算 PnL 导致 CPU 飙升。
    *   **并发查询**: `getConcurrentTraderData` 使用 Goroutine 并发获取多个交易员的账户状态，并设置了 3 秒超时，防止单个交易所 API 阻塞整体响应。

### 2.4 自动交易核心 (`trader/auto_trader.go`)
这是系统的"大脑"，每个实例是一个独立的交易循环。
*   **状态机**: `runCycle` 方法周期性执行（默认 3 分钟）：
    1.  **Context 构建**: 聚合账户余额、持仓、K线数据、技术指标。
    2.  **AI 决策**: 调用 `decision` 包获取 AI 建议。
    3.  **执行**: 解析 AI 指令，执行开/平仓操作。
    4.  **风控**: 检查最大回撤、每日亏损限额。
*   **自我修正**: 维护最近 100 次周期的夏普比率，如果表现不佳（Sharpe < -0.5），会自动暂停交易。

### 2.5 交易所适配层 (`trader/`)
通过 `Trader` 接口屏蔽了 CEX 和 DEX 的差异。

#### A. Binance Futures (`binance_futures.go`)
*   **库**: 使用 `github.com/adshao/go-binance/v2`。
*   **特性**:
    *   **双向持仓**: 初始化时强制设置为 Hedge Mode。
    *   **缓存**: 实现了 15 秒的余额和持仓缓存，减少 API 频率限制风险。
    *   **BrID**: 生成唯一的 Client Order ID，防止订单重复提交。

#### B. Hyperliquid (`hyperliquid_trader.go`)
*   **库**: 使用自定义封装的 `github.com/sonirico/go-hyperliquid`。
*   **安全机制**:
    *   **Agent Wallet**: 强制区分"主钱包"和"代理钱包"。私钥仅用于签名（Agent），资金保留在主钱包，极大降低了私钥泄露风险。
    *   **精度处理**: 实现了 `szDecimals` (数量精度) 和 `sigfigs` (价格有效位) 的严格处理，防止因精度问题导致下单失败。
*   **模式**: 支持全仓 (Cross) 和逐仓 (Isolated) 模式切换。

#### C. Aster DEX (`aster_trader.go`)
*   **实现**: 原生 HTTP 请求 + 以太坊签名。
*   **签名机制**: 使用 EIP-712 风格或 Personal Sign 对请求参数进行签名。
*   **精度缓存**: 启动时拉取 `exchangeInfo` 并缓存所有交易对的 `tickSize` 和 `stepSize`，确保下单参数符合合约要求。

### 2.6 决策引擎 (`decision/`)
*   **Prompt 工程**: 采用 XML 结构化 Prompt (`<context>`, `<market_data>`)，强制 AI 输出 JSON 格式决策。
*   **鲁棒性**:
    *   **JSON 修复**: 内置 `fixMissingQuotes` 等函数，能自动修复 LLM 输出的畸形 JSON。
    *   **思维链**: 强制 AI 输出 `<reasoning>` 标签，记录决策逻辑，便于后续复盘。

### 2.7 API 服务 (`api/`)
*   **框架**: Gin Web Framework。
*   **功能**:
    *   **JWT 认证**: 基于 `Authorization` 头进行鉴权。
    *   **IP 白名单**: 提供 `handleGetServerIP` 接口辅助用户配置交易所白名单。
    *   **WebSocket**: 虽然主要用于 HTTP，但也集成了 WS 用于前端实时推送（在 `market` 模块中）。

## 3. 总结与评价

NOFX 后端代码展现了极高的工程质量：
1.  **安全性**: 极其重视资金安全，从 Agent Wallet 设计到 RSA 加密，再到硬编码的风控规则，层层防护。
2.  **扩展性**: `Trader` 接口设计优秀，新增交易所只需实现该接口即可。
3.  **稳定性**: 大量使用 Context 超时控制、错误重试机制和 Panic 恢复（在 Gin 中），确保系统长期稳定运行。
4.  **AI 原生**: 不是简单的"策略脚本"，而是围绕 LLM 构建的自主决策系统，充分利用了 AI 的分析能力。
