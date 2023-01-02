import { defineConfig } from 'vite'
import { napiImage } from 'rollup-plugin-napi-image'

export default defineConfig({
  plugins: [
    napiImage({
      type: 'lossy',
      quality: 75,
    }),
  ],
})
