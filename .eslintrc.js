module.exports = {
    root: true,
    env: {
        browser: true,
    },
    plugins: [
        '@typescript-eslint',
        'import',
        'json',
        'unused-imports',
    ],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
    ],
    rules: {
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
        'indent': ['error', 4, {
            ignoreComments: true,
            SwitchCase: 1,
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
        'no-throw-literal': 'error',
        'object-curly-spacing': ['error', 'always'],
        'padded-blocks': ['error', 'never'],
        'quotes': ['error', 'single'],

        'import/export': 'error',
        'import/newline-after-import': 'error',
        'import/no-absolute-path': 'error',
        'import/no-cycle': 'error',
        'import/no-empty-named-blocks': 'error',
        'import/no-extraneous-dependencies': 'error',
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': 'error',

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
            'attribute': 1,
            'closeBracket': 0,
            'alignAttributesVertically': true,
            'ignores': [],
        }],
        'vue/html-self-closing': ['error', {
            'html': {
                'void': 'always',
                'normal': 'always',
                'component': 'always',
            },
            'svg': 'always',
            'math': 'always',
        }],
        'vue/max-attributes-per-line': ['error', {
            singleline: 4,
            multiline: 1,
        }],

        '@typescript-eslint/consistent-type-imports': ['error', {
            prefer: 'type-imports',
        }],
        '@typescript-eslint/no-empty-function': 'off',
    },
    overrides: [{
        files: ['.eslintrc.js', 'webpack.*.js'],
        env: {
            node: true,
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
        },
    }],
}
