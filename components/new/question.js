import React, { useMemo } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { NextSeo } from "next-seo";
import { TopNav } from "../../components/new/topNav";

const ios = require("../../images/badge_appstore.png");
const android = require("../../images/badge_playstore.png");

export const Question = ({
  preview_image,
  asPath,
  question,
  owner,
  question_id,
  genuinurl,
  host,
}) => {
  const handleAndroidInstallClick = () => {
    window.open("https://install.begenuin.com/86sn/cgs");
  };
  const handleIosInstallClick = () => {
    window.open("https://install.begenuin.com/86sn/cgs");
  };
  var currentUrl = useMemo(() => host + asPath, [asPath]);
  const _question = useMemo(() =>
    Boolean(question) ? "Question on Genuin: " + question : question
  );
  const askedBy = useMemo(() =>
    Boolean(owner?.nickname) ? `asked by @${owner.nickname}` : owner?.nickname
  );
  const description = useMemo(
    () => `Answer this trending question on Genuin${askedBy}`,
    [askedBy]
  );

  return (
    <>
      <NextSeo
        title={_question}
        description={description}
        openGraph={{
          type: "object",
          url: currentUrl,
          title: `${_question}`,
          images: [
            {
              url: preview_image,
              width: 1084,
              height: 546,
              alt: "Genuin",
            },
            {
              url: preview_image,
              width: 300,
              height: 200,
              alt: "Genuin",
              // type:'image/png'
            },
          ],
          site_name: "Genuin",
        }}
        facebook={{
          appId: 1234567890,
        }}
        twitter={{
          handle: "@handle",
          site: "@site",
          cardType: "summary_large_image",
        }}
      />
      {Boolean(question_id) ? (
        <>
          <section className="w-100 h-100 bg-gradient-blue d-flex align-items-center">
            <Container>
              <Row className="mb-5">
                <Col
                  xs={12}
                  lg={10}
                  className="d-flex align-items-center justify-content-center mx-auto"
                >
                  <Image
                    src={preview_image}
                    width={1084}
                    height={546}
                    alt="Question"
                    title="Question"
                    fluid
                    className="rounded-5"
                  />
                </Col>
              </Row>
              <Row xs={2} className="justify-content-center">
                <Col
                  sm="auto"
                  className="d-flex align-items-center justify-content-end ps-4 ps-sm-0"
                >
                  <Image
                    src={ios}
                    onClick={handleIosInstallClick}
                    width={204}
                    height={60}
                    alt="iOs App Store"
                    title="iOs App Store"
                    fluid
                  />
                </Col>
                <Col
                  sm="auto"
                  className="d-flex align-items-center justify-content-start  pe-4 ps-em-0"
                >
                  <Image
                    src={android}
                    width={204}
                    height={60}
                    onClick={handleAndroidInstallClick}
                    alt="Android Play Store"
                    title="Android Play Store"
                    fluid
                  />
                </Col>
              </Row>
            </Container>
          </section>
        </>
      ) : (
        <>
          <section className="w-100 h-100 bg-gradient-blue d-flex align-items-center">
            <TopNav />
            <Container>
              <Row className="mb-5">
                <Col
                  xs={12}
                  lg={10}
                  className="d-flex align-items-center justify-content-center mx-auto text-center text-white flex-column"
                >
                  <h2 className="fw-bold mb-4 h1">
                    Sorry, this page isn't available.
                  </h2>
                  <p className="fs-3">
                    The link you followed may be broken, or the page may have
                    been removed. Go to{" "}
                    <a href={genuinurl ?? ""}>Genuin Home Page.</a>
                  </p>
                </Col>
              </Row>
              <Row xs={2} className="justify-content-center">
                <Col
                  sm="auto"
                  className="d-flex align-items-center justify-content-end ps-4 ps-sm-0"
                >
                  <Image
                    src={ios}
                    onClick={handleIosInstallClick}
                    width={204}
                    height={60}
                    alt="iOs App Store"
                    title="iOs App Store"
                    fluid
                  />
                </Col>
                <Col
                  sm="auto"
                  className="d-flex align-items-center justify-content-start  pe-4 ps-em-0"
                >
                  <Image
                    src={android}
                    width={204}
                    height={60}
                    onClick={handleAndroidInstallClick}
                    alt="Android Play Store"
                    title="Android Play Store"
                    fluid
                  />
                </Col>
              </Row>
            </Container>
          </section>
        </>
      )}
    </>
  );
};
