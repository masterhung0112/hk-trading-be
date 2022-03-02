import {babel} from '@rollup/plugin-babel'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'

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
            file: './dist/hk-utils.cjs.js',
            format: 'cjs',
            sourcemap: true,
        },
        plugins,
    },
    {
        input:  './src/index.ts',
        output: {
            file: './dist/hk-utils.esm.js',
            format: 'es',
            sourcemap: true,
        },
        plugins,
        watch
    },
    {
        input: './src/index.ts',
        output: [{ file: 'dist/hk-utils.d.ts', format: 'es' }],
        plugins: [dts()],
      },
]