const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    // 入口文件
    entry: './index.js',

    // 输出文件
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.cjs'
    },

    mode: IS_DEV ? 'development': 'production',

    // 目标环境
    target: 'node',

    externalsPresets: { node: true },

    plugins: [
        new CleanWebpackPlugin(),
    ].concat(IS_DEV ? [] : [
        new webpack.ProgressPlugin(),
    ]),
    // 排除 node_modules 目录中的所有模块
    externals: [
        nodeExternals({
            allowlist: [/dify\-client/i]
        }),
    ],

    // 模块规则
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { modules: false }] // 禁用 Babel 转换 ES6 模块语法
                        ]
                    }
                }
            }
        ]
    },

    // 优化
    optimization: {
        minimize: true,
        usedExports: true // 启用 Tree Shaking
    },

    watch: IS_DEV,
};
