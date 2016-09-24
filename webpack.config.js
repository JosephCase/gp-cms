var path = require('path');
// var webpack = require('webpack');

module.exports = {
    entry: {
        login: './static/jsx/login.jsx',
        home: './static/jsx/home.jsx'
    },
    output: { path: path.join(__dirname, 'static/script/'), filename: '[name].js' },
    module: {
        loaders: [{
            test: /.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react', 'stage-2']
            }
        }]
    }
 //    ,
	// plugins: [
	// 	new webpack.optimize.UglifyJsPlugin({
	// 		compress: {
	// 			warnings: true
	// 		},
	// 		output: {
	// 			comments: false
	// 		}
	// 	})
	// ]
};
