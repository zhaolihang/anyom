// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
    entry: './src/bench/index.tsx',
    format: 'umd',
    plugins: [
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
        uglify(),
    ],
    dest: './distbench/index.js',
    moduleName: 'Anyombench',
    sourceMap: true,
    context: 'window',
}