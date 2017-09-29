// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: './src/bench/index.tsx',
    format: 'umd',
    plugins: [
        resolve({}),
        commonjs(),
        typescript({
            typescript: require('typescript'),
        }),
        babel({
            exclude: 'node_modules/**'
        }),
        uglify(),
    ],
    dest: './distbench/index.js',
    moduleName: 'Anyombench',
    sourceMap: true,
    context: 'window',
}