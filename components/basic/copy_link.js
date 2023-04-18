//! this is unused file please modify this comment when using it.

import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useClipboard } from '../hooks/useClipboard'
import icCopyLink from '../../assets/images/video-actions/icon-copy-link.svg' // disabled..
import { Image } from '@chakra-ui/react'

export const CopyLink = ({ url }) => {
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
    <Image
      cursor='pointer'
      src={icCopyLink.src}
      alt='copy link!'
      title='copy link!'
      onClick={copy}
    />
  )
}
