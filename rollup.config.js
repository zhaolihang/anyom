// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
export default {
    entry: './src/index.ts',
    format: 'umd',
    plugins: [
        resolve(),
        typescript(),
    ],
    dest: './dist/index.js',
    moduleName: 'PureVxom',
    sourceMap: true
}