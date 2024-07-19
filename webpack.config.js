const path = require('path')
const readline = require('readline')
const webpack = require('webpack')

const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const CSSExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ManifestPlugin = require('webpack-manifest-plugin').WebpackManifestPlugin
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const { VueLoaderPlugin } = require('vue-loader')

require('dotenv').config({ path: '.env' })

const babelLoader = {
    loader: 'babel-loader',
    options: {
        cacheDirectory: true,
        presets: [['@babel/preset-env', {
            corejs: 3,
            forceAllTransforms: false,
            modules: false,
            targets: {},
            useBuiltIns: 'entry',
        }]],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-transform-classes',
        ],
    },
}

const cssExtractLoader = {
    loader: CSSExtractPlugin.loader,
    options: {
        esModule: false,
    },
}

const lessLoader = {
    loader: 'less-loader',
    options: {
        sourceMap: true,
    },
}

const cssModular = [cssExtractLoader, {
    loader: require.resolve('css-loader'),
    options: {
        modules: {
            localIdentName: '[local]_[hash:base64:5]',
        },
        sourceMap: true,
        importLoaders: 1,
    },
}]

const cssRegular = [cssExtractLoader, {
    loader: require.resolve('css-loader'),
    options: {
        sourceMap: true,
        importLoaders: 1,
    },
}]

module.exports = {
    mode: 'development',

    context: __dirname,

    entry: {
        'extension': [
            './src/extension.js',
        ],
        'extension-that-fails-on-run': [
            './src/extension-that-fails-on-run.js',
        ],
    },

    output: {
        filename: '[name].[fullhash].js',
        chunkFilename: '[name].[fullhash].js',
        path: path.resolve(__dirname, 'dist/'),
        pathinfo: true,
        publicPath: '/dist/',
    },

    resolve: {
        alias: {
            '@': path.join(__dirname, './src/'),
        },

        extensions: [
            '.wasm',
            '.mjs',
            '.js',
            '.json',
            '.jsx',
            '.vue',
            '.ts',
            '.tsx',
        ],
    },

    devtool: process.env.WEBPACK_DEVTOOL || 'inline-source-map',

    plugins: [
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: JSON.stringify(false),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true),
        }),
        new CleanPlugin(),
        new ManifestPlugin({
            basePath: 'dist/',
            writeToFileEmit: true,
        }),
        new CSSExtractPlugin({
            filename: '[name].[hash:8].css',
            chunkFilename: '[name].[hash:8].css',
        }),
        new RemoveEmptyScriptsPlugin(),
        new VueLoaderPlugin(),
        new webpack.ProgressPlugin((percentage, message) => {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0, null);
            process.stdout.write(`${Math.round(percentage * 100)}% ${message}`);
        }),
        new HtmlWebpackPlugin({
            title: 'UI Extension: Yandex Maps',
            publicPath: './',
        }),
    ],

    module: {
        rules: [{
            test: /\.(woff|woff2|ttf|eot|otf)$/,
            type: 'asset/resource',
            generator: {
                filename: 'fonts/[name].[hash:8][ext]',
            },
        }, {
            test: /\.(png|jpg|jpeg|gif|ico|svg|webp)$/,
            type: 'asset/resource',
            generator: {
                filename: 'images/[name].[hash:8][ext]',
            },
            exclude: path.resolve(__dirname, '../web/img2/svg-sprite/'),
        }, {
            test: /\.m?js/,
            resolve: { fullySpecified: false },
        }, {
            test: /\.m?jsx?$/,
            exclude: /node_modules/,
            use: [babelLoader],
        }, {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [babelLoader, {
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            }],
        }, {
            test: /\.css$/,
            oneOf: [{
                resourceQuery: /module/,
                use: cssModular,
            }, {
                use: cssRegular,
            }],
        }, {
            test: /\.less/,
            oneOf: [{
                resourceQuery: /module/,
                use: [...cssModular, lessLoader],
            }, {
                use: [...cssRegular, lessLoader],
            }],
        }, {
            test: /\.vue$/,
            use: [{
                loader: 'vue-loader',
            }],
        }, {
            resourceQuery: /blockType=i18n/,
            type: 'javascript/auto',
            loader: '@intlify/vue-i18n-loader',
        }],
    },


    cache: {
        type: 'filesystem',
        buildDependencies: { config: [__filename] },
    },

    performance: {
        hints: false,
    },

    stats: {
        assets: false,
        builtAt: false,
        children: false,
        chunks: false,
        errorDetails: true,
        errorStack: true,
        entrypoints: true,
        hash: false,
        modules: false,
        publicPath: false,
        reasons: false,
        source: false,
        timings: true,
        version: false,
        warnings: false,
    },
}
