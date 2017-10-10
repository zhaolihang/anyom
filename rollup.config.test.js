// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import replacePlugin from 'rollup-plugin-replace';

export default {
    entry: './src/test/index.tsx',
    format: 'umd',
    plugins: [ //注意插件使用顺序
        resolve({}),
        commonjs(),
        typescript({ //  to es5 
            typescript: require('typescript'),
        }),
        replacePlugin({
            "process.env.NODE_ENV": JSON.stringify('dev')
        }),
    ],
    dest: './disttest/index.js',
    moduleName: 'Anyomtest',
    sourceMap: true,
    context: 'window',
}