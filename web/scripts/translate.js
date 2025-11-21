import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { translationConfig } from './translation.config.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const i18nDir = path.join(__dirname, '../src/i18n');
const sourcePath = path.join(i18nDir, `${translationConfig.sourceLang}.ts`);

// Check for API key
if (!process.env.DEEPL_API_KEY) {
    console.error('❌ Error: DEEPL_API_KEY not found in .env file');
    console.log('Please add your DeepL API key to .env:');
    console.log('DEEPL_API_KEY=your_api_key_here');
    console.log('\nGet your free API key at: https://www.deepl.com/pro-api');
    process.exit(1);
}

// DeepL API configuration
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = DEEPL_API_KEY.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'  // Free API
    : 'https://api.deepl.com/v2/translate';       // Pro API

// Language code mapping (DeepL uses different codes)
const DEEPL_LANG_MAP = {
    'zh': 'ZH',           // Chinese (simplified)
    'ja': 'JA',           // Japanese
    'ko': 'KO',           // Korean
    'es': 'ES',           // Spanish
    'fr': 'FR',           // French
    'de': 'DE',           // German
    'pt': 'PT-BR',        // Portuguese (Brazilian)
    'ru': 'RU',           // Russian
    'it': 'IT',           // Italian
    'nl': 'NL',           // Dutch
    'pl': 'PL',           // Polish
    'tr': 'TR',           // Turkish
    'ar': 'AR',           // Arabic
    'vi': 'VI',           // Vietnamese
    'th': 'TH',           // Thai
    'id': 'ID',           // Indonesian
};

// Get target languages from command line args or use all configured languages
const args = process.argv.slice(2);
const targetLangs = args.length > 0
    ? translationConfig.targetLangs.filter(lang => args.includes(lang.code))
    : translationConfig.targetLangs;

if (targetLangs.length === 0) {
    console.error('❌ Error: No valid target languages specified');
    console.log('Available languages:', translationConfig.targetLangs.map(l => l.code).join(', '));
    process.exit(1);
}

// Parse manual markers from file content and store with full comment text
function parseManualMarkers(content) {
    const manualKeys = new Map(); // key -> comment line
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check if line contains @manual marker
        if (trimmed.includes('// @manual') || trimmed.includes('//@manual')) {
            // Next non-empty line should be the key
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j].trim();
                if (nextLine && !nextLine.startsWith('//')) {
                    // Extract key name from line like: "keyName": 'value',
                    const match = nextLine.match(/^"?(\w+)"?:/);
                    if (match) {
                        manualKeys.set(match[1], line); // Store the full comment line with indentation
                    }
                    break;
                }
            }
        }
    }

    return manualKeys;
}

// Load translation object from file using dynamic import
async function loadTranslationObject(filePath) {
    try {
        // Use dynamic import to load the module
        const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
        const module = await import(fileUrl + '?t=' + Date.now()); // Add timestamp to avoid cache

        // Get the exported object (e.g., en, zh, ja)
        const fileName = path.basename(filePath, '.ts');
        return module[fileName];
    } catch (error) {
        console.error('Error loading translation object:', error);
        throw error;
    }
}

// Deep diff two objects and return keys that are different or missing
// Skip keys marked as @manual in the target file
function getTranslationDiff(sourceObj, targetObj, manualKeys = new Map()) {
    const diff = {};
    const skipped = [];

    function traverse(sourceNode, targetNode, path = []) {
        if (typeof sourceNode === 'string') {
            const key = path.join('.');
            const lastKey = path[path.length - 1];

            // Skip if marked as manual
            if (manualKeys.has(lastKey)) {
                skipped.push(key);
                return;
            }

            if (sourceNode !== targetNode) {
                diff[key] = sourceNode;
            }
            return;
        }

        if (typeof sourceNode === 'object' && sourceNode !== null) {
            for (const key in sourceNode) {
                traverse(
                    sourceNode[key],
                    targetNode?.[key],
                    [...path, key]
                );
            }
        }
    }

    traverse(sourceObj, targetObj);
    return { diff, skipped };
}

