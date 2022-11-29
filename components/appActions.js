import { ShareComponent } from "../components/share";
import linkIcon from "../images/video-more-options/ic-link.svg";
import bookmark from "../images/video-more-options/ic-bookmark.svg";
import replay from "../images/video-more-options/ic-replay.svg";
import comments from "../images/video-more-options/ic-comments.svg";
import subscribePlus from "../images/video-more-options/ic-subscribe-plus.svg";
import network from "../images/video-more-options/ic-network.svg";
import roundtable from "../images/video-more-options/ic-roundtable.svg";
import {
  Menu,
  MenuButton,
  MenuList,
  useBreakpointValue,
  Image,
  Link,
} from "@chakra-ui/react";
import Email from "../images/video-actions/Email.svg";
import Facebook from "../images/video-actions/Facebook.svg";
import LinkedIN from "../images/video-actions/LinkedIN.svg";
import Twitter from "../images/video-actions/Twitter.svg";
import WhatsApp from "../images/video-actions/WhatsApp.svg";
import shareImg from "../images/video-more-options/ic-share.svg";
import shareImgBlue from "../images/video-more-options/ic-share-blue.svg";
import {
  WhatsappShareButton,
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from "react-share";
import { useWebShare } from "./hooks/useWebShare";

export const AppActions = ({
  showGetAppModal,
  userName,
  link,
  roundTableName,
  roundTableId = "",
  roundTable = false,
  watchRoundTable = false,
  videoUrl = "",
  videoDescription = "",
  videoTitle = "",
  details,
}) => {
  const mobile = useBreakpointValue({ base: true, sm: false });

  return (
    <ul>
      {link ? (
        <li>
          <a href={link} target='_blank'>
            <Image src={linkIcon.src} size={6} alt='Link' title='Link' />
          </a>
        </li>
      ) : null}
      {!roundTable ? (
        <>
          <li>
            <Image
              src={bookmark.src}
              size={6}
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
            {mobile ? (
              <MobileShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
              />
            ) : (
              <ShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
              />
            )}
          </li>
          <li>
            <Image
              src={replay.src}
              size={6}
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
          <li onClick={() => window.open("https://www.google.com", "_blank")}>
            <Image src={network.src} size={6} alt='Network' title='Network' />
          </li>
          <li>
            <Image
              src={comments.src}
              size={6}
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
            <Image
              src={subscribePlus.src}
              size={6}
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
          <li>
            {mobile ? (
              <MobileShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
              />
            ) : (
              <ShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
              />
            )}
          </li>
          {watchRoundTable && (
            <li>
              <Link href={roundTableId}>
                <Image
                  src={roundtable.src}
                  size={6}
                  alt='Roundtable'
                  title='Roundtable'
                />
              </Link>
            </li>
          )}
        </>
      ) : null}
    </ul>
  );
};

export const ShareButton = ({
  url,
  description,
  title,
  variation = "white",
  ...props
}) => {
  return (
    <Menu placement='right' preventOverflow gutter={40}>
      <>
        <MenuButton pos='relative' {...props} textAlign='-webkit-center'>
          <Image
            size={6}
            src={variation === "white" ? shareImg.src : shareImgBlue.src}
          />
        </MenuButton>
        <MenuList
          minW='max-content'
          p={3}
          gap={3}
          display='flex'
          flexDir='column'
          mb={16}
        >
          <WhatsappShareButton url={url} title={title}>
            <Image size={12} src={WhatsApp.src} />
          </WhatsappShareButton>
          <TwitterShareButton url={url} title={title}>
            <Image size={12} src={Twitter.src} />
          </TwitterShareButton>
          <LinkedinShareButton url={url} title={title}>
            <Image size={12} src={LinkedIN.src} />
          </LinkedinShareButton>
          <FacebookShareButton url={url} title={title}>
            <Image size={12} src={Facebook.src} />
          </FacebookShareButton>
          <EmailShareButton
            url={url}
            title={title}
            subject={title}
            body={description}
          >
            <Image size={12} src={Email.src} />
          </EmailShareButton>
          <ShareComponent url={url} description={description} title={title} />
        </MenuList>
      </>
    </Menu>
  );
};

const MobileShareButton = ({ title, description, url }) => {
  const { isSupported, loading, share } = useWebShare();

  return (
    <Image
      src={shareImg.src}
      size={6}
      alt='Share'
      title='Share'
      onClick={() => {
        if (isSupported && !loading) share({ url, title, text: description });
      }}
    />
  );
};
