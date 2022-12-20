import { MediaDownloadResult, MediaManipResult } from "../types/media";
import * as sharp from 'sharp'

import env from '../util/env'

const manipImage = async (download: MediaDownloadResult): Promise<MediaManipResult> => {
  return new Promise((resolve, reject) => {
    try {
      let image = sharp(download.path).blur(60)
      const manipPath = getManipPath(download.path)
      
      image.metadata().then((meta: sharp.Metadata) => {
        const textLayer = `
          <svg width="${meta.width}" height="${meta.height}">
            <style>
              .title {
                fill: #fafafa;
                font-size: 70px;
                font-weight: bold;
                font-family: monospace;
                stroke: #000;
                stroke-width: 10px;
                stroke-linecap: butt;
                stroke-linejoin: miter;
                paint-order: stroke;
              }
            </style>
            <text x="50%" y="45%" text-anchor="middle" class="title">
              ${env.SETTINGS_WATERMARK_TEXT}
            </text>
            <text x="50%" y="55%" text-anchor="middle" class="title">
              ${env.MASTODON_INSTANCE}/@${env.MASTODON_USERNAME}
            </text>
          </svg>`
    
        image.composite([
          { input: Buffer.from(textLayer), top: 0, left: 0 }
        ]).toFile(manipPath, (error, sharpData) => {
          if (error) {
            reject(error)
          } else {
            resolve({
              path: manipPath,
              sharpData,
            })
          }
        })
      })
      
    }
    catch (error) {
      reject(error)
    }
  })
}

const getManipPath = (path: string): string => {
  const lastPeriod = path.lastIndexOf('.')
  return `${path.slice(0, lastPeriod)}_manip${path.slice(lastPeriod)}`
}

export { manipImage }