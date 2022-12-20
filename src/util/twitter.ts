import { TweetV1, TwitterApi } from "twitter-api-v2"
import { fromFile as fileTypeFromFile } from 'file-type'

import env from '../util/env'
import { MediaManipResult } from "../types/media"

export default class Twitter {
  api: TwitterApi

  constructor() {
    this.api = new TwitterApi({
      appKey: env.TWITTER_API_KEY,
      appSecret: env.TWITTER_API_SECRET,
      accessToken: env.TWITTER_ACCESS_TOKEN,
      accessSecret: env.TWITTER_ACCESS_SECRET,
    })
    this.uploadImage = this.uploadImage.bind(this)
    this.tweetWithMedia = this.tweetWithMedia.bind(this)
  }

  public async uploadImage (manipResult: MediaManipResult): Promise<string> {
    return await this.api.v1.uploadMedia(manipResult.path, {
      mimeType: (await fileTypeFromFile(manipResult.path)).mime
    })
  }

  public async tweetWithMedia (content: string, imageIds: string[]): Promise<TweetV1> {
    return await this.api.v1.tweet(content, { media_ids: imageIds })
  }
}
