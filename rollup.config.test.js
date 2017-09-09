// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
export default {
    entry: './src/test/test.tsx',
    format: 'umd',
    plugins: [
        resolve(),
        typescript(),
    ],
    dest: './disttest/test.js',
    moduleName: 'test',
    sourceMap: true
}