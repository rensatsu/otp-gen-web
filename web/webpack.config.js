const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
    const IS_PROD = 'production' in env && env.production;

    const APP_NAME = 'OTP Generator';
    const APP_SHORT_NAME = 'OTP Gen';
    const APP_URL = IS_PROD ? 'https://ren-otp.gitlab.io/app/' : 'https://otp.rencloud.xyz';

    return {
        entry: './src/index.js',
        mode: env.production ? 'production' : 'development',
        output: {
            filename: 'app.js',
            path: path.resolve(__dirname, 'dist')
        },
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 29998
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader', // creates style nodes from JS strings
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
                cleanOnceBeforeBuildPatterns: ['**/*', '!index.html', '!index.dev.html'],
            }),
            new HtmlWebpackPlugin({
                title: APP_NAME,
                short_name: APP_SHORT_NAME,
                template: './dist/index.html',
                favicon: path.resolve('./src/img/icon/icon.png'),
            }),
            new WorkboxPlugin.GenerateSW({
                clientsClaim: true,
                skipWaiting: true
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
        ],
    };
};