// Translate a batch of strings using DeepL API
async function translateBatch(texts, targetLangCode) {
    const deeplLangCode = DEEPL_LANG_MAP[targetLangCode] || targetLangCode.toUpperCase();

    try {
        // Protect placeholders by wrapping them in XML tags
        const protectedTexts = texts.map(text => {
            // Replace {placeholder} with <keep>{placeholder}</keep>
            return text.replace(/\{([a-zA-Z_]+)\}/g, '<keep>{$1}</keep>');
        });

        // DeepL API accepts multiple texts in one request
        const params = new URLSearchParams();
        params.append('auth_key', DEEPL_API_KEY);
        params.append('source_lang', 'EN');
        params.append('target_lang', deeplLangCode);
        params.append('preserve_formatting', '1');
        params.append('tag_handling', 'xml');
        params.append('ignore_tags', 'keep');

        // Add all texts
        protectedTexts.forEach(text => {
            params.append('text', text);
        });

        const response = await fetch(DEEPL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Remove protection tags from translated texts
        return data.translations.map(t => {
            return t.text.replace(/<keep>(\{[a-zA-Z_]+\})<\/keep>/g, '$1');
        });
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

// Convert object to formatted string with preserved @manual markers
function objectToFormattedString(obj, manualKeys, indent = 2) {
    const lines = [];
    const spaces = ' '.repeat(indent);
    const keys = Object.keys(obj);

    lines.push('{');

    keys.forEach((key, index) => {
        const value = obj[key];
        const isLast = index === keys.length - 1;

        // Add @manual marker if it exists for this key
        if (manualKeys.has(key)) {
            const commentLine = manualKeys.get(key);
            // Preserve the original indentation or use default
            const trimmedComment = commentLine.trim();
            lines.push(`${spaces}${trimmedComment}`);
        }

        // Format the key-value pair
        if (typeof value === 'object' && value !== null) {
            lines.push(`${spaces}"${key}": ${objectToFormattedString(value, manualKeys, indent + 2)}${isLast ? '' : ','}`);
        } else {
            const jsonValue = JSON.stringify(value);
            lines.push(`${spaces}"${key}": ${jsonValue}${isLast ? '' : ','}`);
        }
    });

    lines.push(' '.repeat(indent - 2) + '}');

    return lines.join('\n');
}

// Update target language file with new translations
async function updateLanguage(targetLang) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🌐 Translating to ${targetLang.name} (${targetLang.code})`);
    console.log('='.repeat(60));

    const targetPath = path.join(i18nDir, targetLang.file);

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Source file not found: ${sourcePath}`);
        return false;
    }

    console.log('🔍 Reading translation files...');
    const sourceObj = await loadTranslationObject(sourcePath);

    // Check if target file exists, if not create empty object
    let targetObj = {};
    let manualKeys = new Map();

    if (fs.existsSync(targetPath)) {
        const targetContent = fs.readFileSync(targetPath, 'utf8');
        targetObj = await loadTranslationObject(targetPath);
        manualKeys = parseManualMarkers(targetContent);

        if (manualKeys.size > 0) {
            console.log(`🔒 Found ${manualKeys.size} manually protected translations`);
        }
    } else {
        console.log(`📝 Target file doesn't exist, will create: ${targetPath}`);
    }

    console.log('🔎 Finding differences...');
    const { diff, skipped } = getTranslationDiff(sourceObj, targetObj, manualKeys);

    if (skipped.length > 0) {
        console.log(`⏭️  Skipped ${skipped.length} manually protected items`);
    }

    const diffKeys = Object.keys(diff);
    if (diffKeys.length === 0) {
        console.log('✅ All translations are up to date!');
        return true;
    }

    console.log(`📝 Found ${diffKeys.length} items to translate`);

    // Translate in batches of 50 (DeepL allows up to 50 texts per request)
    const batchSize = 50;
    const translations = {};

    for (let i = 0; i < diffKeys.length; i += batchSize) {
        const batch = diffKeys.slice(i, i + batchSize);
        const textsToTranslate = batch.map(key => diff[key]);

        console.log(`🌐 Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(diffKeys.length / batchSize)}...`);

        const translated = await translateBatch(textsToTranslate, targetLang.code);

        batch.forEach((key, index) => {
            translations[key] = translated[index];
        });

        // Small delay to avoid rate limiting
        if (i + batchSize < diffKeys.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Update target object with new translations
    function setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
    }

    for (const [key, value] of Object.entries(translations)) {
        setNestedValue(targetObj, key, value);
    }

    // Convert back to TypeScript file format with preserved @manual markers
    const formattedContent = objectToFormattedString(targetObj, manualKeys);
    const newTargetContent = `export const ${targetLang.code} = ${formattedContent}\n`;

    // Write back to file
    fs.writeFileSync(targetPath, newTargetContent);

    console.log(`✅ Translation complete for ${targetLang.code}!`);
    console.log(`📄 Updated ${diffKeys.length} translations in ${targetLang.file}`);

    return true;
}

// Main translation function
async function translateAll() {
    console.log('🚀 Starting multi-language translation with DeepL...');
    console.log(`📖 Source language: ${translationConfig.sourceLang}`);
    console.log(`🎯 Target languages: ${targetLangs.map(l => l.code).join(', ')}\n`);

    const results = [];

    for (const targetLang of targetLangs) {
        try {
            const success = await updateLanguage(targetLang);
            results.push({ lang: targetLang.code, success });
        } catch (error) {
            console.error(`❌ Failed to translate ${targetLang.code}:`, error.message);
            results.push({ lang: targetLang.code, success: false });
        }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Translation Summary');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Successful: ${successful}`);
    if (failed > 0) {
        console.log(`❌ Failed: ${failed}`);
        const failedLangs = results.filter(r => !r.success).map(r => r.lang);
        console.log(`   Languages: ${failedLangs.join(', ')}`);
    }

    console.log('\n🎉 All done!');
}

// Run the translation
translateAll().catch(error => {
    console.error('❌ Translation failed:', error);
    process.exit(1);
});
