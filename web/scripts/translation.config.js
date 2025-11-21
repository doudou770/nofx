/**
 * Translation Configuration
 * 
 * Configure source and target languages for auto-translation
 */

export const translationConfig = {
    // Source language (the one you maintain manually)
    sourceLang: 'en',

    // Target languages to auto-translate
    // Add new languages here and create corresponding .ts files
    targetLangs: [
        {
            code: 'zh',
            name: 'Simplified Chinese (简体中文)',
            file: 'zh.ts'
        },
        // Uncomment and add more languages as needed:
        {
            code: 'ja',
            name: 'Japanese (日本語)',
            file: 'ja.ts'
        },
        // {
        //   code: 'ko',
        //   name: 'Korean (한국어)',
        //   file: 'ko.ts'
        // },
        // {
        //   code: 'es',
        //   name: 'Spanish (Español)',
        //   file: 'es.ts'
        // },
        // {
        //   code: 'fr',
        //   name: 'French (Français)',
        //   file: 'fr.ts'
        // },
    ]
};
