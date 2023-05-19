import React from 'react'
import { Col, Button } from 'react-bootstrap'
import { Text, Link, Image } from '@chakra-ui/react'
import {
  appleAppStoreLink,
  appStoreLink,
  googlePlayStoreLink
} from '../../config'

import ios from '../../assets/images/badge_appstore.png'
import android from '../../assets/images/badge_playstore.png'
import { handleLink } from '../../actions/appInstall'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

export const InstallApp = ({ small = false, errorPage = false, onClick = () => {} }) => {
  const router = useRouter()

  return (
    <>
      {isMobile && !errorPage && router.pathname !== '/' && (
        <Button onClick={onClick} style={{ width: '334px' }}>
          <Link href={appStoreLink} isExternal>
            <Text fontSize={20} fontWeight='bold'>
              Get App
            </Text>
          </Link>
        </Button>
      )}

      {isMobile && errorPage && router.pathname !== '/' && (
        <Button onClick={onClick}>
          <Link href={appStoreLink} isExternal>
            <Text fontSize={20} fontWeight='bold'>
              Download App
            </Text>
          </Link>
        </Button>
      )}

      {isMobile && router.pathname === '/' && (
        <Button onClick={onClick} style={{ width: '90%' }}>
          <Link href={appStoreLink} isExternal>
            <Text fontSize={20} fontWeight='bold'>
                Get App
            </Text>
          </Link>
        </Button>
      )}

      {!isMobile && (
        <>
          <Col
            className='d-flex align-items-center justify-content-end ps-4 ps-sm-0'
          >
            <Image
              src={ios.src}
              onClick={() => {
                onClick()
                handleLink(appleAppStoreLink)
              }}
              style={{
                cursor: 'pointer',
                paddingRight: '11px'
              }}
              height={small ? 10 : 16}
              alt='iOs App Store'
              title='iOs App Store'
            />
          </Col>
          <Col
            className='d-flex align-items-center'
          >
            <Image
              src={android.src}
              onClick={() => {
                onClick()
                handleLink(googlePlayStoreLink)
              }}
              style={{
                cursor: 'pointer'
              }}
              height={small ? 10 : 16}
              alt='Android Play Store'
              title='Android Play Store'
            />
          </Col>
        </>
      )}
    </>
  )
}
