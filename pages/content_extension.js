import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Player } from "../components/player/player_swipe";
import { Layout } from "../components/layout";
import { GetAppModal } from "../components/basic/get_app_modal";

import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { TopNav } from "../components/basic/top_nav_swipe";

import {
  AppActions
} from "../components/basic/app_actions";
import { Error } from "../components/basic/error";
import {
  Flex,
  useBreakpointValue
} from "@chakra-ui/react";

const Profile = ({
  user = {},
  all_videos = []
}) => {
  const {
    user_id,
    nickname,
    profile_image,
  } = user;

  const prepareFeedVideos = (videos = []) => {
    return videos.reduce((res, { video_type, video }) => {
        if (video_type === "rt"){
            return res.concat(
                video.chats.map((chat) => ({
                  video_type: "rt",
                  share_string: video.share_string,
                  video: {
                    ...chat,
                    video_thumbnail: chat.thumbnail_url,
                    description: video.group.group_description,
                    group_name: video.group.group_name,
                    group_dp: video.group.dp,
                    chat_id: video.chat_id,
                  },
                }))
            )
        }else{
          return res.concat(({video_type:video_type, video: video}))
        }
    }, []);
  }

  const preparedFeedVideos = prepareFeedVideos(all_videos)
  const [videos, setVideos] = useState(preparedFeedVideos);
  const [muted, setMuted] = useState(true);
  const [show_unmute_text, setShowUnmuteText] = useState(true);

  const [showModalAppDownload, setShowModalAppDownload] = useState(false);
  const getAppComponentRef = useRef(() => null);
  const handleCloseAppDownload = () => {
    getAppComponentRef.current = () => null;
    setShowModalAppDownload(false);
  };
  const handleShowModalAppDownload = (message = () => null) => {
    getAppComponentRef.current = message;
    setShowModalAppDownload(true);
  };

  useEffect(function(){
    setTimeout(() => {
      setShowUnmuteText(false);
    }, 5000);
  },[])

  const mobile = useBreakpointValue({ base: true, md: false });

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const getNextVideo = () => {
    // var idx = currentVideoIndex
    // if(currentVideoIndex+1<videos.length){
    //   idx = currentVideoIndex+1
    //   setCurrentVideoIndex(idx);
    // }
  };
  const getPrevVideo = () => {
    // var idx = 0
    // if(currentVideoIndex-1>=0){
    //   idx = currentVideoIndex-1
    //   setCurrentVideoIndex(idx);
    // }
  };

  const showGetAppToViewDialog = () => {
    // handleShowModalAppDownload(() => <>Get the app to view this video.</>);
  }

  const getInfyUrl = (url) => {
    var client_ip = ``;
    var location_lat = ``;
    var location_lng = ``;
    var minimum_duration = 1;
    var maximum_duration = 120;
    var device_width = 720;
    var device_height = 1280;
    var new_m3u8_url = `https://nxs.infy.tv/ssai/master.m3u8?live=0&avod=1&c=1048&min_ad_duration=6&max_ad_duration=300&pod_duration=3005&ad_breaks=-1,-1&pdomain=cnn.com&pname=CNN&u=${url}&t=2071&dnt=0&width=${device_width}&height=${device_height}&minimum_duration=${minimum_duration}&maximum_duration=${maximum_duration}&placement_id=cnn001${client_ip}${location_lat}${location_lng}`;
    // console.log('new_m3u8_url', new_m3u8_url);
    return new_m3u8_url;
  }

  return !Boolean(user_id) ? (
    // <Error />
    <>
    Loading. . .
    </>
  ) : (
    <>
      <Layout>
        <TopNav hideBurgerMenu={true} showGetAppModal={handleShowModalAppDownload} variant='light' />
      { muted ?
      <div className="volume-control">
          <Button
              variant='primary'
              onClick={() => {setMuted(prev => !prev); setShowUnmuteText(false); }}
              style={{
                height: 45,
                padding: "8px",
                fontSize: 17,
                fontWeight: "bold",
                pointerEvents: "all",
                borderRadius: '8px'
              }}
          >
            <FontAwesomeIcon icon={faVolumeMute} />
            {show_unmute_text?<p>Tap to unmute</p>:""}
          </Button>
      </div>
      :""}
      <Flex
        className='section-content h-100 swipe-container'
        direction='initial'
        wrap='wrap'
        w='full'
        // position={mobile ? "fixed" : "initial"}
      >
        {videos.length > 0 ? (
          <>
            {videos.map((video, id) => (
              <Player
                currentVideoIndex={id}
                videoThumbnail={
                  videos[id]?.video?.video_thumbnail
                }
                description={videos[id]?.video?.description}
                link={videos[id]?.video?.link}
                videoUrl={videos[id] && videos[id]['video'] && videos[id]['video']['video_url_m3u8']?getInfyUrl(videos[id]['video']['video_url_m3u8']) : (videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl']?videos[id] && videos[id]['video'] && videos[id]['video']['videoUrl']: null) }
                userName={nickname}
                userId={nickname}
                userProfileImage={profile_image}
                rtProfileImage={videos[id]?.video?.group_dp}
                showGetAppModal={handleShowModalAppDownload}
                onEnded={showGetAppToViewDialog}
                getNextVideo={getNextVideo}
                getPrevVideo={getPrevVideo}
                videos={videos}
                autoplay={id === 0?true: false}
                video_id_to_use={videos[id]?.video?.share_string}
                roundTableMode={videos[id]?.video_type === "rt"}
                roundTableName={videos[id]?.video?.group_name}
                roundTableId={videos[id]?.share_string}
                shareUrl={videos[id]?.video?.share_url}
                verticalNavigation
                muted={muted}
              >
                <AppActions
                  showGetAppModal={handleShowModalAppDownload}
                  userName={nickname}
                  link={videos[id]?.video?.link}
                  videoUrl={videos[id]?.video?.share_url}
                  videoDescription={
                    videos[id]?.video?.description
                  }
                  videoTitle='Genuin'
                  roundTable={videos[id]?.video_type === "rt"}
                  roundTableName={videos[id]?.video?.group_name}
                  roundTableId={videos[id]?.share_string}
                />
              </Player>
            ))}
            </>
          ) : (
            <>
              <h1>Nothing to show here</h1>
            </>
          )}
      </Flex>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
      />
    </Layout>
    </>
  );
};


Profile.getInitialProps = async ({ query: { share_string } }) => {
    if(share_string == undefined || share_string == null || share_string == ""){
        share_string = "dingcrypto";
    }
    if (
        share_string !== undefined &&
        share_string !== null &&
        share_string !== ""
    ) {
        try {
          const all_videos = await axios.get(
              `https://api.begenuin.com/api/v3/public/profile_videos?user_id=${share_string}&video_types[]=public_video`
          );
          // const user = await axios.get(
          //     `https://api.begenuin.com/api/v3/public/user/details?nickname=${share_string}`
          // );
          const user = {"data": {"code":200,"message":"XXXX-[User Details]","data":{"user_id":"21ee6aba-df4a-4729-99ca-1a4abb605025","nickname":"dingcrypto","name":"Dingle crypto","bio":"💰Teach the world DEFI 📈HODL INNOVATION 🚨Premier DEFI newsletter: Subscribe⬇️","phone":"6723355779861","is_avatar":false,"chat_limit":100,"profile_image":"https://media.begenuin.com/uploads/profile_images/21ee6aba-df4a-4729-99ca-1a4abb605025_1669976339000.png","profile_image_s":"https://media.begenuin.com/uploads/profile_images/s/21ee6aba-df4a-4729-99ca-1a4abb605025_1669976339000.png","profile_image_m":"https://media.begenuin.com/uploads/profile_images/m/21ee6aba-df4a-4729-99ca-1a4abb605025_1669976339000.png","profile_image_l":"https://media.begenuin.com/uploads/profile_images/l/21ee6aba-df4a-4729-99ca-1a4abb605025_1669976339000.png","share_qr_code_url":"https://begenuin.com/record/166ef71f0e00040a","views":63,"videos":195,"replies":0,"share_url":"https://begenuin.com/p/dingcrypto","preview_image":null,"hashtags":["crypto","defi","money","bitcoin","btc","invest","ETH","eth","yield","polygon","passiveincome","duet","greenscreen","finance","stitch","BTC","investment","airdrop","nft","investing","cryptocurrency","business","DEFI","ethereum","Btc","bestcrypto","bancor","NFT","cruptocurency","gmx","cryptonews","SmallBusiness","dinglecrypto","cryptonewstoday","ethereumnews","definews","financenews","blockchain","fantom","hex","top","decentralizedfinance","INVEST","yieldpools","future","ThanksandGiving","foodtrailer","realyield","newsletter","matic","cryptotools","shiba","defitools","cryptonewsdaily","deflation","Multifarm","cryptotrading","icecream","binance","chainlink","bestcryptotoinvest","stablecoins","topcrypto","binancehack","myc","manatoken","russia","gold","bangels","APYvision","metaverse","PepsiApplePieChallenge","SuperBowl","bestcryptos","Dapps","financetools","kimkardashian","investingforbeginners","moneywhileyousleep","dollarcostaveraging","stoptheBS","binancesmartchain","cryptoforbeginners","howtoresearchcrypto","greenscreenvideo","gamble","POS","forcast","cryptodividends","bestcryprotools","cryptopassiveincome","Halloween","coingecko","advice","ethereuminflation","finan","bestdefitools","BNB","cryptomarket","researchcryptocurrencies","pos","football","investtok","bestcryptoadvice","bestDefitools","Nonoly","cryptohack","bestfinanceapps","blockchainanalysis","decentraland","metaversecrypto","cryptomarketcrash","nfts","ethereumforbeginners","cryptomarketupdate","web","ethmerge","portfoliotracker","ice","publicblockchain","bsc","yieldfarming","bestfinancialadvice","worstcrypto","bit","cryptostarter","MakeABunchHappen","luna","cryptoresearch","betting","merketingdigital","binancecoin","shibainu","ftx","ukraine","GMX","bitcoinnews","bitcoinforbeginners","jackdaddy","cryptobearmarket","arbitrum","crytocurrency","cryptoinvesting","avax","dao","cryptok","financetiktok","cryptogroundrules","uniswap"]}}};

          return {
              user: user?.data?.data,
              all_videos: all_videos?.data?.data?.videos
          };
        } catch (error) {
          return {};
        }
    } else {
        return Promise.resolve({});
    }
};
export default Profile;
