// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
export default {
    entry: './src/index.ts',
    format: 'cjs',
    plugins: [
        resolve(),
        typescript(),
        uglify(),
    ],
    dest: './dist/index.js',
    moduleName: 'PureVxom',
    sourceMap: true
}