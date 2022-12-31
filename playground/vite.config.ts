import { defineConfig } from 'vite'
import { createPlugin } from 'rollup-plugin-napi-image'

export default defineConfig({
  plugins: [createPlugin({})],
})