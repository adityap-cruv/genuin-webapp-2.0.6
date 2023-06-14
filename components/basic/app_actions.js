import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  Menu,
  MenuButton,
  useBreakpointValue,
  Image
} from '@chakra-ui/react'
import { generateDeepLink, openGeneratedLink } from '../utility'

import { useWebShare } from '../hooks/useWebShare'
import { useClipboard } from '../hooks/useClipboard'
import shareImg from '../../assets/images/video-more-options/ic-share.svg'
import shareImgBlue from '../../assets/images/video-more-options/ic-share-blue.svg'
import bookmark from '../../assets/images/video-more-options/ic-bookmark.svg'
import replay from '../../assets/images/video-more-options/ic-replay.svg'
import comments from '../../assets/images/video-more-options/ic-comments.svg'
import subscribePlus from '../../assets/images/video-more-options/ic-subscribe-plus.svg'
import network from '../../assets/images/video-more-options/ic-network.svg'
import roundtable from '../../assets/images/video-more-options/ic-roundtable.svg'
import { isMobile } from 'react-device-detect'

export const AppActions = ({
  showGetAppModal,
  userName,
  link,
  roundTableName,
  roundTableId = '',
  roundTable = false,
  watchRoundTable = false,
  videoUrl = '',
  videoDescription = '',
  videoTitle = '',
  deepLinkParams,
  sourceId
}) => {
  const mobile = useBreakpointValue({ base: true, sm: false })

  const getClickableLink = (link = '') => {
    if (link !== null && link !== undefined) {
      return link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `http://${link}`
    }
    return ''
  }
  const userLink = getClickableLink(link)
  return (
    <ul>
      {link ? (
        <li>
          <a href={userLink} target='_blank' rel="noreferrer">
            <Image src={network.src} size={6} alt='Link' title='Link' />
          </a>
        </li>
      ) : null}
      {!roundTable ? (
        <>
          <li onClick={() => {
            if (isMobile) {
              generateDeepLink({
                action: 'save',
                contentType: 'pv',
                title: deepLinkParams.metaTitle,
                description: deepLinkParams.metaDescription,
                fromUserName: deepLinkParams.geshc,
                pathName: deepLinkParams.pathName,
                previewImage: deepLinkParams.metaPreviewImage,
                sourceId,
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: deepLinkParams.hostName,
                parentId: roundTableId
              }).then(link => openGeneratedLink(link))
                .catch(e => window.open(process.env.hostname))
            } else {
              showGetAppModal(() => (
                <>
                  Get the app to <b>bookmark</b> this video.
                </>
              ))
            }
          }
          }>
            <Image
              src={bookmark.src}
              size={6}
              alt='Bookmark'
              title='Bookmark'
            />
          </li>
          <li>
            {mobile ? (
              <MobileShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
                white
                fullWidth={true}
                deepLinkParams={deepLinkParams}
              />
            ) : (
              <ShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
                fullWidth={true}
              />
            )}
          </li>
          <li onClick={() => {
            if (isMobile) {
              generateDeepLink({
                action: 'reply',
                contentType: 'pv',
                title: deepLinkParams.metaTitle,
                description: deepLinkParams.metaDescription,
                fromUserName: deepLinkParams.geshc,
                pathName: deepLinkParams.pathName,
                previewImage: deepLinkParams.metaPreviewImage,
                sourceId,
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: deepLinkParams.hostName,
                parentId: roundTableId
              }).then(link => openGeneratedLink(link))
                .catch(e => window.open(process.env.hostname))
            } else {
              showGetAppModal(() => (
                <>
                  Get the app to reply to <b>{'@' + userName}</b>
                </>
              ))
            }
          }
          }>
            <Image
              src={replay.src}
              size={6}
              alt='Reply'
              title='Reply'
            />
          </li>
        </>
      ) : null}

      {roundTable ? (
        <>
          <li onClick={() => {
            if (isMobile) {
              generateDeepLink({
                action: 'comment',
                contentType: 'loop',
                title: deepLinkParams.metaTitle,
                description: deepLinkParams.metaDescription,
                fromUserName: deepLinkParams.geshc,
                pathName: deepLinkParams.pathName,
                previewImage: deepLinkParams.metaPreviewImage,
                sourceId,
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: deepLinkParams.hostName,
                parentId: roundTableId
              }).then(link => openGeneratedLink(link))
                .catch(e => window.open(process.env.hostname))
            } else {
              showGetAppModal(() => (
                <>Get the app to watch the comments on this video.</>
              ))
            }
          }
          }>
            <Image
              src={comments.src}
              size={6}
              alt='Comments'
              title='Comments'
            />
          </li>
          <li onClick={() => {
            if (isMobile) {
              generateDeepLink({
                action: 'subscribe',
                contentType: 'loop',
                title: deepLinkParams.metaTitle,
                parentId: roundTableId,
                description: deepLinkParams.metaDescription,
                fromUserName: deepLinkParams.geshc,
                pathName: deepLinkParams.pathName,
                previewImage: deepLinkParams.metaPreviewImage,
                sourceId,
                utmCampaign: 'share',
                utmMedium: 'web',
                utmSource: deepLinkParams.hostName,
                parentId: roundTableId
              }).then(link => openGeneratedLink(link))
                .catch(e => window.open(process.env.hostname))
            } else {
              showGetAppModal(() => (
                <>
                  Get the app to subscribe to <b>{roundTableName ?? ''}</b>{' '}
                  Loop.
                </>
              ))
            }
          }
          }>
            <Image
              src={subscribePlus.src}
              size={6}
              alt='Subscribe'
              title='Subscribe'
            />
          </li>
          <li>
            {mobile ? (
              <MobileShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
                white
                fullWidth={true}
                deepLinkParams={deepLinkParams}
              />
            ) : (
              <ShareButton
                url={videoUrl}
                description={videoDescription}
                title={videoTitle}
                fullWidth={true}
              />
            )}
          </li>
          {watchRoundTable && (
            <li onClick={() => { window.location.href = roundTableId }}>
              <Image
                src={roundtable.src}
                size={6}
                alt='Roundtable'
                title='Roundtable'
              />
            </li>
          )}
        </>
      ) : null}
    </ul>
  )
}

