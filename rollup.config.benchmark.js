// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
export default {
    entry: './src/bench/benchmark.tsx',
    format: 'umd',
    plugins: [
        resolve(),
        commonjs(),
        typescript(),
        uglify(),
    ],
    dest: './distbench/index.js',
    moduleName: 'benchmark',
    sourceMap: true
}