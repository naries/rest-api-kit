import { defineConfig } from 'tsup'

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: ['./src/index.ts'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    target: 'es2018',
    external: ['react', 'react-native'],
    splitting: false,
    sourcemap: true,
    minify: false,
    treeshake: true,
    outExtension({ format }) {
        return {
            js: format === 'cjs' ? '.js' : '.mjs'
        }
    }
})