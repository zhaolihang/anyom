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
        typescript({ //  to es6 
            typescript: require('typescript'),
            target: "es6",
        }),
        babel({
            exclude: 'node_modules/**',
            plugins: [
                'anyom',  // compiled code contains arrowFunction
                [
                    "transform-react-jsx",
                    {
                        "pragma": "h", // default pragma is React.createElement
                        "useBuiltIns": true
                    }
                ]
            ],
        }),
        typescript({//  to es5 
            typescript: require('typescript'),
            target: "es5",
        }),
    ],
    dest: './disttest/index.js',
    moduleName: 'Anyomtest',
    sourceMap: true,
    context: 'window',
}