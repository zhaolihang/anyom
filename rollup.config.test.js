// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
export default {
    entry: './babelworkplace/test/index.jsx',
    format: 'umd',
    plugins: [
        resolve({
            extensions:['.js','.jsx']
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        }),
    ],
    dest: './disttest/index.js',
    moduleName: 'Anyomtest',
    sourceMap: true,
    context:'window',
}