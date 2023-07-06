import React from 'react'
import { Button } from 'react-bootstrap'
import trayArrow from '../../assets/images/tray_arrow.svg'
import { motion } from 'framer-motion'
import { isDesktop } from 'react-device-detect'
import { analyticsService } from '../basic/analytics_service'

const MobileIndexBottomComponent = ({
  showTray = true,
  showModalAppDownload,
  scrollToReel
}) => {
  return <>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center'
      }}>
      <Button
        variant='primary'
        onClick={() => {
          if (isDesktop) {
            showModalAppDownload()
          } else {
            window.open('https://install.begenuin.com/86sn/cgs')

            // analyticsService for get_app
            const event_name = 'get_app'
            const event_details = {
              page: window.location.href
            }

            analyticsService({ eventDetails: event_details, eventName: event_name })
          }
        }}
        style={{
          fontSize: 15,
          lineHeight: '24px',
          padding: '8px 24px 8px 24px',
          borderRadius: '8px'
        }}
      >
        Get App
      </Button>
    </div>
    {showTray && <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '20px'
      }}>
      <motion.div
        style={{
          opacity: 0.4
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          type: 'tween',
          ease: 'easeIn',
          repeatType: 'mirror'
        }}
      >
        <button
          onClick={scrollToReel}
        >
          <img
            src={trayArrow.src}
          ></img>
        </button>
      </motion.div>
    </div>}
  </>
}

export default MobileIndexBottomComponent
