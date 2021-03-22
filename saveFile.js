import * as fs from 'fs';
import * as path from 'path';
import request from 'request'

const baseDir = path.resolve(`${path.resolve()}/out`)

export function saveFile(fileName, buf) {
  console.log({fileName, buf})
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}




export const download = (url) => {
  const selfiePath = path.resolve(`${path.resolve()}/selfie`)
  if (!fs.existsSync(selfiePath)) {
    fs.mkdirSync(selfiePath)
  }
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(selfiePath))
  })
}

// download(url, selfiePath, () => {
//   console.log('✅ Done!')
// })

