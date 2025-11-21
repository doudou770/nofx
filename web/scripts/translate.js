import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { translationConfig } from './translation.config.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const i18nDir = path.join(__dirname, '../src/i18n');
const sourcePath = path.join(i18nDir, `${translationConfig.sourceLang}.ts`);

// Check for API key
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY not found in .env file');
    console.log('Please add your Gemini API key to .env:');
    console.log('GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

// Convert object string to actual object (simplified parser)
function objectStringToObj(str) {
    try {
        const cleaned = str
            .replace(/export const \w+ = /, '')
            .replace(/\/\/.*/g, '') // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments

        return new Function('return ' + cleaned)();
    } catch (error) {
        console.error('Error parsing object:', error);
        throw error;
    }
}

// Deep diff two objects and return keys that are different or missing
function getTranslationDiff(sourceObj, targetObj) {
    const diff = {};

    function traverse(sourceNode, targetNode, path = []) {
        if (typeof sourceNode === 'string') {
            if (sourceNode !== targetNode) {
                const key = path.join('.');
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
    return diff;
}

// Translate a batch of strings using Gemini
async function translateBatch(texts, targetLangName) {
    const prompt = `You are a professional translator. Translate the following English text to ${targetLangName}.

IMPORTANT RULES:
1. Preserve all placeholders like {count}, {gap}, {symbol}, {length}, {expected}, {origin}, {protocol}, {name}, {param} exactly as they are
2. Preserve all HTML tags and markdown formatting
3. Keep technical terms and brand names (like NOFX, GitHub, API, Binance, Gemini, etc.) unchanged
4. Maintain the same tone and style
5. Return ONLY the translations in the same order as input, separated by "|||"
6. Do not add explanations or notes

Input texts (separated by "|||"):
${texts.join(' ||| ')}

Translations:`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translated = response.text().trim();

        // Split by delimiter and clean up
        const translations = translated.split('|||').map(t => t.trim());

        if (translations.length !== texts.length) {
            console.warn('⚠️  Warning: Translation count mismatch. Retrying individually...');
            const individualTranslations = [];
            for (const text of texts) {
                const singleResult = await translateBatch([text], targetLangName);
                individualTranslations.push(singleResult[0]);
            }
            return individualTranslations;
        }

        return translations;
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
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

    console.log('� Reading translation files...');
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const sourceObj = objectStringToObj(sourceContent);

    // Check if target file exists, if not create empty object
    let targetObj = {};
    if (fs.existsSync(targetPath)) {
        const targetContent = fs.readFileSync(targetPath, 'utf8');
        targetObj = objectStringToObj(targetContent);
    } else {
        console.log(`📝 Target file doesn't exist, will create: ${targetPath}`);
    }

    console.log('🔎 Finding differences...');
    const diff = getTranslationDiff(sourceObj, targetObj);

    const diffKeys = Object.keys(diff);
    if (diffKeys.length === 0) {
        console.log('✅ All translations are up to date!');
        return true;
    }

    console.log(`📝 Found ${diffKeys.length} items to translate`);

    // Translate in batches of 10 to avoid rate limits
    const batchSize = 10;
    const translations = {};

    for (let i = 0; i < diffKeys.length; i += batchSize) {
        const batch = diffKeys.slice(i, i + batchSize);
        const textsToTranslate = batch.map(key => diff[key]);

        console.log(`🌐 Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(diffKeys.length / batchSize)}...`);

        const translated = await translateBatch(textsToTranslate, targetLang.name);

        batch.forEach((key, index) => {
            translations[key] = translated[index];
        });

        // Small delay to avoid rate limiting
        if (i + batchSize < diffKeys.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
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

    // Convert back to TypeScript file format
    const newTargetContent = `export const ${targetLang.code} = ${JSON.stringify(targetObj, null, 2)}\n`;

    // Write back to file
    fs.writeFileSync(targetPath, newTargetContent);

    console.log(`✅ Translation complete for ${targetLang.code}!`);
    console.log(`📄 Updated ${diffKeys.length} translations in ${targetLang.file}`);

    return true;
}

// Main translation function
async function translateAll() {
    console.log('🚀 Starting multi-language translation...');
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
