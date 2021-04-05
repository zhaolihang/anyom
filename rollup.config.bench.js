// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import uglify from 'rollup-plugin-uglify';
import replacePlugin from 'rollup-plugin-replace';

export default {
    entry: './src/bench/index.tsx',
    format: 'umd',
    plugins: [
        resolve({}),
        commonjs(),
        typescript({ //  to es5 
            typescript: require('typescript'),
        }),
        replacePlugin({
            "process.env.NODE_ENV": JSON.stringify('dev')
        }),
        uglify(),
    ],
    dest: './distbench/index.js',
    moduleName: 'AnyOMBench',
    sourceMap: true,
    context: 'window',
}