export const ShareButton = ({
  url,
  description,
  title,
  variation = 'white',
  fullWidth = false,
  ...props
}) => {
  const [isCopied, copy] = useClipboard(url, { successDuration: 1000 })

  useEffect(() => {
    if (isCopied) {
      const key = toast('Link copied!', {
        autoClose: false,
        hideProgressBar: true
      })
      return () => {
        toast.dismiss(key)
      }
    }
  }, [isCopied])

  return (
    <Menu placement='right' preventOverflow gutter={40}>
      <>
        <MenuButton onClick={copy}
          title="copy link!"
          style={{
            width: fullWidth ? '100%' : 'auto',
            height: fullWidth ? '100%' : 'auto'
          }}
          pos='relative'
          {...props}
          textAlign='-webkit-center'>
          <Image
            title="copy link!"
            size={6}
            src={variation === 'white' ? shareImg.src : shareImgBlue.src}
            margin='auto'
          />
        </MenuButton>
        {/* <MenuList
          minW='max-content'
          p={3}
          gap={3}
          display='flex'
          flexDir='column'
          mb={16}
        >
          {/* <WhatsappShareButton url={url} title={title}>
            <Image size={12} src={WhatsApp.src} />
          </WhatsappShareButton>
          <TwitterShareButton url={url} title={title}>
            <Image size={12} src={Twitter.src} />
          </TwitterShareButton>
          <LinkedinShareButton url={url} title={title}>
            <Image size={12} src={LinkedIN.src} />
          </LinkedinShareButton>
          <FacebookShareButton url={url}>
            <Image size={12} src={Facebook.src} />
          </FacebookShareButton>
          <EmailShareButton
            url={url}
            // title={title}
            // subject={title}
            // body={description}
          >
            <Image size={12} src={Email.src} />
          </EmailShareButton>
           description={description} title={title}>
        </MenuList> */}
      </>
    </Menu>
  )
}

export const MobileShareButton = ({
  url,
  white = false,
  fullWidth = false,
  deepLinkParams = null
}) => {
  const { isSupported, loading, share } = useWebShare()

  return (
    <Image
      src={white ? shareImg.src : shareImgBlue.src}
      size={8}
      className="profile_share"
      padding={fullWidth ? '10px' : 'unset'}
      alt='Share'
      title='Share'
      bgColor='transparent'
      border={white ? 'none' : '1px solid #0645FF'}
      borderRadius='md'
      px={1}
      minW={8}
      onClick={() => {
        // if (deepLinkParams) {
        //   generateDeepLink({
        //     utmCampaign: 'share',
        //     action: 'share',
        //     contentType: 'profile',
        //     description: deepLinkParams.metaDescription,
        //     title: deepLinkParams.metaTitle,
        //     fromUserName: deepLinkParams.geshc,
        //     pathName: deepLinkParams.pathName,
        //     previewImage: deepLinkParams.metaPreviewImage,
        //     utmMedium: 'web',
        //     utmSource: deepLinkParams.hostName
        //   }).then(generatedLink => {
        //     if (isSupported && !loading) share({ url: generatedLink })
        //   }).catch(e => {
        //     if (isSupported && !loading) share({ url })
        //   })
        // } else {
          if (isSupported && !loading) share({ url })
        // }
      }}
    />
  )
}
