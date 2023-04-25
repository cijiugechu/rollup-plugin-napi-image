import type { Plugin } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import {
  Transformer,
  losslessCompressPng,
  pngQuantize,
  compressJpeg,
} from '@napi-rs/image'
import { extname } from 'path'

type Pattern = RegExp | string | Array<string | RegExp>

type SupportedExt = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'

type ModernExt = 'webp' | 'avif'

type ToModernExt = (ext: SupportedExt) => ModernExt

type LosslessOptions = {
  include?: Pattern
  exclude?: Pattern
  toModernExt?: ToModernExt
  mode: 'lossless'
}

type LossyOptions = {
  include?: Pattern
  exclude?: Pattern
  toModernExt?: ToModernExt
  quality?: number
  mode: 'lossy'
}

export type Options = LosslessOptions | LossyOptions

const supportedExt = ['jpg', 'jpeg', 'png', 'webp', 'avif']

const isSupportedExt = (filename: string) => {
  return supportedExt.some(ext => filename.endsWith(ext))
}

//@ts-ignore
const transparent: ToModernExt = ext => ext

const replaceExt = (filename: string, ext: SupportedExt) => {
  const splitted = filename.split('.')

  return [...splitted.slice(0, -1), ext].join('.')
}

const napiMap = {
  jpg: {
    lossless: (buf: Buffer) => compressJpeg(buf),
    lossy: (buf: Buffer, quality?: number) => compressJpeg(buf, { quality }),
  },
  jpeg: {
    lossless: (buf: Buffer) => compressJpeg(buf),
    lossy: (buf: Buffer, quality?: number) => compressJpeg(buf, { quality }),
  },
  png: {
    lossless: (buf: Buffer) => losslessCompressPng(buf),
    lossy: (buf: Buffer, quality?: number) =>
      pngQuantize(buf, { maxQuality: quality }),
  },
  webp: {
    lossless: (buf: Buffer) => new Transformer(buf).webpLossless(),
    lossy: (buf: Buffer, quality?: number) =>
      new Transformer(buf).webp(quality),
  },
  avif: {
    lossless: (buf: Buffer) => new Transformer(buf).avif({ quality: 100 }),
    lossy: (buf: Buffer, quality?: number) =>
      new Transformer(buf).avif({ quality }),
  },
}

export const napiImage = (options: Options): Plugin => {
  const { include, exclude, mode, toModernExt = transparent } = options

  const filter = createFilter(include, exclude)

  const bucket = new Map<
    string,
    {
      source?: Buffer
    }
  >()

  return {
    name: 'rollup-plugin-napi-image',

    async generateBundle(_, bundles) {
      for (const [filename, output] of Object.entries(bundles)) {
        if (!filter(filename)) {
          continue
        }

        if (output.type === 'chunk') {
          continue
        }

        if (!isSupportedExt(filename)) {
          continue
        }

        bucket.set(filename, {
          source: Buffer.from(output.source),
        })
      }

      try {
        const filenames = Array.from(bucket.keys())

        await Promise.all(
          filenames.map(async filename => {
            const { source } = bucket.get(filename) ?? {}

            const ext = extname(filename).replace('.', '')

            if (ext && source) {
              let compressed: Buffer
              const outExt = toModernExt(ext as SupportedExt)

              if (mode === 'lossy') {
                compressed = await napiMap[outExt][mode](
                  source,
                  options?.quality
                )
              } else {
                compressed = await napiMap[outExt][mode](source)
              }

              // ensure that compressed size is smaller than original size
              if (compressed.length < source.length) {
                // only emit once
                delete bundles[filename]

                this.emitFile({
                  type: 'asset',
                  source: compressed,
                  fileName: replaceExt(filename, outExt),
                })
              }
            }
          })
        )
      } catch (error: any) {
        this.error(error)
      }
    },

    closeBundle() {
      bucket.clear()
    },
  }
}
