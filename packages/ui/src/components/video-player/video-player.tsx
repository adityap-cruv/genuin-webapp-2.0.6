"use client";
import OpenPlayerJS from "openplayerjs";
import type { ComponentProps } from "react";
import {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { cn, encodeVideoSourceUrl } from "@genuin/ui/lib/utils";
import { useBrowserDetect } from "@genuin/ui/hooks";
import { Loader } from "@genuin/ui/loader";
import type {
  AdDataType,
  VideoPlayerStateRef,
} from "./ad-controls/use-ad-player";
import { AdControls } from "./ad-controls";

// Lazy load AdControls component to reduce initial bundle size
// const AdControls = lazy(() =>
//   import("./ad-controls/index.js").then((module) => ({
//     default: module.AdControls,
//   })),
// );

const SAMPLE_AD_TAGS = {
  SINGLE_REDIRECT_LINEAR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_REDIRECT_ERROR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_REDIRECT_BROKEN:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&nofb=1&correlator=",
  SINGLE_VERTICAL_INLINE:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_vertical_ad_samples&sz=360x640&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_VPAID_LINEAR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinearvpaid2js&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  SINGLE_VPAID_NON_LINEAR:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dnonlinearvpaid2js&ciu_szs=728x90%2C300x250&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
  VMAP_PRE_ROLL:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=",
  VMAP_PRE_ROLL_BUMPER:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonlybumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=",
  MID_ROLE_WITH_2_SKIPPABLE:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_skip_ad_samples&sz=640x480&cust_params=sample_ar%3Dmidskiponly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  ALL_SINGLES:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  STANDARD_POD_5_WITH_10_SEC:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostlongpod&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  ALL_WITH_ALL_BUMPERS:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpostpodbumper&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=",
  POST_ROLL_ONLY:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpostonly&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&correlator=",
  SKIPPABLE_INLINE:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=",
} as const;

// Lazy load AdControls component to reduce initial bundle size
// const AdControls = lazy(() =>
//   import("./ad-controls/ad-controls").then((module) => ({
//     default: module.AdControls,
//   }))
// );

const hlsConfigs = {
  // debug: true,
  /**
   * Start with lowest quality level to ensure smooth playback start.
   * ABR will gradually increase quality based on actual bandwidth.
   */
  startLevel: 0,
  /**
   * Disable capLevelToPlayerSize to prevent jumping to high quality based on player dimensions.
   * This ensures startLevel is respected for the first fragment.
   */
  capLevelToPlayerSize: false,
  /**
   * Restrict initial quality - set max to level 1 initially to force low quality start.
   * This can be adjusted dynamically after playback starts.
   */
  maxAutoLevel: 1,
  /**
   * Use worker threads for decoding for better performance.
   */
  enableWorker: true,
  /**
   * Enable Encrypted Media Extensions (EME) if DRM is required.
   */
  emeEnabled: true,
  /**
   * Low latency mode for quicker playback start and adaptation.
   */
  lowLatencyMode: true,
  /**
   * Buffer settings optimized for 2-second fragments.
   */
  maxBufferLength: 10, // Buffer up to 6 fragments (12 seconds).
  maxBufferSize: 40 * 1000 * 1000, // Maximum buffer size in bytes (40MB).
  backBufferLength: 30, // Retain 30 seconds for seamless rewind.
  /**
   * Fragment loading optimization.
   */
  fragLoadingTimeOut: 7000, // Timeout in milliseconds for loading fragments (reduced for faster failure detection).
  startFragPrefetch: true, // Prefetch the next fragment to minimize stutters.
  /**
   * Prevent HLS.js from probing multiple quality levels on startup.
   * This stops unnecessary parallel downloads of the same fragment at different qualities.
   */
  testBandwidth: false, // Disable initial bandwidth test that loads multiple quality levels
  /**
   * Conservative ABR settings to prevent jumping to highest quality immediately.
   */
  abrEwmaDefaultEstimate: 300000, // Lower initial bandwidth estimate (300 kbps) to start conservatively.
  abrBandWidthFactor: 0.8, // More conservative - requires 80% of bandwidth before switching up.
  abrBandWidthUpFactor: 0.5, // Very conservative upscaling - prevents jumping to 1080p immediately.
  abrEwmaFastLive: 3, // Slower adaptation for live content.
  abrEwmaSlowLive: 5, // Even slower for stable quality.
  abrEwmaFastVoD: 3, // Slower adaptation for VOD content.
  abrEwmaSlowVoD: 5, // Gradual quality increases.
  /**
   * Handle live playback smoothly for low-latency streams.
   */
  liveSyncDuration: 2.5, // Keep live playback latency low.
  liveMaxLatencyDuration: 6, // Maximum latency allowed for live streams.
  /**
   * Error recovery and buffer hole handling.
   */
  maxLoadingDelay: 4, // Maximum delay for loading retries (seconds).
  maxBufferHole: 0.5, // Maximum buffer hole tolerance (seconds).
  highBufferWatchdogPeriod: 2, // Period to check for buffer issues (seconds).
};

export type PlayerProps = ComponentProps<"video"> & {
  volume?: number;
  muted?: boolean; // Mute state for video and ads
  playbackSpeed?: number;
  play?: boolean;
  adUrl?: string; // URL for video ads
  adPlatform?: string | null; // Platform for video ads (e.g., "google", "geniusads")
  isInFeed?: boolean; // When true, allows adUrl changes to trigger loadAd via useEffect
  startTime?: number;
  enableLazyLoading?: boolean; // Enable lazy loading optimization (default: false)
  isInExpandView?: boolean;
  playerShouldPauseOnNotAllowed?: boolean;
  onOpenPlayerReady?: (player: OpenPlayerJS) => void;
  onPlayerLoad?: (player: OpenPlayerJS | null) => void; // Add custom event prop
  onVideoFirstQuartile?: (duration: number, currentTime: number) => void;
  onVideoMidpoint?: (duration: number, currentTime: number) => void;
  onVideoThirdQuartile?: (duration: number, currentTime: number) => void;
  onVideoWatched?: (duration: number, currentTime: number) => void;
  onAdStarted?: (adData: AdDataType) => void; // Callback when ad starts
  onAdFirstQuartile?: (adData: AdDataType) => void; // Callback when ad reaches first quartile (25%)
  onAdCompleted?: (adData: AdDataType) => void; // Callback when ad completes
  onAdError?: (error: any) => void; // Callback when ad errors (generic/unclassified)
  onAdRenderError?: (error: any) => void; // Callback when ad fails to render (4xx errors)
  onAdRequestFailed?: (error: any) => void; // Callback when ad request fails (303 no ads available)
  onAdClicked?: (adData: AdDataType) => void; // Callback when ad is clicked
  onAdSkipped?: (adData: AdDataType) => void; // Callback when ad is skipped
  onAdPause?: (adData: AdDataType) => void; // Callback when ad is paused
  onAllAdsCompleted?: () => void; // Callback when all ads are completed
  onAdImpression?: (adData: AdDataType) => void; // Callback when ad impression is recorded
  onAdRendered?: (adData: AdDataType) => void; // Callback when ad is rendered
  onAdResponseReceived?: () => void; // Callback when ad response is received
  onAdRequested?: () => void; // Callback when ad is requested
  onVideoStart?: (
    duration: number,
    currentTime: number,
    latency: number,
  ) => void; // Add onVideoStart prop
  onMutedChange?: (muted: boolean) => void;
  onVideoLoadStart?: (isPlaying: boolean) => void; // Callback when video loading starts
  onVideoLoadEnd?: (isPlaying: boolean) => void; // Callback when video loading ends
  onEnded?: (obje: { target: HTMLVideoElement | null }) => void; // Callback when video ends
};

export const VideoPlayer = memo(function VideoPlayer({
  src,
  id,
  poster,
  className,
  style,
  startTime = 0,
  ref,
  playsInline = true,
  volume = 100,
  muted,
  playbackSpeed = 1,
  play = true,
  loop = false, // loop prop is now destructured
  adUrl,
  adPlatform,
  isInFeed = false,
  enableLazyLoading = false, // Default to false for backward compatibility
  isInExpandView,
  playerShouldPauseOnNotAllowed = false,
  onVideoFirstQuartile,
  onOpenPlayerReady,
  onPlayerLoad, // Destructure new prop
  onVideoMidpoint,
  onVideoThirdQuartile,
  onVideoWatched,
  onVideoStart, // Destructure onVideoStart prop
  onAdStarted,
  onAdFirstQuartile,
  onAdCompleted,
  onAdError,
  onAdRenderError,
  onAdRequestFailed,
  onAdClicked,
  onAdSkipped,
  onAdPause,
  onAllAdsCompleted,
  onAdImpression,
  onAdRendered,
  onAdResponseReceived,
  onAdRequested,
  onSeeked,
  onMutedChange,
  onVideoLoadStart,
  onVideoLoadEnd,
  onEnded,
  ...props
}: PlayerProps) {
  // adUrl =
  //   "https://nxs.begenuin.com/ssai/ads?c=1937&t=2799&live=0&ad_breaks=5&ip=[IP]&osv=[DEVICE_OS_VERSION]&metro_ug=[USER_GEO_METRO]&accuracy_ug=[USER_GEO_ACCURACY]&us_privacy_r=1---&AV_PLCMT=[PLACEMENT_MACRO]&len_sc=[CONTENT_LENGTH]&kwarray_s=[SITE_KWARRAY]&flashver_d=[DEVICE_FLASHVER]&country_code=[COUNTRY_ID]&ipservice_ug=[USER_GEO_IPSERVICE]&site_id=2793_3405&skipmin_iv=0&pxratio_d=[DEVICE_PXRATIO]&geofetch_d=[DEVICE_GEOFETCH]&bitness_ds=[DEVICE_SUA_BITNESS]&model_ds=[DEVICE_SUA_MODEL]&zip_ug=[USER_GEO_ZIP]&plcmt_iv=1&mobile_ds=[DEVICE_SUA_MOBILE]&name_s=Indian%20Express&pagecat_s=[SITE_PAGECAT]&max_ad_duration=60&bidfloorcur_i=USD&browsers_version_ds=[DEVICE_SUA_BROWSERS_VERSION]&regionfips104_ug=[USER_GEO_REGIONFIPS104]&session_id=[SESSION_ID]&country_ug=[USER_GEO_COUNTRY]&domain_sp=indianexpress.com&player_height=1280&pos_iv=7&height=[DEVICE_HEIGHT]&carrier_d=[DEVICE_CARRIER]&mccmnc_d=[DEVICE_MCCMNC]&lastfix_dg=[DEVICE_GEO_LASTFIX]&AV_WIDTH=[DEVICE_WIDTH]&langb_d=[DEVICE_LANGB]&connectiontype_d=[DEVICE_CONNECTIONTYPE]&device_language=[DEVICE_LANGUAGE]&browsers_brand_ds=[DEVICE_SUA_BROWSERS_BRAND]&dnt=[DNT]&us_privacy=1---&sectioncat_s=[SITE_SECTIONCAT]&mobile_s=[SITE_MOBILE]&type_dg=[DEVICE_GEO_TYPE]&pub_name=[PUBLISHER_NAME]&player_width=720&skipafter_iv=0&secure_i=1&ua=[UA]&os=[DEVICE_OS]&regionfips104_dg=[DEVICE_GEO_REGIONFIPS104]&metro_dg=[DEVICE_GEO_METRO]&architecture_ds=[DEVICE_SUA_ARCHITECTURE]&width=[DEVICE_WIDTH]&location_lat=[LOCATION_LAT]&location_lon=[LOCATION_LON]&city=[CITY]&utcoffset_ug=[USER_GEO_UTCOFFSET]&city_ug=[USER_GEO_CITY]&is_lat=[LIMITED_AD_TRACKING]&AV_PUBLISHERID=68ef5a3232377dec0f07ce9f&min_ad_duration=5&device_ipv6=[DEVICE_IPV6]&device_model=[DEVICE_MODEL]&region=[REGION]&zip=[ZIP_CODE]&AV_HEIGHT=[DEVICE_HEIGHT]&hwv=[DEVICE_HWV]&site_search=[SITE_SEARCH]&device_js=[DEVICE_JS]&AV_CHANNELID=68ef805c79ec2fcab8047105&AV_URL=https://communities.indianexpress.com/video/catch-surya-kumar-yadav-tomorrow-630-pm-on?community=2025c187b0000f66&loop=2025c2c6f3801402&cat_s=[SITE_CAT]&site_page=[PAGE_URL]&name_sp=[SITE_PUBLISHER_NAME]&privacypolicy_s=[SITE_PRIVACYPOLICY]&content_id_s=a46c6cf9-4384-48b5-909b-544abb2dbcd4&device_type=[DEVICE_TYPE]&device_make=[DEVICE_MAKE]&utcoffset_dg=[DEVICE_GEO_UTCOFFSET]&did=[DID]&user_id=34oxOWuUOxBLqnygol84BDxBhsE&yob=[YOB]&region_ug=[USER_GEO_REGION]&cat_sp=[SITE_PUBLISHER_CAT]&platform_brand_ds=[DEVICE_SUA_PLATFORM_BRAND]&platform_version_ds=[DEVICE_SUA_PLATFORM_VERSION]&gender=[GENDER]&lon_ug=[USER_GEO_LON]&url_sc=https://communities.indianexpress.com/video/catch-surya-kumar-yadav-tomorrow-630-pm-on?community=2025c187b0000f66&loop=2025c2c6f3801402&site_ref=[SITE_REF]&cattax_sp=[SITE_PUBLISHER_CATTAX]&id_sp=2793&source_ds=[DEVICE_SUA_SOURCE]&ppi_d=[DEVICE_PPI]&lastfix_ug=[USER_GEO_LASTFIX]&type_ug=[USER_GEO_TYPE]&cb=1761893693840324274&keywords_s=[SITE_KEYWORDS]&placement_iv=1&linearity_iv=1&accuracy_dg=[DEVICE_ACCURACY]&ipservice_dg=[DEVICE_GEO_IPSERVICE]&lat_ug=[USER_GEO_LAT]&cattax_s=[SITE_CATTAX]&domain_s=[DOMAIN]&tag_id=3405";
  // // adUrl =
  //   "https://nxs.begenuin.com/ssai/ads?c=2793&t=3405&live=0&ad_breaks=0,-1,48&placement_iv=1&browsers_brand_ds=[DEVICE_SUA_BROWSERS_BRAND]&model_ds=[DEVICE_SUA_MODEL]&source_ds=[DEVICE_SUA_SOURCE]&platform_brand_ds=[DEVICE_SUA_PLATFORM_BRAND]&lastfix_ug=[USER_GEO_LASTFIX]&type_ug=[USER_GEO_TYPE]&lon_ug=[USER_GEO_LON]&site_page=[PAGE_URL]&kwarray_s=[SITE_KWARRAY]&site_id=2793_3405&privacypolicy_s=[SITE_PRIVACYPOLICY]&skipafter_iv=0&device_model=[DEVICE_MODEL]&device_language=[DEVICE_LANGUAGE]&bitness_ds=[DEVICE_SUA_BITNESS]&AV_PLCMT=[PLACEMENT_MACRO]&device_type=[DEVICE_TYPE]&country_code=[COUNTRY_ID]&did=[DID]&site_ref=[SITE_REF]&cattax_s=[SITE_CATTAX]&domain_sp=indianexpress.com&player_width=720&secure_i=1&device_ipv6=[DEVICE_IPV6]&pxratio_d=[DEVICE_PXRATIO]&architecture_ds=[DEVICE_SUA_ARCHITECTURE]&cat_sp=[SITE_PUBLISHER_CAT]&mobile_s=[SITE_MOBILE]&content_id_s=c23461c4-ed66-436d-ab6a-b18fb24ca461&zip_ug=[USER_GEO_ZIP]&us_privacy=1---&AV_WIDTH=[DEVICE_WIDTH]&AV_IP=[IP]&pub_name=[PUBLISHER_NAME]&hwv=[DEVICE_HWV]&pagecat_s=[SITE_PAGECAT]&ua=[UA]&geofetch_d=[DEVICE_GEOFETCH]&platform_version_ds=[DEVICE_SUA_PLATFORM_VERSION]&sectioncat_s=[SITE_SECTIONCAT]&pos_iv=7&accuracy_dg=[DEVICE_ACCURACY]&ipservice_ug=[USER_GEO_IPSERVICE]&region_ug=[USER_GEO_REGION]&AV_URL=https://communities.indianexpress.com/video/after-talks-with-israeli-pm-benjamin-netanyahu-us?community=2025c187b0000f66&loop=2025c23c8b801401&id_sp=2793&tag_id=3405&region=[REGION]&zip=[ZIP_CODE]&mccmnc_d=[DEVICE_MCCMNC]&type_dg=[DEVICE_GEO_TYPE]&ppi_d=[DEVICE_PPI]&accuracy_ug=[USER_GEO_ACCURACY]&country_ug=[USER_GEO_COUNTRY]&domain_s=[DOMAIN]&device_make=[DEVICE_MAKE]&regionfips104_ug=[USER_GEO_REGIONFIPS104]&gender=[GENDER]&metro_ug=[USER_GEO_METRO]&AV_PUBLISHERID=68ef5a3232377dec0f07ce9f&bidfloorcur_i=USD&os=[DEVICE_OS]&osv=[DEVICE_OS_VERSION]&height=[DEVICE_HEIGHT]&connectiontype_d=[DEVICE_CONNECTIONTYPE]&mobile_ds=[DEVICE_SUA_MOBILE]&session_id=[SESSION_ID]&site_search=[SITE_SEARCH]&linearity_iv=1&plcmt_iv=1&location_lon=[LOCATION_LON]&browsers_version_ds=[DEVICE_SUA_BROWSERS_VERSION]&user_id=37ePekY3lsuRfiZ6Y1eGxxxCIUc&us_privacy_r=1---&AV_CHANNELID=68ef805c79ec2fcab8047105&AV_USERAGENT=[UA]&min_ad_duration=5&max_ad_duration=60&width=[DEVICE_WIDTH]&location_lat=[LOCATION_LAT]&langb_d=[DEVICE_LANGB]&utcoffset_dg=[DEVICE_GEO_UTCOFFSET]&yob=[YOB]&is_lat=[LIMITED_AD_TRACKING]&player_height=1280&skipmin_iv=0&dnt=[DNT]&city_ug=[USER_GEO_CITY]&lat_ug=[USER_GEO_LAT]&url_sc=https://communities.indianexpress.com/video/after-talks-with-israeli-pm-benjamin-netanyahu-us?community=2025c187b0000f66&loop=2025c23c8b801401&cat_s=[SITE_CAT]&name_sp=[SITE_PUBLISHER_NAME]&flashver_d=[DEVICE_FLASHVER]&carrier_d=[DEVICE_CARRIER]&lastfix_dg=[DEVICE_GEO_LASTFIX]&regionfips104_dg=[DEVICE_GEO_REGIONFIPS104]&metro_dg=[DEVICE_GEO_METRO]&utcoffset_ug=[USER_GEO_UTCOFFSET]&cb=1767260660013708950&len_sc=[CONTENT_LENGTH]&ip=[IP]&device_js=[DEVICE_JS]&city=[CITY]&ipservice_dg=[DEVICE_GEO_IPSERVICE]&AV_HEIGHT=[DEVICE_HEIGHT]&name_s=Indian Express&cattax_sp=[SITE_PUBLISHER_CATTAX]&keywords_s=[SITE_KEYWORDS]";
  // adUrl =
  //   "https://nxs.begenuin.com/tagxml/customer/1937/tag/2799?accuracy_dg=%5BDEVICE_ACCURACY%5D&accuracy_ug=%5BUSER_GEO_ACCURACY%5D&app_bundle=%5BAPP_BUNDLE%5D&app_domain=%5BAPP_DOMAIN%5D&app_name=%5BAPP_NAME%5D&app_store_url=%5BAPP_STORE_URL%5D&app_version=%5BAPP_VERSION%5D&architecture_ds=%5BDEVICE_SUA_ARCHITECTURE%5D&bidfloorcur_i=USD&bitness_ds=%5BDEVICE_SUA_BITNESS%5D&browsers_brand_ds=%5BDEVICE_SUA_BROWSERS_BRAND%5D&browsers_version_ds=%5BDEVICE_SUA_BROWSERS_VERSION%5D&carrier_d=%5BDEVICE_CARRIER%5D&city=%5BCITY%5D&city_ug=%5BUSER_GEO_CITY%5D&connectiontype_d=%5BDEVICE_CONNECTIONTYPE%5D&content_id=85cd8658-34f8-49fe-bdbb-25c152fa2877&country_code=%5BCOUNTRY_ID%5D&country_ug=%5BUSER_GEO_COUNTRY%5D&device_ipv6=%5BDEVICE_IPV6%5D&device_js=%5BDEVICE_JS%5D&device_language=%5BDEVICE_LANGUAGE%5D&device_make=%5BDEVICE_MAKE%5D&device_model=%5BDEVICE_MODEL%5D&device_type=%5BDEVICE_TYPE%5D&did=%5BDID%5D&dnt=0&flashver_d=%5BDEVICE_FLASHVER%5D&gender=%5BGENDER%5D&geofetch_d=%5BDEVICE_GEOFETCH%5D&height=1280&hwv=%5BDEVICE_HWV%5D&id_ap=2357&ip=%5BIP%5D&ipservice_dg=%5BDEVICE_GEO_IPSERVICE%5D&ipservice_ug=%5BUSER_GEO_IPSERVICE%5D&is_lat=%5BLIMITED_AD_TRACKING%5D&langb_d=%5BDEVICE_LANGB%5D&lastfix_dg=%5BDEVICE_GEO_LASTFIX%5D&lastfix_ug=%5BUSER_GEO_LASTFIX%5D&lat_ug=%5BUSER_GEO_LAT%5D&len_sc=%5BCONTENT_LENGTH%5D&linearity_iv=1&live=0&location_lat=%5BLOCATION_LAT%5D&location_lon=%5BLOCATION_LON%5D&lon_ug=%5BUSER_GEO_LON%5D&loop=1e626a56aa0015bb&max_ad_duration=60&max_bitrate=4053&mccmnc_d=%5BDEVICE_MCCMNC%5D&metro_dg=%5BDEVICE_GEO_METRO%5D&metro_ug=%5BUSER_GEO_METRO%5D&min_ad_duration=5&mobile_ds=%5BDEVICE_SUA_MOBILE%5D&model_ds=%5BDEVICE_SUA_MODEL%5D&name_s=%5BCHANNEL_NAME%5D&os=%5BDEVICE_OS%5D&osv=%5BDEVICE_OS_VERSION%5D&placement_iv=1&platform_brand_ds=%5BDEVICE_SUA_PLATFORM_BRAND%5D&platform_version_ds=%5BDEVICE_SUA_PLATFORM_VERSION%5D&player_height=1280&player_width=960&plcmt_iv=1&pos_iv=7&ppi_d=%5BDEVICE_PPI%5D&pub_domain=ted.com&pub_name=%5BPUBLISHER_NAME%5D&pxratio_d=%5BDEVICE_PXRATIO%5D&region=%5BREGION%5D&region_ug=%5BUSER_GEO_REGION%5D&regionfips104_dg=%5BDEVICE_GEO_REGIONFIPS104%5D&regionfips104_ug=%5BUSER_GEO_REGIONFIPS104%5D&secure_i=1&session_id=%5BSESSION_ID%5D&skipafter_iv=0&skipmin_iv=0&source_ds=%5BDEVICE_SUA_SOURCE%5D&startdelay_iv=0&tag_id=3447&type_dg=%5BDEVICE_GEO_TYPE%5D&type_ug=%5BUSER_GEO_TYPE%5D&ua=%5BUA%5D&url_ac=https%3A%2F%2Fshorts.ted.com%2Fvideo%2Fthese-lighter-than-air-machines-called-aerobes%3Fcommunity%3D1f0dbf9a21800dae&url_sc=%5BCONTENT_URL%5D&us_privacy=1---&us_privacy_r=1---&user_id=33BgjSWsCUJTkiCnRHhEdJK7CRI&utcoffset_dg=%5BDEVICE_GEO_UTCOFFSET%5D&utcoffset_ug=%5BUSER_GEO_UTCOFFSET%5D&width=960&yob=%5BYOB%5D&zip=%5BZIP_CODE%5D&zip_ug=%5BUSER_GEO_ZIP%5D";
  // adUrl =
  //   "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirecterror&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&nofb=1&correlator=";
  // adUrl = SAMPLE_AD_TAGS.VMAP_PRE_ROLL;
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => internalVideoRef.current as HTMLVideoElement, [
    internalVideoRef.current,
  ]);
  // adUrl = undefined;
  const videoRef = internalVideoRef;
  const playerRef = useRef<OpenPlayerJS | null>(null);
  const isPlayerInitialized = useRef(false); // Track if player has been initialized
  const [isLoading, setIsLoading] = useState(false);
  const [isPosterVisible, setIsPosterVisible] = useState(true);
  // const [allAdsCompleted, setAllAdsCompleted] = useState(adUrl ? false : true);
  const setupAdEventListenersRef = useRef<
    ((player: OpenPlayerJS) => void) | null
  >(null);
  const onAdRequestedRef = useRef(onAdRequested);
  onAdRequestedRef.current = onAdRequested;
  const { isSafari } = useBrowserDetect();

  const playerStateRef = useRef<VideoPlayerStateRef>({
    shouldPlay: play,
    firstQuartileFired: false,
    midpointFired: false,
    thirdQuartileFired: false,
    videoWatchedFired: false,
    videoStartFired: false,
    isAdErrored: false,
    // Flag to track if all ads have completed, if adUrl is provided
    allAdsCompleted: adUrl ? false : true,
    videoCompleted: false,
  });

  // Centralized loading state handler that triggers callbacks
  const updateLoadingState = useCallback(
    (loading: boolean, isPlaying: boolean) => {
      setIsLoading((prevLoading) => {
        // Only trigger callbacks when state actually changes
        if (prevLoading !== loading) {
          if (loading) {
            onVideoLoadStart?.(isPlaying);
          } else {
            onVideoLoadEnd?.(isPlaying);
          }
        }
        return loading;
      });
    },
    [onVideoLoadStart, onVideoLoadEnd],
  );

  useEffect(() => {
    if (typeof volume === "undefined") return;
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (typeof muted === "undefined") return;
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Listen for customLoad event and call onCustomLoad
  useEffect(() => {
    if (!videoRef.current || !onPlayerLoad) return;
    const currentVideoElement = videoRef.current; // Capture current value
    const handler = () => onPlayerLoad(playerRef.current);
    currentVideoElement.addEventListener("playerLoad", handler);
    return () => {
      currentVideoElement?.removeEventListener("playerLoad", handler); // Use captured value
    };
  }, [onPlayerLoad]);

  const pauseThePlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    // If an ad error occurred, just pause the main content
    if (playerStateRef.current.isAdErrored) {
      player?.getMedia().pause();
      return;
    }

    // Pause based on current player state
    try {
      if (player.isAd()) {
        player?.getAd()?.pause(); // Pause ad if playing
      } else {
        player?.getMedia().pause();
      }
    } catch (error) {
      // Fallback to direct pause if specific methods fail
      console.warn("Error pausing player, using fallback:", error);
      player?.getElement().pause();
    }
  }, []);

  const updatePlayerPlayState = useCallback(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    updatePlayerMutedState(true)
    pauseThePlayer();
    videoElement.dispatchEvent(
      new CustomEvent("videoPausedByBrowserRestriction", {
        detail: {
          reason: "NotAllowedError",
        },
      }),
    );
  }, [pauseThePlayer]);

  const updatePlayerMutedState = useCallback(
    (muted: boolean) => {
      if (videoRef.current) {
        videoRef.current.muted = muted;
        onMutedChange?.(muted);
      }
    },
    [onMutedChange],
  );

  const initializePlayer = useCallback(
    async (player: OpenPlayerJS, play?: boolean) => {
      await player.init();
      await player.load();

      playerRef.current = player;

      // Set playback speed and volume after player is initialized
      const media = player.getMedia();
      if (media) {
        if (playbackSpeed) {
          media.playbackRate = playbackSpeed;
        }
      }

      // Set up ad event listeners if ads are enabled
      if (adUrl) {
        onAdRequestedRef.current?.();
        if (setupAdEventListenersRef.current) {
          setupAdEventListenersRef.current(player);
        }
      }

      // Dispatch playerLoad event after player is ready
      videoRef.current?.dispatchEvent(new Event("playerLoad"));

      if (play) {
        // Attempt to autoplay immediately, handling ads and content
        try {
          if (player.isAd()) {
            await player.getAd().play();
          } else {
            await player.getMedia().play();
          }
        } catch (error) {
          if (playerShouldPauseOnNotAllowed) {
            if ((error as any)?.name === "NotAllowedError") {
              updatePlayerPlayState();
            }
          } else {
            if ((error as any)?.name !== "NotAllowedError") {
              updatePlayerMutedState(true);
            }
            await player.play();
          }
          console.warn("Autoplay failed on initialization:", { error });
        }
      }

      onOpenPlayerReady?.(player);
    },
    [onOpenPlayerReady, adUrl, playbackSpeed],
  );

  const playThePlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    // If ads manager was destroyed due to fatal error, always play main content
    if (playerStateRef.current.isAdErrored) {
      player
        ?.getMedia()
        .play()
        .then(() => {})
        .catch((error) => {
          if (error?.name === "NotAllowedError") {
            if (playerShouldPauseOnNotAllowed) {
              updatePlayerPlayState();
            } else {
              updatePlayerMutedState(true);
            }
          }
        });
      return;
    }

    // For normal playback, check if we're currently in an ad or content
    try {
      if (player.isAd()) {
        // Currently playing an ad
        player
          ?.getAd()
          .play()
          .catch((err: any) => {
            console.warn("Could not play ad, falling back to content:", err);
            // If ad play fails, try content instead
            player?.getMedia().play();
          });
      } else {
        // Currently playing content
        player
          ?.getMedia()
          .play()
          .catch((error) => {
            if (error?.name === "NotAllowedError") {
              if (playerShouldPauseOnNotAllowed) {
                updatePlayerPlayState();
              } else {
                updatePlayerMutedState(true);
              }
            }
          });
      }
    } catch (error) {
      // Fallback to content if player state check fails
      console.warn(
        "Error checking player state, falling back to content:",
        error,
      );
      player?.getMedia().play();
    }
  }, [updatePlayerMutedState, updatePlayerPlayState]);

  useEffect(() => {
    return () => {
      const currentPlayer = playerRef.current;
      try {
        currentPlayer?.getMedia()?.pause();
        currentPlayer?.destroy();
      } catch (e) {
        console.warn("Error destroying player:", e);
      }

      isPlayerInitialized.current = false;
      playerRef.current = null;
      playerStateRef.current = {
        firstQuartileFired: false,
        midpointFired: false,
        thirdQuartileFired: false,
        videoWatchedFired: false,
        videoStartFired: false,
        shouldPlay: play,
        isAdErrored: false,
        allAdsCompleted: adUrl ? false : true,
        videoCompleted: false,
      };
      changePlayerStateRef(true);

      setIsPosterVisible(true);
      isPlayerInitialized.current = false;
      playerRef.current = null;
    };
  }, [src]);

  // Lazy initialization: Initialize player based on enableLazyLoading prop
  useEffect(() => {
    if (!videoRef.current) return;

    // If player is already initialized, just control play/pause
    if (isPlayerInitialized.current) {
      playerStateRef.current.shouldPlay = play;
      if (play) {
        if (!playerRef.current?.getMedia().loaded) {
          updateLoadingState(true, true);
        }
        playThePlayer();
      } else {
        updateLoadingState(false, false);
        pauseThePlayer();
      }
      return;
    }

    // Conditional initialization based on enableLazyLoading:
    // - If enableLazyLoading is false (default): Initialize immediately on mount
    // - If enableLazyLoading is true: Initialize only when play becomes true
    if (enableLazyLoading && !play) return;

    // OpenPlayerJS is patched to disable IMA's native UI; no runtime prototype patching required.

    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: "responsive",
      forceNative: isSafari ? true : !src?.endsWith(".m3u8"), // Safari uses native HLS, others use hls.js
      showLoaderOnInit: false,
      hls: hlsConfigs,
      startTime,
      startVolume: volume / 100,
      ads: adUrl
        ? {
            src: adUrl,
            // debug: true,
            // sdkPath: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
            enablePreloading: false,
            customClick: isInExpandView
              ? {
                  enabled: true,
                  label: "Learn More",
                }
              : undefined,
          }
        : undefined,
    });

    // Mark as initialized before calling initializePlayer
    isPlayerInitialized.current = true;
    playerStateRef.current.shouldPlay = play;

    // Set loading state if play is requested during initialization
    if (play) {
      updateLoadingState(true, true);
    }

    void initializePlayer(player, play);

    // Reset videoStartFired when player initializes (new video)
    playerStateRef.current.videoStartFired = false;
  }, [
    play,
    src,
    playThePlayer,
    pauseThePlayer,
    enableLazyLoading,
    isSafari,
    playbackSpeed,
    startTime,
    adUrl,
    initializePlayer,
    updateLoadingState,
  ]);

  // If adUrl changes after initialization, load the new ad (only in feed context)
  useEffect(() => {
    if (!isInFeed) return;
    if (adUrl) {
      playerRef.current?.loadAd(adUrl);
    }
  }, [adUrl, isInFeed]);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    const handleMuteAndPlay = () => {
      if (playerShouldPauseOnNotAllowed) {
        updatePlayerPlayState();
        pauseThePlayer();
      } else {
        updatePlayerMutedState(true);
        playThePlayer();
      }
    };

    videoElement.addEventListener("muteAndPlay", handleMuteAndPlay);

    return () => {
      videoElement.removeEventListener("muteAndPlay", handleMuteAndPlay);
    };
  }, [
    updatePlayerMutedState,
    updatePlayerPlayState,
    playThePlayer,
    pauseThePlayer,
  ]);

  // A function to check and call onEnded if both ads and video are completed
  const tryCallingEnd = useCallback(() => {
    const allAdsCompleted = playerStateRef.current.allAdsCompleted;
    const videoCompleted = playerStateRef.current.videoCompleted;

    // only call onEnded if both ads and video are completed
    if (allAdsCompleted && videoCompleted) {
      if (adUrl) {
        onAdRequestedRef.current?.();
        playerRef.current?.loadAd(adUrl).then((e) => {});
        playerStateRef.current.allAdsCompleted = false;
      }
      playerStateRef.current.videoCompleted = false;
      if (videoRef.current) videoRef.current.currentTime = 0;
      onEnded?.({ target: videoRef.current });
      changePlayerStateRef(true);
    }
  }, [onEnded, adUrl]);

  const handleAllAdsCompleted = useCallback(() => {
    playerStateRef.current.allAdsCompleted = true;
    onAllAdsCompleted?.();
    tryCallingEnd();
  }, [onAllAdsCompleted, tryCallingEnd]);

  const handleEnded = useCallback(
    (_e: any) => {
      playerStateRef.current.videoCompleted = true;
      tryCallingEnd();
    },
    [tryCallingEnd],
  );

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    let startTime: number = -1;
    const handlePlay = () => {
      startTime = performance.now();
    };

    const handlePlaying = () => {
      // Clear loading state when video actually starts playing
      updateLoadingState(false, true);
      setIsPosterVisible(false);

      // Check if shouldPlay is false and pause if needed
      if (!playerStateRef.current.shouldPlay) {
        const player = playerRef.current;
        if (player) {
          try {
            pauseThePlayer();
          } catch (pauseErr) {
            console.warn("Error pausing video:", pauseErr);
          }
        }
        return;
      }

      if (!playerStateRef.current.videoStartFired) {
        playerStateRef.current.videoStartFired = true;
        const endTime = performance.now();
        const latency: number = endTime - startTime;
        onVideoStart?.(
          playerRef.current?.getMedia().duration ?? 0,
          videoElement.currentTime,
          typeof startTime === "number" && startTime !== -1
            ? Math.floor(latency)
            : 0,
        );
      }
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("playing", handlePlaying);
    // Added listener for all ads completed
    videoElement.addEventListener("adsallAdsCompleted", handleAllAdsCompleted);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener(
        "adsallAdsCompleted",
        handleAllAdsCompleted,
      );
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, [
    onVideoStart,
    src,
    updateLoadingState,
    pauseThePlayer,
    handleAllAdsCompleted,
    handleEnded,
  ]);

  const changePlayerStateRef = useCallback(
    (isReset: boolean, duration?: number, currentTime?: number) => {
      if (isReset) {
        playerStateRef.current = {
          firstQuartileFired: false,
          midpointFired: false,
          thirdQuartileFired: false,
          videoWatchedFired: false,
          videoStartFired: playerStateRef.current.videoStartFired,
          shouldPlay: playerStateRef.current.shouldPlay,
          allAdsCompleted: adUrl ? false : true,
        };
        return;
      }
      if (duration === undefined || currentTime === undefined) return;
      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;
      if (currentTime < 3 && playerStateRef.current.videoWatchedFired) {
        playerStateRef.current.videoWatchedFired = false;
      }
      if (
        currentTime < firstQuartileTime &&
        playerStateRef.current.firstQuartileFired
      ) {
        playerStateRef.current.firstQuartileFired = false;
      }
      if (currentTime < midpointTime && playerStateRef.current.midpointFired) {
        playerStateRef.current.midpointFired = false;
      }
      if (
        currentTime < thirdQuartileTime &&
        playerStateRef.current.thirdQuartileFired
      ) {
        playerStateRef.current.thirdQuartileFired = false;
      }
    },
    [playerStateRef],
  );

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const videlElement = videoRef.current;
      const duration = videoElement.duration;
      if (!videlElement || duration === 0 || !duration || duration === Infinity)
        return;
      const {
        firstQuartileFired,
        midpointFired,
        thirdQuartileFired,
        videoWatchedFired,
      } = playerStateRef.current;

      const { currentTime } = videoElement;

      if (!videoWatchedFired && currentTime >= 3) {
        onVideoWatched?.(duration, currentTime);
        playerStateRef.current.videoWatchedFired = true;
      }

      const firstQuartileTime = duration / 4;
      const midpointTime = duration / 2;
      const thirdQuartileTime = (duration * 3) / 4;

      if (!firstQuartileFired && currentTime >= firstQuartileTime) {
        onVideoFirstQuartile?.(duration, currentTime);
        playerStateRef.current.firstQuartileFired = true;
      }

      if (!midpointFired && currentTime >= midpointTime) {
        onVideoMidpoint?.(duration, currentTime);
        playerStateRef.current.midpointFired = true;
      }

      if (!thirdQuartileFired && currentTime >= thirdQuartileTime) {
        onVideoThirdQuartile?.(duration, currentTime);
        playerStateRef.current.thirdQuartileFired = true;
      }
    };

    // videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      // videoElement.removeEventListener("ended", handleEnded);
      // Clean up the timeupdate event listener
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    src,
    onVideoFirstQuartile,
    onVideoMidpoint,
    onVideoThirdQuartile,
    onVideoWatched,
  ]);

  const onVideoSeeked = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      onSeeked?.(event);
      changePlayerStateRef(
        false,
        videoRef.current?.duration,
        videoRef.current?.currentTime,
      );
    },
    [playerStateRef, changePlayerStateRef, onSeeked],
  );

  const handleOnAdStarted = useCallback(
    (adData: AdDataType) => {
      onAdStarted?.(adData);
      setIsPosterVisible(false);
    },
    [onAdStarted, setIsPosterVisible],
  );

  return (
    <div className="gencl:relative gencl:h-full gencl:w-full">
      <video
        id={id}
        className={cn(
          "gencl:h-auto gencl:w-auto gencl:bg-center gencl:bg-no-repeat gencl:object-cover",
          className,
        )}
        style={style}
        // poster={poster}
        ref={videoRef}
        loop={loop}
        playsInline={playsInline}
        preload="none"
        onSeeked={onVideoSeeked}
        src={encodeVideoSourceUrl(src ?? "")}
        // onEnded={handleEnded}
        {...props}
      />
      {/**
       * This dynamic poster implementation allows us to lazy load poster in whereas vidoe element's poster doesn't allow us to do that.
       */}
      {poster && isPosterVisible && (
        <VideoPoster src={poster} className={className} />
      )}
      {isLoading && (
        <div
          role="status"
          aria-label="Loading video"
          className="gencl:absolute gencl:inset-0 gencl:flex gencl:items-center gencl:justify-center gencl:pointer-events-none"
        >
          <div className="gencl:rounded-full gencl:bg-black/40 gencl:p-3 gencl:backdrop-blur-sm">
            <Loader size="md" aria-hidden="true" />
          </div>
        </div>
      )}
      {adUrl && (
        <AdControls
          player={playerRef.current}
          adUrl={adUrl}
          muted={muted}
          volume={volume}
          playerStateRef={playerStateRef}
          updateLoadingState={updateLoadingState}
          isInExpandView={isInExpandView}
          onSetupReady={(fn) => {
            setupAdEventListenersRef.current = fn;
          }}
          onAdStarted={handleOnAdStarted}
          onAdFirstQuartile={onAdFirstQuartile}
          onAdCompleted={onAdCompleted}
          onAdError={onAdError}
          onAdRenderError={onAdRenderError}
          onAdRequestFailed={onAdRequestFailed}
          onAdClicked={onAdClicked}
          onAdSkipped={onAdSkipped}
          onAdPause={onAdPause}
          onAllAdsCompleted={onAllAdsCompleted}
          onAdImpression={onAdImpression}
          onAdRendered={onAdRendered}
          onAdResponseReceived={onAdResponseReceived}
          playThePlayer={playThePlayer}
        />
      )}
    </div>
  );
});

type VideoPosterProps = {
  src: string;
  className?: string;
};

export const VideoPoster = memo(function VideoPoster({
  src,
  className,
}: VideoPosterProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <img
      src={src}
      loading="lazy"
      className={cn(
        "gencl:absolute gencl:inset-0 gencl:h-full gencl:w-full gencl:object-cover gencl:pointer-events-none",
        className,
      )}
      style={{
        // To manage blink in safari I have added this transform properties.
        transform: "translate3d(0, 0, 0)",
        WebkitTransform: "translate3d(0, 0, 0)",
        // backfaceVisibility: "hidden",
      }}
      onError={() => setVisible(false)}
    />
  );
});
