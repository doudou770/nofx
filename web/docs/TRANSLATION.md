# Auto-Translation Tool

自动翻译工具,使用 Gemini API 将英文翻译为多种语言,让你只需维护英文语言包。

## 设置步骤

### 1. 获取 Gemini API Key

访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取你的 API key。

### 2. 配置环境变量

在 `web` 目录下创建 `.env` 文件:

```bash
cp .env.example .env
```

然后编辑 `.env` 文件,添加你的 API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

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
✅ **保留格式**: 自动保留占位符如 `{count}`, `{gap}` 等  
✅ **批量处理**: 每次处理 10 个条目,避免 API 限流  
✅ **嵌套对象支持**: 正确处理多层嵌套的翻译对象  
✅ **选择性翻译**: 可以只翻译特定语言  

## 使用示例

### 翻译所有语言
```bash
npm run translate
```

输出:
```
🚀 Starting multi-language translation...
📖 Source language: en
🎯 Target languages: zh

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
📊 Translation Summary
============================================================
✅ Successful: 1

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
    // 添加更多语言...
  ]
};
```

## 注意事项

- 🔑 **API Key 安全**: 不要将 `.env` 文件提交到 git
- 💰 **API 费用**: Gemini API 有免费额度,正常使用不会产生费用
- 🌐 **网络要求**: 需要能访问 Google API
- ✏️ **人工修正**: 如果需要人工修正某些翻译,可以在翻译后手动编辑对应语言文件
- 📝 **增量更新**: 脚本只翻译新增或修改的内容,不会重新翻译已有的翻译

## 故障排查

### 错误: GEMINI_API_KEY not found
确保你已经创建 `.env` 文件并添加了 API key。

### 错误: No valid target languages specified
检查命令行参数是否正确,或者 `translation.config.js` 中是否配置了目标语言。

### 翻译质量不佳
Gemini 的翻译质量通常很好,但如果遇到特定术语翻译不准确,可以:
1. 手动修改对应语言文件中的翻译
2. 在 `en.ts` 中添加更多上下文

### 网络错误
检查网络连接,确保能访问 Google API。


## 设置步骤

### 1. 获取 Gemini API Key

访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 获取你的 API key。

### 2. 配置环境变量

在 `web` 目录下创建 `.env` 文件:

```bash
cp .env.example .env
```

然后编辑 `.env` 文件,添加你的 API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 运行翻译

```bash
npm run translate
```

## 工作流程

1. **编辑英文翻译**: 只需修改 `src/i18n/en.ts` 文件
2. **运行翻译命令**: `npm run translate`
3. **自动更新中文**: 脚本会自动检测差异并更新 `src/i18n/zh.ts`

## 功能特性

✅ **智能差异检测**: 只翻译新增或修改的条目  
✅ **保留格式**: 自动保留占位符如 `{count}`, `{gap}` 等  
✅ **批量处理**: 每次处理 10 个条目,避免 API 限流  
✅ **嵌套对象支持**: 正确处理多层嵌套的翻译对象  

## 示例

### 修改前 (en.ts)
```typescript
export const en = {
  welcome: 'Welcome to NOFX',
  greeting: 'Hello, {name}!',
  // ... 其他翻译
}
```

### 运行翻译
```bash
npm run translate
```

### 输出
```
🔍 Reading translation files...
📊 Parsing translation objects...
🔎 Finding differences...
📝 Found 2 items to translate
🌐 Translating batch 1/1...
✅ Translation complete!
📄 Updated 2 translations in zh.ts
```

### 修改后 (zh.ts)
```typescript
export const zh = {
  welcome: '欢迎来到 NOFX',
  greeting: '你好，{name}！',
  // ... 其他翻译
}
```

## 注意事项

- 🔑 **API Key 安全**: 不要将 `.env` 文件提交到 git
- 💰 **API 费用**: Gemini API 有免费额度,正常使用不会产生费用
- 🌐 **网络要求**: 需要能访问 Google API
- ✏️ **人工修正**: 如果需要人工修正某些翻译,可以在翻译后手动编辑 `zh.ts`

## 故障排查

### 错误: GEMINI_API_KEY not found
确保你已经创建 `.env` 文件并添加了 API key。

### 翻译质量不佳
Gemini 的翻译质量通常很好,但如果遇到特定术语翻译不准确,可以:
1. 手动修改 `zh.ts` 中的翻译
2. 在 `en.ts` 中添加更多上下文

### 网络错误
检查网络连接,确保能访问 Google API。
