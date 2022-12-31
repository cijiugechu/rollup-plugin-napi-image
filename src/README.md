# rollup-plugin-napi-image
Rollup plugin for optimizing images using [@napi-rs/image](https://github.com/Brooooooklyn/Image)

## Usage

### 1. install

```shell
npm install rollup-plugin-napi-image --save-dev
# or you use pnpm 
pnpm add  rollup-plugin-napi-image -D
```

### 2. add plugin to your config file

- if you are using `rollup`, import this plugin and add to `plugins` field like following:

```typescript
import { defineConfig } from 'rollup'
import { napiImage } from 'rollup-plugin-napi-image'
// ... other lines

export default defineConfig({
    plugins: [
        /* other plugins */
        napiImage({
            type: 'lossy',
            quality: 75
        })
    ]
})

```

- if you are using `vite` , just replace the first line of above with `import { defineConfig } from 'vite'`


### 3. options

| name | type  | default  | description |
| :-   | :-    |  :-      | :-          |
|`include` | `RegExp \| string \| Array<string \| RegExp>`  | null | A picomatch pattern, or array of patterns, which specifies the files in the build the plugin should operate on. By default all supported images are targeted. |
| `exclude` | `RegExp \| string \| Array<string \| RegExp>` | null | A picomatch pattern, or array of patterns, which specifies the files in the build the plugin should ignore. By default no images are ignored. |
| `type` | `'lossy' \| 'lossless'` | | The optimization type applied to images, when `type` is `lossy` , you can specify `quality` for the process. |
| `quality` | `number` | 75 | Only works when `type` is `lossy`. |

### 4. supported formats

current supported formats:
1. `jpg/jpeg`
2. `png`
3. `webp` 
4. `avif`

## License

MIT &copy; [nemurubaka](https://github.com/cijiugechu)
