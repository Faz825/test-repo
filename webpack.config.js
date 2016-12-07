var webpack = require('webpack');
var path = require('path');

module.exports =  {
    devtool: 'inline-source-map',
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:8080/',
        'webpack/hot/only-dev-server',
        'app.js'
    ],
    output: {
        path: path.join('./public/web/js/'),
        filename: 'web_bundle.js'
    },
    resolve: {
        modulesDirectories: ['node_modules', './public/app'],
        extension: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015']
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'style!css'
            },
            {
                test: /\.(jpg|png|gif)$/,
                exclude: /node_modules/,
                include: /images/,
                loader: 'url'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    devServer: {
        hot: true,
        proxy: {
            '*': 'http://localhost:3000'
        }
    }

}