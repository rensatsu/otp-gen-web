const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {
    const IS_PROD = 'production' in env && env.production;

    const APP_NAME = 'OTP Generator';
    const APP_SHORT_NAME = 'OTP Gen';
    const APP_URL = IS_PROD ? 'https://ren-otp.netlify.com/' : 'https://otp.rencloud.xyz';
    const TARGET_PATH = path.resolve(__dirname, 'dist');

    console.info('Building', APP_NAME, 'on', IS_PROD ? 'prod' : 'dev');

    const webpackParams = {
        entry: './src/index.js',
        mode: IS_PROD ? 'production' : 'development',
        output: {
            filename: 'app.js',
            path: TARGET_PATH
        },
        optimization: {
            splitChunks: {
                chunks: 'all'
            },
            usedExports: true,
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            host: '0.0.0.0',
            port: 29998
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: !IS_PROD,
                            },
                        },
                        'css-loader', // translates CSS into CommonJS
                        'sass-loader', // compiles Sass to CSS, using Node Sass by default
                    ],
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [
                        'file-loader'
                    ]
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: ['**/*'],
            }),
            new HtmlWebpackPlugin({
                title: APP_NAME,
                short_name: APP_SHORT_NAME,
                template: './index.html',
                favicon: path.resolve('./src/img/icon/icon.png'),
            }),
            new WorkboxPlugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true,
                importWorkboxFrom: 'local',
            }),
            new WebpackPwaManifest({
                name: APP_NAME,
                short_name: APP_SHORT_NAME,
                description: 'TOTP Code Generator',
                lang: 'en-US',
                start_url: APP_URL,
                display: 'standalone',
                theme_color: '#0d47a1',
                background_color: '#eeeeee',
                crossorigin: null,
                fingerprints: false,
                inject: true,
                icons: [
                    {
                        src: path.resolve('./src/img/icon/icon.png'),
                        sizes: [16, 20, 96, 128, 192, 256, 384, 512],
                        inject: true,
                    },
                    {
                        src: path.resolve('./src/img/icon/icon.svg'),
                        sizes: [512],
                        inject: true,
                    }
                ]
            }),
            new CopyPlugin([
                { from: path.resolve('./_headers'), to: TARGET_PATH },
            ]),
            new MiniCssExtractPlugin({
                filename: IS_PROD ? '[name].[hash].css' : '[name].css',
                chunkFilename: IS_PROD ? '[id].[hash].css' : '[id].css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
            }),
        ],
    };

    if (!IS_PROD) {
        webpackParams.devtool = 'inline-source-map';
    }

    return webpackParams;
};
