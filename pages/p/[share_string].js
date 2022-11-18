import { useState, useRef } from 'react';
import axios from 'axios';
import { Player } from '../../components/player';
import { Layout } from '../../components/layout';
import { TopNav } from '../../components/topNav';
import { GetAppModal } from '../../components/getAppModal';
import { AppActions } from '../../components/appActions';
import { WelcomeModal } from '../../components/welcomeModal';
import { Error } from '../../components/error';
import { SEO } from '../../components/seo';
import { appStoreLink } from '../../config';

const Profile = ({
  user_id,
  preview_image,
  nickname,
  bio,
  name,
  share_url,
  no_of_views,
  no_of_videos,
  no_of_replies,
  profile_image,
  videos = [],
}) => {
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

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const totalVideos = videos?.length ?? 0;

  const getNextVideo = () => {
    if (currentVideoIndex < totalVideos - 1) {
      setCurrentVideoIndex((old) => old + 1);
    } else {
      setCurrentVideoIndex(0);
    }
  };
  const getPrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex((old) => old - 1);
    } else {
      setCurrentVideoIndex(totalVideos - 1);
    }
  };

  const showGetAppToViewDialog = () =>
    handleShowModalAppDownload(() => <>Get the app to view this video.</>);
  
  const abbreviateNumber = (value) => {
      var newValue = value;
      if (value >= 1000) {
          var suffixes = ["", "k", "m", "b","t"];
          var suffixNum = Math.floor( (""+value).length/3 );
          var shortValue = '';
          for (var precision = 2; precision >= 1; precision--) {
              shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
              var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
              if (dotLessShortValue.length <= 2) { break; }
          }
          if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
          newValue = shortValue+suffixes[suffixNum];
      }
      return newValue;
  }

  const ORG_SCHEMA = JSON.stringify({
    "@context": "http://schema.org",
    "@type": "ProfilePage",
    "id": `${share_url}`,
    "url": `${share_url}`,
    "name": `@${nickname} on Genuin &vert; Connect with @${nickname} with a video reply`,
    "isPartOf": "https://begenuin.com/#website",
    "image": `${share_url}/#primaryimage`,
    "thumbnailUrl": `${preview_image}`,
    "description": `@${nickname} on Genuin &vert; ${abbreviateNumber(no_of_views)} Views. ${no_of_videos} Videos. ${no_of_replies} Replies. ${bio.replace(/\s+/g, ' ')}`,
    "inLanguage": "en-US",

    "potentialAction": [
        {
          "@type" : "ReadAction",
          "target" : `${share_url}`
        }
    ]
  })

  return !Boolean(user_id) ? (
    <Error />
  ) : (
    <Layout>
      <SEO
        openGraphType="profile"
        title={`${Boolean(name) ? `@${nickname}` : `${name} (@${nickname})`} is on Genuin. &vert; Connect with @${nickname} with a video reply`}
        openGraphTitle={`${Boolean(name) ? `@${nickname}` : `${name} (@${nickname})`} is on Genuin. &vert; Connect with @${nickname} with a video reply`}
        description={`${Boolean(name) ? `@${nickname}` : `[${name}] (@${nickname})`} on Genuin. &vert; ${abbreviateNumber(no_of_views)} Views. ${no_of_videos} Videos. ${no_of_replies} Replies. ${bio.replace(/\s+/g, ' ')}`}
        urlToCopy={share_url}
        videoPreviewImage={preview_image}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
      />
      <script type='application/ld+json' dangerouslySetInnerHTML={ { __html: ORG_SCHEMA} } />
      <TopNav showGetAppModal={showGetAppToViewDialog} />
      <Player
        key={currentVideoIndex}
        userName={`@${nickname}`}
        userProfileImage={profile_image}
        videoThumbnail={videos[currentVideoIndex]?.videoThumbnail}
        description={videos[currentVideoIndex]?.description}
        videoUrl={videos[currentVideoIndex]?.videoUrl}
        showGetAppModal={handleShowModalAppDownload}
        getNextVideo={getNextVideo}
        getPrevVideo={getPrevVideo}
        onEnded={showGetAppToViewDialog}
      >
        <AppActions
          showGetAppModal={handleShowModalAppDownload}
          userName={`@${nickname}`}
          videoUrl={globalThis?.location?.href}
          videoDescription={videos[currentVideoIndex]?.description}
          videoTitle='Genuin'
        />
      </Player>
      <GetAppModal
        show={showModalAppDownload}
        onClose={handleCloseAppDownload}
        TextNode={getAppComponentRef.current}
        getAppLink={appStoreLink}
      />
      <WelcomeModal show={showModalWelcome} onClose={handleCloseWelcome} />
    </Layout>
  );
};
Profile.getInitialProps = async ({ query: { share_string } }) => {
  if (
    share_string !== undefined &&
    share_string !== null &&
    share_string !== ''
  ) {
    var url_to_use = `${process.env.apiurl}/api/v3/p/web?username=${share_string}&start=0&rows=10`;
    return axios
      .get(url_to_use)
      .then((response) => {
        return Promise.resolve(response?.data?.data ?? {});
      })
      .catch((err) => {
        return Promise.resolve({});
      });
  } else {
    return Promise.resolve({});
  }
};
export default Profile;
