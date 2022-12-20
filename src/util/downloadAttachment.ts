import * as Path from 'path'
import * as fs from 'fs'
import axios from 'axios'
import { MediaDownloadResult } from '../types/media'

const downloadAttachment = async (attachment: Entity.Attachment): Promise<MediaDownloadResult> => {  
  const { url } = attachment
  const fileName = url.split('/').at(-1)
  const path = Path.resolve(__dirname, '../../tmp', fileName)
  const writer = fs.createWriteStream(path)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return { path, response }
}

export { downloadAttachment }