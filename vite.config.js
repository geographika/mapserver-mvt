import copy from 'rollup-plugin-copy'

export default {
  base: '', // otherwise assets are located at /assets
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
