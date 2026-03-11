import js from '@eslint/js';
import dependenciesPlugin from '@omnicajs/eslint-plugin-dependencies';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import jsonPlugin from 'eslint-plugin-json';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const tsRecommendedRules = {
    ...tsPlugin.configs['flat/eslint-recommended'].rules,
    ...tsPlugin.configs['flat/recommended'][2].rules,
};

const commonRules = {
    ...js.configs.recommended.rules,
    'brace-style': ['error', '1tbs', {
        allowSingleLine: true,
    }],
    'comma-dangle': ['error', {
        arrays: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
        imports: 'always-multiline',
        objects: 'always-multiline',
    }],
    'eqeqeq': ['error', 'always'],
    'indent': ['error', 4, {
        ignoreComments: true,
        SwitchCase: 1,
    }],
    'keyword-spacing': ['error', {
        before: true,
        after: true,
        overrides: {
            catch: { before: true, after: true },
        },
    }],
    'linebreak-style': [2, 'unix'],
    'max-depth': ['error', 4],
    'max-lines-per-function': ['error', {
        max: 30,
        skipBlankLines: true,
        skipComments: true,
    }],
    'no-debugger': 'error',
    'no-multiple-empty-lines': ['error', {
        max: 1,
        maxBOF: 0,
        maxEOF: 0,
    }],
    'no-new-wrappers': 'error',
    'no-prototype-builtins': 'error',
    'no-restricted-imports': ['error', {
        paths: [{
            name: 'lodash',
            message: 'Импортируйте отдельные функции из lodash, в стиле `import %fn% from \'lodash/%fn%\'` во избежание затягивания в сборку lodash целиком',
        }],
        patterns: [
            '!lodash/*',
            '!lodash.*',
        ],
    }],
    'no-shadow-restricted-names': 'error',
    'no-trailing-spaces': 'error',
    'no-throw-literal': 'error',
    'no-unused-vars': 'off',
    'object-curly-spacing': ['error', 'always'],
    'padded-blocks': ['error', 'never'],
    'quotes': ['error', 'single'],
    'space-infix-ops': ['error', { int32Hint: false }],
    'import/export': 'error',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-cycle': 'error',
    'import/no-empty-named-blocks': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
};

const vueRules = {
    'vue/attributes-order': 'error',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/first-attribute-linebreak': 'error',
    'vue/html-closing-bracket-newline': ['error', {
        singleline: 'never',
        multiline: 'always',
    }],
    'vue/html-closing-bracket-spacing': 'error',
    'vue/html-indent': ['error', 4, {
        attribute: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
    }],
    'vue/html-self-closing': ['error', {
        html: {
            void: 'always',
            normal: 'always',
            component: 'always',
        },
        svg: 'always',
        math: 'always',
    }],
    'vue/max-attributes-per-line': ['error', {
        singleline: 4,
        multiline: 1,
    }],
    'vue/singleline-html-element-content-newline': 'off',
};

const importSortingRules = {
    'dependencies/import-style': ['error', {
        maxSingleLineLength: 90,
        maxSingleLineSpecifiers: 3,
    }],
    'dependencies/separate-type-imports': 'error',
    'dependencies/separate-type-partitions': 'error',
    'dependencies/sort-named-imports': ['error', {
        type: 'alphabetical',
        ignoreAlias: true,
    }],
    'dependencies/sort-imports': ['error', {
        type: 'alphabetical',
        imports: {
            orderBy: 'alias',
            splitDeclarations: true,
        },
        groups: [
            'side-effect-style',
            'side-effect',
            [
                'type-import',
                'type-external',
                'type-vue-components',
                'type-internal',
                'type-parent',
                'type-sibling',
                'type-index',
            ],
            'builtin',
            'value-external',
            'value-vue-components',
            'value-internal',
            ['value-parent', 'value-sibling'],
            'index',
            'ts-equals-import',
            'unknown',
        ],
        customGroups: [{
            groupName: 'type-vue-components',
            selector: 'type',
            elementNamePattern: ['\\.(svg|vue)$'],
        }, {
            groupName: 'value-vue-components',
            elementNamePattern: ['\\.(svg|vue)$'],
        }],
        newlinesInside: 1,
        partitions: {
            orderBy: 'type-first',
            splitBy: {
                comments: false,
                newlines: true,
            },
        },
    }],
};

const typescriptRules = {
    '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
    }],
    '@typescript-eslint/no-empty-function': 'off',
};

export default [
    {
        ignores: ['**/dist/**'],
    },
    {
        ...jsonPlugin.configs.recommended,
        files: ['cases/**/*.json'],
    },
    {
        files: ['cases/**/*.{js,ts}'],
        languageOptions: {
            parser: tsParser,
            sourceType: 'module',
            globals: globals.browser,
        },
        plugins: {
            dependencies: dependenciesPlugin,
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
            'unused-imports': unusedImportsPlugin,
        },
        rules: {
            ...tsRecommendedRules,
            ...commonRules,
            ...importSortingRules,
            ...typescriptRules,
        },
    },
    ...vuePlugin.configs['flat/recommended'].map((config) => ({
        ...config,
        files: ['cases/**/*.vue'],
        languageOptions: {
            ...config.languageOptions,
            globals: globals.browser,
            parserOptions: {
                ...config.languageOptions?.parserOptions,
                parser: tsParser,
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
    })),
    {
        files: ['cases/**/*.vue'],
        languageOptions: {
            parser: vueParser,
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                parser: tsParser,
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
        },
        plugins: {
            dependencies: dependenciesPlugin,
            '@typescript-eslint': tsPlugin,
            import: importPlugin,
            'unused-imports': unusedImportsPlugin,
            vue: vuePlugin,
        },
        rules: {
            ...tsRecommendedRules,
            ...commonRules,
            ...importSortingRules,
            ...vueRules,
            ...typescriptRules,
        },
    },
];
