// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import uglify from 'rollup-plugin-uglify';
import replacePlugin from 'rollup-plugin-replace';

export default {
    entry: './src/core/index.ts',
    format: 'cjs',
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            typescript: require('typescript'),
        }),
        // uglify(),

        replacePlugin({
            "process.env.NODE_ENV": JSON.stringify('dev')
        }),
    ],
    dest: './dist/index.js',
    moduleName: 'AnyUI',
    sourceMap: true,
    exports: 'named',
}