import type { SocialNetwork } from "@/types/app";

import { facebookService } from "./facebook.service";
import { instagramService } from "./instagram.service";
import { linkedinService } from "./linkedin.service";
import { pinterestService } from "./pinterest.service";
import { threadsService } from "./threads.service";
import { tiktokService } from "./tiktok.service";
import { xService } from "./x.service";
import { youtubeService } from "./youtube.service";

export const socialServices = {
  instagram: instagramService,
  facebook: facebookService,
  threads: threadsService,
  linkedin: linkedinService,
  tiktok: tiktokService,
  youtube: youtubeService,
  x: xService,
  pinterest: pinterestService
};

export function getSocialService(network: SocialNetwork) {
  return socialServices[network];
}
