const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = (env, argv) => {
    return {
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'index.js',
        },
        devtool: argv.mode === 'development' ? 'source-map' : false,
        plugins: [
            new HtmlWebpackPlugin({
                title: "Map Viewer",
                hash: true,
                minify: {
                    minifyJS: true,
                    minifyCSS: true,
                    removeComments: true,
                },
            }),
            new MiniCssExtractPlugin()
        ],
        resolve: {
            extensions: ['.ts', '.js'],
            symlinks: true
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                },
            ],
        },
        devServer: {
            port: 3000,
            static: {
                directory: path.join(__dirname, 'public'),
                watch: false,
            },
        }
    }
}