import test from 'ava'
import { build } from 'vite'
import { readFile, rm } from 'fs/promises'
import { resolve } from 'path'
import { cwd } from 'process'
import { fileURLToPath } from 'url'
import { napiImage } from 'rollup-plugin-napi-image'
import { findFile } from './utils.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const PNG = await readFile(resolve(cwd(), './src/un-optimized.png'))
const JPG = await readFile(resolve(cwd(), './src/un-optimized.jpg'))

test('should be able to lossless optimize png image', async t => {
  await build({
    build: {
      outDir: '__test__/dist1',
      emptyOutDir: false,
    },
    plugins: [
      napiImage({
        type: 'lossless',
      }),
    ],
  })

  const pngPath = await findFile(resolve(__dirname, 'dist1/assets'), 'png')

  const compressedPNG = await readFile(pngPath)

  t.true(compressedPNG.length < PNG.length)

  t.teardown(async () => {
    await rm(resolve(__dirname, 'dist1'), { recursive: true, force: true })
  })
})

test('should be able to lossless optimize jpg image', async t => {
  await build({
    build: {
      outDir: '__test__/dist2',
      emptyOutDir: false,
    },
    plugins: [
      napiImage({
        type: 'lossless',
      }),
    ],
  })

  const jpgPath = await findFile(resolve(__dirname, 'dist2/assets'), 'jpg')

  const compressedJPG = await readFile(jpgPath)

  t.true(compressedJPG.length < JPG.length)

  t.teardown(async () => {
    await rm(resolve(__dirname, 'dist2'), { recursive: true, force: true })
  })
})

test('should be able to lossy optimize png image', async t => {
  await build({
    build: {
      outDir: '__test__/dist3',
      emptyOutDir: false,
    },
    plugins: [
      napiImage({
        type: 'lossy',
        quality: 75,
      }),
    ],
  })

  const pngPath = await findFile(resolve(__dirname, 'dist3/assets'), 'png')

  const compressedPNG = await readFile(pngPath)

  t.true(compressedPNG.length < PNG.length)

  t.teardown(async () => {
    await rm(resolve(__dirname, 'dist3'), { recursive: true, force: true })
  })
})

test('should be able to lossy optimize jpg image', async t => {
  await build({
    build: {
      outDir: '__test__/dist4',
      emptyOutDir: false,
    },
    plugins: [
      napiImage({
        type: 'lossy',
        quality: 75,
      }),
    ],
  })

  const jpgPath = await findFile(resolve(__dirname, 'dist4/assets'), 'jpg')

  const compressedJPG = await readFile(jpgPath)

  t.true(compressedJPG.length < JPG.length)

  t.teardown(async () => {
    await rm(resolve(__dirname, 'dist4'), { recursive: true, force: true })
  })
})
