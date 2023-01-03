import { readdir } from 'fs/promises'
import { resolve } from 'path'

export const findFile = (dir, ext) => {
  return readdir(dir).then(filenames => {
    return resolve(
      dir,
      filenames.find(filename => filename.endsWith(ext))
    )
  })
}
