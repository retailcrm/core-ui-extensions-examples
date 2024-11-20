const glob = require('glob')
const path = require('path')
const readline = require('readline')
const webpack = require('webpack')

const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const CSSExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin').WebpackManifestPlugin
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const { VueLoaderPlugin } = require('vue-loader')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

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

const entryPoints = glob.sync('cases/*/index.ts').reduce((entries, file) => {
    const match = file.match(/^cases\/([^/]+)\/index\.ts$/)

    if (match) {
        entries[match[1]] = path.resolve(__dirname, file)
    }

    return entries
}, {})

const HtmlWebpackPlugins = Object.keys(entryPoints).map(entryName => {
    return new HtmlWebpackPlugin({
        title: `UI Extension: ${entryName}`,
        filename: `${entryName}/index.html`,
        chunks: [entryName],
    });
})

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production'

    return {
        mode: isProduction ? 'production' : 'development',

        context: __dirname,

        entry: entryPoints,

        output: {
            filename: '[name]/extension.[fullhash].js',
            chunkFilename: '[name]/extension.[fullhash].js',
            path: path.resolve(__dirname, 'dist/'),
            pathinfo: true,
            publicPath: '/dist/',
        },

        resolve: {
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

        devtool: isProduction ? false : 'inline-source-map',

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
                filename: '[name]/extension.[contenthash:8].css',
                chunkFilename: '[name]/extension.[contenthash:8].css',
            }),
            new RemoveEmptyScriptsPlugin(),
            new VueLoaderPlugin(),
            new webpack.ProgressPlugin((percentage, message) => {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(`${Math.round(percentage * 100)}% ${message}`);
            }),
            ...HtmlWebpackPlugins,
        ],

        module: {
            rules: [{
                test: /\.(woff|woff2|ttf|eot|otf)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[contenthash:8][ext]',
                },
            }, {
                test: /\.(png|jpg|jpeg|gif|ico|webp)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[name].[contenthash:8][ext]',
                },
            }, {
                test: /\.svg$/,
                use: ['vue-loader', 'vue-svg-loader'],
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

        optimization: isProduction ? {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                        },
                    },
                }),
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: [
                            'default',
                            {
                                discardComments: {
                                    removeAll: true,
                                },
                            },
                        ],
                    },
                }),
            ],
        } : {},
    }
}
