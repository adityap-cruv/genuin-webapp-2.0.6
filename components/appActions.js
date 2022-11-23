import { Image } from "react-bootstrap";
import { ShareComponent } from "../components/share";
import linkIcon from "../images/video-more-options/ic-link.svg";
import bookmark from "../images/video-more-options/ic-bookmark.svg";
import replay from "../images/video-more-options/ic-replay.svg";
import comments from "../images/video-more-options/ic-comments.svg";
import subscribePlus from "../images/video-more-options/ic-subscribe-plus.svg";
import { Menu, MenuButton, MenuList } from "@chakra-ui/react";
import CopyLink from "../images/video-actions/CopyLink.svg";
import Email from "../images/video-actions/Email.svg";
import Facebook from "../images/video-actions/Facebook.svg";
import LinkedIN from "../images/video-actions/LinkedIN.svg";
import Twitter from "../images/video-actions/Twitter.svg";
import WhatsApp from "../images/video-actions/WhatsApp.svg";
import shareImg from "../images/video-more-options/ic-share.svg";
import {
  WhatsappShareButton,
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from "react-share";

export const AppActions = ({
  showGetAppModal,
  userName,
  link,
  roundTableName,
  roundTable = false,
  videoUrl = "",
  videoDescription = "",
  videoTitle = "",
}) => {
  console.log("link", link);
  return (
    <ul>
      {link ? (
        <li>
          <a href={link} target='_blank'>
            <Image
              src={linkIcon.src}
              width='24'
              height='24'
              alt='Link'
              title='Link'
            />
          </a>
        </li>
      ) : null}
      {!roundTable ? (
        <>
          <li>
            <Image
              src={bookmark.src}
              width='24'
              height='24'
              alt='Bookmark'
              title='Bookmark'
              onClick={() =>
                showGetAppModal(() => (
                  <>
                    Get the app to <b>bookmark</b> this video.
                  </>
                ))
              }
            />
          </li>
          <li>
            <ShareButton
              videoUrl={videoUrl}
              videoDescription={videoDescription}
              videoTitle={videoTitle}
            />
          </li>
          <li>
            <Image
              src={replay.src}
              width='24'
              height='24'
              alt='Replay'
              title='Replay'
              onClick={() =>
                showGetAppModal(() => (
                  <>
                    Get the app to reply to <b>{userName}</b>
                  </>
                ))
              }
            />
          </li>
        </>
      ) : null}
      {roundTable ? (
        <>
          <li>
            <Image
              src={comments.src}
              width='24'
              height='24'
              alt='Comments'
              title='Comments'
              onClick={() =>
                showGetAppModal(() => (
                  <>Get the app to watch the comments on this video.</>
                ))
              }
            />
          </li>
          <li>
            <ShareButton
              videoUrl={videoUrl}
              videoDescription={videoDescription}
              videoTitle={videoTitle}
            />
          </li>
          <li>
            <Image
              src={subscribePlus.src}
              width='24'
              height='24'
              alt='Subscribe Plus'
              title='Subscribe Plus'
              onClick={() =>
                showGetAppModal(() => (
                  <>
                    Get the app to subscribe to <b>{roundTableName ?? ""}</b>{" "}
                    roundtable.
                  </>
                ))
              }
            />
          </li>
        </>
      ) : null}
    </ul>
  );
};

const ShareButton = ({ videoUrl, videoDescription, videoTitle }) => {
  return (
    <Menu placement='right' preventOverflow gutter={40}>
      <>
        <MenuButton pos='relative'>
          <Image width={24} height={24} src={shareImg.src} />
        </MenuButton>
        <MenuList
          minW='max-content'
          p={3}
          gap={3}
          display='flex'
          flexDir='column'
          mb={16}
        >
          <WhatsappShareButton url={videoUrl} title={videoTitle}>
            <Image width={48} height={48} src={WhatsApp.src} />
          </WhatsappShareButton>
          <TwitterShareButton url={videoUrl} title={videoTitle}>
            <Image width={48} height={48} src={Twitter.src} />
          </TwitterShareButton>
          <LinkedinShareButton url={videoUrl} title={videoTitle}>
            <Image width={48} height={48} src={LinkedIN.src} />
          </LinkedinShareButton>
          <FacebookShareButton url={videoUrl} title={videoTitle}>
            <Image width={48} height={48} src={Facebook.src} />
          </FacebookShareButton>
          <EmailShareButton
            url={videoUrl}
            title={videoTitle}
            subject={videoTitle}
            body={videoDescription}
          >
            <Image width={48} height={48} src={Email.src} />
          </EmailShareButton>
          <ShareComponent
            url={videoUrl}
            description={videoDescription}
            title={videoTitle}
          />
        </MenuList>
      </>
    </Menu>
  );
};
