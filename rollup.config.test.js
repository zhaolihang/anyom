// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
export default {
    entry: './src/test/index.tsx',
    format: 'umd',
    plugins: [ //注意插件使用顺序
        resolve({}),
        commonjs(),
        typescript({
            typescript: require('typescript'),
        }),
        babel({
            exclude: 'node_modules/**'
        }),
    ],
    dest: './disttest/index.js',
    moduleName: 'Anyomtest',
    sourceMap: true,
    context: 'window',
}