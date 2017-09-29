// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import uglify from 'rollup-plugin-uglify';
export default {
    entry: './src/index.ts',
    format: 'cjs',
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            typescript: require('typescript'),
        }),
        // uglify(),
    ],
    dest: './dist/index.js',
    moduleName: 'Anyom',
    sourceMap: true,
    exports: 'named',
}