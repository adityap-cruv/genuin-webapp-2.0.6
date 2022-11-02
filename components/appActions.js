import { Image } from 'react-bootstrap';
import { ShareComponent } from '../components/share';
import linkIcon from '../images/video-more-options/ic-link.svg';
import bookmark from '../images/video-more-options/ic-bookmark.svg';
import replay from '../images/video-more-options/ic-replay.svg';
import comments from '../images/video-more-options/ic-comments.svg';
import subsribePlus from '../images/video-more-options/ic-subsribe-plus.svg';

export const AppActions = ({
  showGetAppModal,
  userName,
  link,
  roundTableName,
  roundTable = false,
  videoUrl = '',
  videoDescription = '',
  videoTitle = '',
}) => {
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
            <Image
              src={subsribePlus.src}
              width='24'
              height='24'
              alt='Subsribe Plus'
              title='Subsribe Plus'
              onClick={() =>
                showGetAppModal(() => (
                  <>
                    Get the app to subscribe to <b>{roundTableName ?? ''}</b>{' '}
                    roundtable.
                  </>
                ))
              }
            />
          </li>
        </>
      ) : null}
      <li>
        <ShareComponent
          url={videoUrl}
          description={videoDescription}
          title={videoTitle}
        />
      </li>
    </ul>
  );
};