const { resolve } = require('path');
const helpers = require('./helpers');
const rxPaths = require('rxjs/_esm5/path-mapping');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { CleanCssWebpackPlugin } = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/cleancss-webpack-plugin');
const { AngularCompilerPlugin } = require('@ngtools/webpack');
const { IndexHtmlWebpackPlugin } = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/index-html-webpack-plugin');
const { SuppressExtractedTextChunksWebpackPlugin } = require('@angular-devkit/build-angular/src/angular-cli-files/plugins/suppress-entry-chunks-webpack-plugin');
const { HashedModuleIdsPlugin } = require('webpack');

module.exports = {
    mode: 'development',

    entry: {
        main: './src/main.ts',
        polyfills: './src/polyfills.ts',
        styles: './src/styles.scss'
    },

    output: {
        path: resolve('./dist'),
        filename: '[name].js',
    },

    resolve: {
        extensions: ['.ts', '.js', '.scss'],
        alias: rxPaths()
    },

    node: false,

    performance: {
        hints: false,
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'raw-loader'
            },
            {
                test: /\.ts$/,
                use: '@ngtools/webpack'
            },
            {
                test: /\.js$/,
                loader: '@angular-devkit/build-optimizer/webpack-loader',
                // options: { sourceMap: false }
            },
            {
                test: /\.js$/,
                exclude: /(ngfactory|ngstyle).js$/,
                enforce: 'pre',
                use: 'source-map-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'to-string-loader',
                    'css-loader',
                ],
                exclude: [resolve('./src/styles.scss')]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
                include: [resolve('./src/styles.scss')]
            },
            {
                test: /\.css$/,
                use: ['to-string-loader', 'css-loader'],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },            
            {
                test: /\.(eot|svg|cur)$/,
                loader: 'file-loader',
                options: {
                    name: `[name].[ext]`,
                    limit: 10000
                }
            },
            {
                test: /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
                loader: 'url-loader',
                options: {
                    name: `[name].[ext]`,
                    limit: 10000
                }
            },

            // This hides some deprecation warnings that Webpack throws
            {
                test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                parser: { system: true },
            }
        ]
    },

    optimization: {
        noEmitOnErrors: true,
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                default: {
                    chunks: 'async',
                    minChunks: 2,
                    priority: 10
                },
                common: {
                    name: 'common',
                    chunks: 'async',
                    minChunks: 2,
                    enforce: true,
                    priority: 5
                },
                vendors: false,
                vendor: false
            }
        },
        minimizer: [
            new HashedModuleIdsPlugin(),

            new CleanCssWebpackPlugin({
                sourceMap: false,
                test: (file) => /\.(?:css)$/.test(file),
            })
        ]
    },

    plugins: [
        new IndexHtmlWebpackPlugin({
            input: resolve('./src/index.html'),
            output: 'index.html',
            entrypoints: [
                'styles',
                'polyfills',
                'main',
            ]
        }),

        new AngularCompilerPlugin({
            mainPath: resolve('./src/main.ts'),
            sourceMap: true,
            nameLazyFiles: true,
            tsConfigPath: resolve('./tsconfig.json'),
            skipCodeGeneration: false,
            hostReplacementPaths: {
                [resolve('src/environments/environment.ts')]: resolve('src/environments/environment.prod.ts')
            }
        }),

        new MiniCssExtractPlugin({ filename: '[name].css' }),

        new SuppressExtractedTextChunksWebpackPlugin(),

        new ProgressPlugin(),

        new CircularDependencyPlugin({
            exclude: /[\\\/]node_modules[\\\/]/
        }),

        new CopyWebpackPlugin([
            {
                from: 'src/assets',
                to: 'assets'
            },
            {
                from: 'src/favicon.ico'
            }
        ])
    ]
};