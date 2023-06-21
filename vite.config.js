import copy from 'rollup-plugin-copy'
const path = require('path')

export default {
    base: '', // otherwise assets are located at /assets
    root: path.resolve(__dirname, 'src'),
    build: {
        emptyOutDir: true,
        sourcemap: true,
        outDir: '../dist', // otherwise writes to src/dist
        rollupOptions: {
            plugins: [
                copy({
                    targets: [
                        { src: 'src/data/*.*', dest: 'dist/data' }
                    ],
                    hook: 'writeBundle'
                })
            ]
        }
    }
}
