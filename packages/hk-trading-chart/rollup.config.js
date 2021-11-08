import {babel} from '@rollup/plugin-babel'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
// import commonjs from '@rollup/plugin-commonjs'
import path from 'path'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

const demoExternalPackages = ['hk-trading-contract']

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
    // commonjs({
    //     exclude: [
    //         'src/**',
    //     ],
    // }),
    json(),
]

export default [
    {
        input:  './src/index.ts',
        output: {
            name: 'hk-trading-chart',
            file: './dist/hk-trading-chart.esm.js',
            format: 'es',
            sourcemap: true,
        },
        plugins
    },
    {
        input:  './src/index.ts',
        output: {
            name: 'hk-trading-chart',
            file: './dist/hk-trading-chart.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
        plugins
    },
    {
        input: './src/index.ts',
        output: {
            file: './dist/hk-trading-chart.iife.js',
            format: 'iife',
            esModule: false,
            sourcemap: true,
        },
        plugins
    },
    // {
    //     input: './samples/src/index.ts',
    //     output: {
    //         file: './samples/dist/hk-trading-chart-demo.cjs.js',
    //         format: 'cjs',
    //         esModule: false,
    //         sourcemap: true,
    //     },
    //     plugins
    // },
    {
        input: {
            InitialData: './samples/src/InitialData.ts',
        },
        output: {
            // file: './samples/dist/hk-trading-chart-demo.iife.js',
            dir: './samples/dist/',
            format: 'iife',
            esModule: false,
            sourcemap: true,
        },
        plugins,
        external: demoExternalPackages
    }
]