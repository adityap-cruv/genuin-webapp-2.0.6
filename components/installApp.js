import { Col, Button } from "react-bootstrap";
import { Text, Link, Image } from "@chakra-ui/react";
import {
  appleAppStoreLink,
  appStoreLink,
  googlePlayStoreLink,
} from "../config";
import { useBreakpointValue } from "@chakra-ui/react";

import ios from "../images/badge_appstore.png";
import android from "../images/badge_playstore.png";
import { handleLink } from "../actions/appInstall";

export const InstallApp = ({ small = false, onClick = () => {} }) => {
  const mobile = useBreakpointValue({ base: true, sm: false });

  return (
    <>
      {mobile && (
        <Button onClick={onClick}>
          <Link href={appStoreLink} isExternal>
            <Text fontSize={24} fontWeight='bold'>
              Download App
            </Text>
          </Link>
        </Button>
      )}

      {!mobile && (
        <>
          <Col
            xs='6'
            lg='auto'
            className='d-flex align-items-center justify-content-end ps-4 ps-sm-0'
          >
            <Image
              src={ios.src}
              onClick={() => {
                onClick();
                handleLink(appleAppStoreLink);
              }}
              style={{
                cursor: "pointer",
                paddingRight: "11px",
              }}
              height={small ? 10 : 16}
              alt='iOs App Store'
              title='iOs App Store'
            />
          </Col>
          <Col
            xs='6'
            lg='auto'
            className='d-flex align-items-center justify-content-start pe-4 ps-em-0'
          >
            <Image
              src={android.src}
              onClick={() => {
                onClick();
                handleLink(googlePlayStoreLink);
              }}
              style={{
                cursor: "pointer",
              }}
              height={small ? 10 : 16}
              alt='Android Play Store'
              title='Android Play Store'
            />
          </Col>
        </>
      )}
    </>
  );
};
