import {babel} from '@rollup/plugin-babel'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const extensions = ['.js', '.ts']

const plugins = [
    nodeResolve({
        mainFields: ['module', 'main', 'jsnext:main', 'browser'],
        extensions,
    }),
    babel({
        exclude: /node_modules/,
        extensions,
        configFile: path.resolve(__dirname, 'babel.config.js'),
    }),
    commonjs({
        exclude: [
            'src/**',
        ],
    }),
    json()
]

const watch = {
    // include and exclude govern which files to watch. by
    // default, all dependencies will be watched
    exclude: ['node_modules/**']
}

export default [
    {
        input:  './src/index.ts',
        output: {
            file: './dist/hk-trading-pricing.esm.js',
            format: 'es',
            sourcemap: true,
        },
        plugins,
        watch
    },
]