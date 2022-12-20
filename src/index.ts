import generator, { Entity, WebSocketInterface } from 'megalodon'
import { TweetV1 } from 'twitter-api-v2'

import { MediaDownloadResult, MediaManipResult } from './types/media'
import { downloadAttachment } from './util/downloadAttachment'
import { manipImage } from './util/manipImage'
import Twitter from './util/twitter'
import env from './util/env'

const BASE_URL: string = `wss://${process.env.MASTODON_INSTANCE}`

const client = generator('mastodon', BASE_URL, process.env.MASTODON_ACCESS_TOKEN)
const stream: WebSocketInterface = client.userSocket()

const twitter = new Twitter()

stream.on('connect', () => {
  console.log('connect')
})

stream.on('update', async (status: Entity.Status) => {
  const { account, content, media_attachments, id } = status;

  if (account.username === env.MASTODON_USERNAME && media_attachments.length > 0) {
    // strip HTML tags -- less than ideal, but it works
    const plainContent = content.replace(/<\/?[^>]+(>|$)/g, " ").trim().replace("  ", "\n")
    const maskedMastodonLink = `${env.MASTODON_MASK_URL}/${id}`
    const tweetBody = `${plainContent}\n\n${maskedMastodonLink}`
    const downloads: Promise<MediaDownloadResult>[] = media_attachments.map(downloadAttachment)
  
    // download all media_attachments
    Promise.all(downloads).then((fileDownloads: MediaDownloadResult[]) => {
      console.log({fileDownloads})

      // manipulate images
      const manips: Promise<MediaManipResult>[] = fileDownloads.map(manipImage)
      Promise.all(manips).then((manipResponses: MediaManipResult[]) => {
        console.log({manipResponses})

        // upload manipulated images to Twitter
        const twitterUploads = manipResponses.map(twitter.uploadImage)
        Promise.all(twitterUploads).then((imageIds: string[]) => {

          // send tweet
          twitter.tweetWithMedia(tweetBody, imageIds).then((tweet: TweetV1) => {
            console.log({tweet})
          })
        })
      })
    })

  }
})