import views from "../images/views.svg";
import comments from "../images/comments.svg";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Player } from "./player";
import { AppActions } from "./appActions";

export const VideoThumbnail = ({
  video,
  userName,
  profileImage,
  showGetAppModal,
  onEnded,
  getNextVideo,
  getPrevVideo,
}) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className='video-thumbnail-wrapper' onClick={handleShow}>
      <img src={video.videoThumbnail} className='video-thumbnail' />
      <div className='video-thumbnail-icons'>
        <div>
          <img src={comments.src} style={{ paddingRight: 2 }} />{" "}
          {video.noOfConversation}
        </div>
        <div>
          <img src={views.src} style={{ paddingRight: 3 }} />
          {video.noOfViews}
        </div>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className='modal-app-download'
      >
        <button onClick={handleClose}>close</button>
        <Player
          key={video.video_uuid}
          video_id_to_use={video.video_uuid}
          description={video.description}
          videoUrl={video.videoUrl}
          videoThumbnail={video.videoThumbnail}
          userName={`@${userName}`}
          userProfileImage={profileImage}
          showGetAppModal={showGetAppModal}
          onEnded={onEnded}
          getNextVideo={getNextVideo}
          getPrevVideo={getPrevVideo}
        >
          <AppActions
            showGetAppModal={showGetAppModal}
            userName={`@${userName}`}
            link={video.link}
            videoUrl={globalThis?.location?.href}
            videoDescription={video.description}
            videoTitle='Genuin'
          />
        </Player>
      </Modal>
    </div>
  );
};
