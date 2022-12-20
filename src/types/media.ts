import { AxiosResponse } from "axios";
import * as sharp from "sharp";

type MediaDownloadResult = {
  path: string;
  response: AxiosResponse;
}

type MediaManipResult = {
  path: string;
  sharpData: sharp.OutputInfo;
}

export { MediaDownloadResult, MediaManipResult }