import type { Plugin } from 'rollup'
import { createFilter } from '@rollup/pluginutils'
import { Transformer, losslessCompressPng, pngQuantize } from '@napi-rs/image'

type LosslessOptions = {
    include?: RegExp | string | Array<string | RegExp>
    exclude?: RegExp | string | Array<string | RegExp>
    type: 'lossless'
}

type LossyOptions = {
    include?: RegExp | string | Array<string | RegExp>
    exclude?: RegExp | string | Array<string | RegExp>
    quality?: number
    type: 'lossy'
}

type SupportedExt = 'jpg' | 'jpeg' | 'png' | 'webp'

export type Options = LosslessOptions | LossyOptions


const supportedExt = [
    'jpg',
    'jpeg',
    'png',
    'webp',
    'avif'
]

const isSupportedExt = (filename: string) => {
    return supportedExt.some(ext => filename.endsWith(ext))
}

const getExt = (filename: string) => {
    return filename.split('.').at(-1)
}

const napiMap = {
    'jpg': {
        'lossless': (buf: Buffer) => new Transformer(buf).jpeg(),
        'lossy': (buf: Buffer, quality?: number) => new Transformer(buf).jpeg(quality)
    },
    'jpeg': {
        'lossless': (buf: Buffer) => new Transformer(buf).jpeg(),
        'lossy': (buf: Buffer, quality?: number) => new Transformer(buf).jpeg(quality)
    },
    'png': {
        'lossless': (buf: Buffer) => losslessCompressPng(buf),
        'lossy': (buf: Buffer, quality?: number) => pngQuantize(buf, { maxQuality: quality })
    },
    'webp': {
        'lossless': (buf: Buffer) => new Transformer(buf).webpLossless(),
        'lossy': (buf: Buffer, quality?: number) => new Transformer(buf).webp(quality)
    },
}


export const napiImage = (options: Options): Plugin => {
    const {
        include,
        exclude,
        type
    } = options

    const filter = createFilter(include, exclude)

    const bucket = new Map<string, {
        source?: Buffer
    }>()

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

                bucket.set(
                    filename,
                    {
                        source: Buffer.from(output.source)
                    }
                )
            }

            try {
                const filenames = Array.from(bucket.keys())

                await Promise.all(filenames.map(async (filename) => {
                    const { source } = bucket.get(filename) ?? {}

                    const ext = getExt(filename)

                    if (ext && source) {
                        let compressed: Buffer

                        if (type === 'lossy') {
                            compressed = await napiMap[ext as SupportedExt][type](source, options?.quality)
                        }

                        compressed = await napiMap[ext as SupportedExt][type](source)

                        this.emitFile({ type: 'asset', source: compressed, fileName: filename })
                    }


                }))
            } catch (error: any) {
                this.error(error)
            }
        }


    }
}