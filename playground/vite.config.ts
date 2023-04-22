import { defineConfig } from 'vite'
import { napiImage } from 'rollup-plugin-napi-image'

export default defineConfig({
  plugins: [
    napiImage({
      mode: 'lossy',
      quality: 75,
    }),
  ],
})
