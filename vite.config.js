import copy from 'rollup-plugin-copy'

export default {
  build: {
    base: '', // otherwise assets are located at /assets
    sourcemap: true,
    rollupOptions: {
      plugins: [
          copy({
              targets: [
                  { src: 'data/*.json', dest: 'dist/data' }
              ],
              hook: 'writeBundle'
          })
      ]
  }    
  }
}
