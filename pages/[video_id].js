import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Player } from "../components/player/player";
import { Layout } from "../components/layout/layout";
import { TopNav } from "../components/basic/top_nav";
import { GetAppModal } from "../components/basic/get_app_modal";
import { WelcomeModal } from "../components/basic/welcome_modal";
import { Error } from "../components/basic/error";
import { SEO } from "../components/basic/seo";
import { AppActions } from "../components/basic/app_actions";
import { appStoreLink } from "../config";
import { Box, Modal, ModalBody, ModalContent, useDisclosure } from "@chakra-ui/react";
const Video = (props) => {
  const {
    videoUrl,
    video_url_m3u8,
    videoPreviewImage,
    description,
    created_at,
    updated_at,
    tags,
    share_string,
    video_id_to_use,
    videoThumbnail,
    userName,
    userNickname,
    userProfileImage,
    link,
  } = props;
  const [showModalWelcome, setShowModalWelcome] = useState(true);
  const handleCloseWelcome = () => setShowModalWelcome(false);
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

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const tags_string = tags!==null && tags!==undefined && tags.replace(/\s+/g,'')!==''?` #${tags.split(',').join(' #')}`:''
  const ld_description = `${userName? userName: "@"+userNickname} | Web3 related bite-sized content available on Genuin${tags_string}`
  const title_name = description?description:`Watch byte sized videos from @${userNickname} on Genuin`
  const share_url = `${process.env.hostname}${share_string}`
  const ORG_SCHEMA = JSON.stringify({
    "@context": "http://schema.org",
    "@type": "VideoObject",
    id: share_url,
    url: share_url,
    name: title_name,
    isPartOf: `${process.env.hostname}#website`,
    image: `${videoThumbnail}/#primaryimage`,
    thumbnailUrl: videoThumbnail,
    contentUrl: videoUrl,
    embedUrl: videoUrl,
    author: {
      "@type": "Person",
      "name": "@"+userNickname,
      "url": `${process.env.hostname}p/${userNickname}`
    },
    publisher: {
      "@type": "Organization",
      "name": "Genuin",
      "url": process.env.hostname
    },
    description: ld_description,
    inLanguage: "en-US",
    uploadDate: created_at,
    dateCreated: created_at,
    dateModified: updated_at,
    datePublished: created_at,
    potentialAction: [
      {
        "@type": "WatchAction",
        target: share_url,
        image: videoThumbnail
      },
    ],
  });

  useEffect(() => {
    var ls = window.location.href.split("/")
    if (ls && ls.length == 4){
      onOpen()
    }
  },[])

  const setProfileUrl = () => {
    // console.log("Setting profile url in public video individual")
    window.location.href = `${process.env.hostname}p/${userNickname}`
  }

  //todo: remove it
  const [muted, setMuted] = useState(true);
  const onClick = () => {
    setMuted(old => !old);
    console.log("on click called..")
  }

  return !Boolean(videoUrl) ? (
    <Error />
  ) : (
    <>
      <Layout>
        <SEO
          title={title_name}
          openGraphTitle={`${userNickname} @ Genuin`}
          videoUrl={videoUrl}
          videoPreviewImage={videoPreviewImage}
          description={ld_description}
          openGraphDescription={description ? description : " "}
          metaImageWidth={1200}
          metaImageHeight={630}
          urlToCopy={process?.env?.hostname + "/" + video_id_to_use} />
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: ORG_SCHEMA }} />
        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior='inside'>
          <ModalContent
            h='full'
            marginTop={0}
            maxH='full'
            maxW='full'
            bg='transparent'
          >
            <ModalBody p={0} height='full' w='full' overflow='hidden'>
              <Player
                key={video_id_to_use ?? `${Math.random()}`}
                video_id_to_use={video_id_to_use}
                description={description}
                videoUrl={video_url_m3u8 ?? videoUrl}
                videoThumbnail={videoThumbnail}
                userName={userNickname}
                userId={userNickname}
                userProfileImage={userProfileImage}
                showGetAppModal={handleShowModalAppDownload}
                onEnded={showGetAppToViewDialog}
                autoplay
                  onClickOutsideOfVideo={() => { setProfileUrl(); onClose(); }}
                  onClick={onClick}
                  muted={muted}
              >
                <AppActions
                  showGetAppModal={handleShowModalAppDownload}
                  userName={userNickname}
                  link={link}
                  videoUrl={globalThis?.location?.href}
                  videoDescription={description}
                  videoTitle='Genuin' />
              </Player>
            </ModalBody>
          </ModalContent>
        </Modal>
        <GetAppModal
          show={showModalAppDownload}
          onClose={handleCloseAppDownload}
          TextNode={getAppComponentRef.current} /><WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} />
      </Layout>
    </>
  );
};
Video.getInitialProps = async ({ query: { video_id } }) => {
  const url = `${process.env.apiurl}/api/v3/public/pv/?video_id=${video_id}`
  return axios
    .get(url)
    .then((response) => {
      var resObj = response.data.data;
      var video_id_to_use = resObj.share_string;
      Object.assign(resObj, {
        video_id: video_id,
        video_id_to_use: video_id_to_use,
      });
      return Promise.resolve(resObj);
    })
    .catch((err) => {
      return Promise.resolve({});
    });
};
export default Video;
