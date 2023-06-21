import copy from 'rollup-plugin-copy'

export default {
  build: {
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
