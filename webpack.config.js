let path = require('path');
let webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        'turingApp': './src/turing/index.ts'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        sourceMapFilename: '[name].map',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                exclude: /node_modules/,
                include: path.join(__dirname, 'src')
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
                exclude: /node_modules/
            }
        ]
    }
};
