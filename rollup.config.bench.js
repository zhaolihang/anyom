// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
export default {
    entry: './babelworkplace/bench/index.jsx',
    format: 'umd',
    plugins: [
        resolve({
            extensions:['.js','.jsx']
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        }),
        uglify(),
    ],
    dest: './distbench/index.js',
    moduleName: 'Anyombench',
    sourceMap: true,
}