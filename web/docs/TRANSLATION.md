# Auto-Translation Tool

自动翻译工具,使用 DeepL API 将英文翻译为多种语言,让你只需维护英文语言包。

## 设置步骤

### 1. 获取 DeepL API Key

访问 [DeepL API](https://www.deepl.com/pro-api) 注册并获取你的 API key。

> **提示**: DeepL 提供免费版 API,每月可翻译 500,000 字符,足够大多数项目使用。

### 2. 配置环境变量

在 `web` 目录下创建 `.env` 文件:

```bash
cp .env.example .env
```

然后编辑 `.env` 文件,添加你的 API key:

```env
DEEPL_API_KEY=your_actual_api_key_here
```

> **注意**: 免费版 API key 以 `:fx` 结尾,脚本会自动识别并使用正确的 API 端点。

### 3. 运行翻译

```bash
# 翻译所有配置的语言
npm run translate

# 只翻译特定语言
npm run translate -- zh
npm run translate -- ja ko
```

## 工作流程

1. **编辑英文翻译**: 只需修改 `src/i18n/en.ts` 文件
2. **运行翻译命令**: `npm run translate`
3. **自动更新所有语言**: 脚本会自动检测差异并更新所有目标语言文件

## 添加新语言

### 步骤 1: 配置新语言

编辑 `scripts/translation.config.js`,在 `targetLangs` 数组中添加新语言:

```javascript
targetLangs: [
  {
    code: 'zh',
    name: 'Simplified Chinese (简体中文)',
    file: 'zh.ts'
  },
  {
    code: 'ja',  // 新增日语
    name: 'Japanese (日本語)',
    file: 'ja.ts'
  },
]
```

### 步骤 2: 创建语言文件

在 `src/i18n/` 目录下创建对应的语言文件(如 `ja.ts`):

```typescript
export const ja = {}
```

### 步骤 3: 更新 translations.ts

在 `src/i18n/translations.ts` 中导入并添加新语言:

```typescript
import { en } from './en'
import { zh } from './zh'
import { ja } from './ja'  // 新增

export type Language = 'en' | 'zh' | 'ja'  // 更新类型

export const translations = {
  en,
  zh,
  ja,  // 新增
}
```

### 步骤 4: 运行翻译

```bash
npm run translate
```

脚本会自动翻译所有内容到新语言!

## 功能特性

✅ **多语言支持**: 同时翻译多个目标语言  
✅ **智能差异检测**: 只翻译新增或修改的条目  
✅ **占位符保护**: 自动保护 `{count}`, `{gap}`, `{length}` 等变量不被翻译  
✅ **批量处理**: 每次处理 50 个条目,提高翻译效率  
✅ **嵌套对象支持**: 正确处理多层嵌套的翻译对象  
✅ **选择性翻译**: 可以只翻译特定语言  
✅ **手动翻译保护**: 使用 `// @manual` 标记保护人工翻译  

## 占位符保护

脚本会自动保护所有 `{变量名}` 格式的占位符,确保它们不会被翻译。

### 工作原理

1. **翻译前**: 将 `{count}` 包装为 `<keep>{count}</keep>`
2. **DeepL 翻译**: DeepL 会忽略 `<keep>` 标签内的内容
3. **翻译后**: 移除保护标签,恢复原始的 `{count}` 格式

### 支持的占位符格式

```typescript
// ✅ 这些占位符会被自动保护
'You have {count} items'
'Gap: {gap}%'
'Length: {length}'
'Symbol: {symbol}'
'Origin: {origin}'
'Protocol: {protocol}'
```

## 保护手动翻译

如果某些翻译需要人工精确翻译,不希望被自动翻译覆盖,可以使用 `// @manual` 标记:

### 使用方法

在需要保护的翻译条目前添加 `// @manual` 注释:

```typescript
export const zh = {
  // @manual
  brandName: 'NOFX 交易系统',
  
  // @manual - 专业术语,人工精确翻译
  technicalTerm: '技术术语(专业翻译)',
  
  // 普通翻译,会被自动更新
  normalTerm: '普通术语',
  
  errors: {
    // @manual
    apiKeyInvalid: 'API 密钥格式错误',
    networkError: '网络连接失败', // 会被自动更新
  }
}
```

### 工作原理

1. 翻译脚本会扫描目标语言文件
2. 识别所有 `// @manual` 标记
3. 跳过标记的条目,不进行翻译
4. **自动保留标记**: 写入文件时会保留所有 `@manual` 注释
5. 显示跳过的条目数量

> **重要**: 从 v2.0 开始,翻译脚本会自动保留 `@manual` 标记!你不需要在每次翻译后手动重新添加标记。

### 输出示例

```
🔒 Found 3 manually protected translations
⏭️  Skipped 3 manually protected items
📝 Found 10 items to translate
```

### 最佳实践

✅ **适合标记的内容**:
- 品牌名称和专有名词
- 需要特定语境的专业术语
- 已经过人工审核的重要翻译
- 文化相关的表达

❌ **不建议标记的内容**:
- 通用的简单翻译
- 经常变化的内容
- 占位符和变量(已自动保护)

## 使用示例

### 翻译所有语言
```bash
npm run translate
```

输出:
```
🚀 Starting multi-language translation with DeepL...
📖 Source language: en
🎯 Target languages: zh, ja

============================================================
🌐 Translating to Simplified Chinese (简体中文) (zh)
============================================================
🔍 Reading translation files...
🔎 Finding differences...
📝 Found 5 items to translate
🌐 Translating batch 1/1...
✅ Translation complete for zh!
📄 Updated 5 translations in zh.ts

============================================================
🌐 Translating to Japanese (日本語) (ja)
============================================================
🔍 Reading translation files...
🔎 Finding differences...
📝 Found 5 items to translate
🌐 Translating batch 1/1...
✅ Translation complete for ja!
📄 Updated 5 translations in ja.ts

============================================================
📊 Translation Summary
============================================================
✅ Successful: 2

🎉 All done!
```

### 只翻译特定语言
```bash
# 只翻译中文
npm run translate -- zh

# 翻译日语和韩语
npm run translate -- ja ko
```

## 配置文件说明

`scripts/translation.config.js`:

```javascript
export const translationConfig = {
  // 源语言(你手动维护的语言)
  sourceLang: 'en',
  
  // 目标语言列表
  targetLangs: [
    {
      code: 'zh',           // 语言代码
      name: 'Simplified Chinese (简体中文)',  // 完整名称(用于翻译提示)
      file: 'zh.ts'         // 文件名
    },
    {
      code: 'ja',
      name: 'Japanese (日本語)',
      file: 'ja.ts'
    },
    // 添加更多语言...
  ]
};
```

## 支持的语言

DeepL 支持以下语言(脚本已配置):

- 🇨🇳 Chinese (简体中文) - `zh`
- 🇯🇵 Japanese (日本語) - `ja`
- 🇰🇷 Korean (한국어) - `ko`
- 🇪🇸 Spanish (Español) - `es`
- 🇫🇷 French (Français) - `fr`
- 🇩🇪 German (Deutsch) - `de`
- 🇧🇷 Portuguese (Português) - `pt`
- 🇷🇺 Russian (Русский) - `ru`
- 🇮🇹 Italian (Italiano) - `it`
- 🇳🇱 Dutch (Nederlands) - `nl`
- 🇵🇱 Polish (Polski) - `pl`
- 🇹🇷 Turkish (Türkçe) - `tr`
- 🇸🇦 Arabic (العربية) - `ar`
- 🇻🇳 Vietnamese (Tiếng Việt) - `vi`
- 🇹🇭 Thai (ไทย) - `th`
- 🇮🇩 Indonesian (Bahasa Indonesia) - `id`

## 注意事项

- 🔑 **API Key 安全**: 不要将 `.env` 文件提交到 git
- 💰 **API 费用**: DeepL 免费版每月 500,000 字符,正常使用不会产生费用
- 🌐 **网络要求**: 需要能访问 DeepL API
- ✏️ **人工修正**: 如果需要人工修正某些翻译,可以使用 `// @manual` 标记保护
- 📝 **增量更新**: 脚本只翻译新增或修改的内容,不会重新翻译已有的翻译

## 故障排查

### 错误: DEEPL_API_KEY not found

确保你已经创建 `.env` 文件并添加了 API key:

```bash
# 检查 .env 文件是否存在
ls .env

# 如果不存在,复制示例文件
cp .env.example .env

# 编辑 .env 文件,添加你的 API key
```

### 翻译质量不佳

DeepL 的翻译质量通常很好,但如果遇到特定术语翻译不准确,可以:
1. 使用 `// @manual` 标记,手动修改目标语言文件
2. 在 `en.ts` 中添加更多上下文

### 占位符被翻译了

如果发现占位符被翻译,请检查:
1. 占位符格式是否为 `{变量名}` (只支持字母和下划线)
2. 运行最新版本的翻译脚本
3. 如果问题仍然存在,请手动修正并使用 `// @manual` 标记保护

### API 限流错误

脚本已经内置了延迟机制,每批翻译之间会等待 500ms。如果仍然遇到限流:
1. 检查你的 API 使用量是否超过限额
2. 尝试减少批量大小(修改脚本中的 `batchSize`)

### 网络错误

检查网络连接,确保能访问 DeepL API:
- 免费版: `https://api-free.deepl.com`
- 专业版: `https://api.deepl.com`
