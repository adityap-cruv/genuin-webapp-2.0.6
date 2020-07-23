import React from 'react'
// import ReactPlayer from 'react-player'
import { Container, Row, Col } from 'react-grid-system';
import { Card } from 'react-bootstrap';
import Layout from "../components/Layout";
import ReactPlayer from 'react-player';
import copy from 'copy-to-clipboard';
import Highlighter from "react-highlight-words";
import Link from 'next/link';
import Microlink from '@microlink/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlay, faPause, faCommentDots, faEye, faEyeDropper } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faWhatsapp, faTwitter } from "@fortawesome/free-brands-svg-icons";
import Error from 'next/error';

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copyText: 'copy',
      playedSeconds: 0,
      loaded: 0,
      playing: false,
      buttonVisible: 'block'
    };
    if (typeof window === 'undefined') {
      global.window = {}
    }
  }

  handleCopy = state => {
    copy(this.props.link);
    this.setState({ copyText: "Copied!" });
  }

  handlePlay = () => {
    console.log('onPlay')
    this.setState({ playing: true })
    this.setState({ buttonVisible: 'none' })
  }

  handlePause = () => {
    console.log('onPause')
    this.setState({ playing: false })
    this.setState({ buttonVisible: 'block' })
  }

  handleProgress = state => {
    console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }
  handlePlayPause = () => {
    console.log(this.state.playing)
    this.setState({ playing: !this.state.playing })
  }


  render() {
    if (this.props.videoUrl == undefined || this.props.videoUrl == null || this.props.videoUrl == '') return <Error statusCode="404" />;
    const hashtags = this.props.description.match(/#\w+/g) || [];
    const currentUrl = process.env.hostname + this.props.asPath;
    let preview = '';
    if (this.props.link == '' || this.props.link == undefined || this.props.link == null) {
      preview = '';
    } else {
      preview = <Microlink url={this.props.link} style={{ maxWidth: '783px', height: '100px', backgroundColor: 'lightgrey' }} />
    }
    return (
      <Layout title="Genuin" content={this.props.videoThumbnail} description={this.props.description} currentUrl={currentUrl} keyword='genuine'>
        <Card style={{ width: '50rem', height: '99%', borderRadius: '10px' }}>
          <Card.Body >
            <Container fluid="md">
              <Row className="d-block">
                <Col md={6} className="padding-0 w-100">
                  <span className="d-none" style={{
                    position: 'absolute', top: '4%', left: '16%', zIndex: '1', fontFamily: 'AvenirNext-DemiBold',
                    // color: '#FFFFFF',
                    fontSize: '16pt'
                  }}>{this.state.playedSeconds.toFixed(0)} Sec</span>
                  <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} className="playbtn" onClick={this.handlePlayPause} style={{ color: 'rgb(255 255 255 / 0.4)', width: '14%', cursor: 'pointer', right: '44%', zIndex: '999999', position: 'absolute', top: '44%', display: this.state.buttonVisible }} />

                  <div className="d-none">
                    <div style={{ marginTop: '30px', width: '50%' }}>
                      <FontAwesomeIcon className="commentIcon" icon={faCommentDots} style={{ width: '6%', color: 'white', right: '79%', zIndex: '999999', position: 'absolute', top: '93.2%' }} />
                      <span className="commentxt" style={{ lineHeight: '28px', width: '6%', color: 'white', right: '72%', zIndex: '999999', position: 'absolute', top: '93%', fontSize: '16pt', fontFamily: 'AvenirNext-DemiBold' }}>{this.props.noOfConversation}
                        <sub style={{ position: 'relative', fontSize: '10pt', bottom: '6px' }}>replies</sub></span>
                    </div>
                    <div style={{ width: '50%' }}>
                      <FontAwesomeIcon className="eyeIcon" icon={faEye} style={{ width: '6%', color: 'white', right: '51%', zIndex: '999999', position: 'absolute', top: '93.2%' }} />
                      <span className="viewtxt" style={{ lineHeight: '28px', width: '9%', color: 'white', right: '40%', zIndex: '999999', position: 'absolute', top: '93%', fontSize: '16pt', fontFamily: 'AvenirNext-DemiBold' }}>{this.props.noOfViews}
                        <sub style={{ position: 'relative', fontSize: '10pt', bottom: '6px', left: '2px' }}>views</sub></span>
                    </div>
                  </div>
                  <div className="content tag" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '16pt', height: 'auto', marginBottom: '0', overflow: 'inherit', background: '#000', borderRadius: '0px' }}>
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#bfe4f3' }}
                      highlightClassName="match"
                      searchWords={hashtags}
                      textToHighlight={this.props.description}
                    />
                  </div>
                  <ReactPlayer
                    className='react-player fixed-bottom'
                    url={this.props.videoUrl}
                    playing={this.state.playing}
                    width='350px'
                    height='620px'
                    style={{
                      marginTop: '-3%', borderRadius: '22px', overflow: 'hidden', cursor: 'pointer'
                    }}
                    controls={false}
                    // light={true}
                    onClick={this.handlePlayPause}
                    onPlay={this.handlePlay}
                    onPause={this.handlePause}
                    onProgress={this.handleProgress}
                  />
                  <div className="my app-download">
                    <img src="https://imgur.com/URiFQhg.png" alt="imges" style={{ position: 'absolute', bottom: '0px', padding: '0 20px', maxWidth: '100%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  </div>
                </Col>
                <Col md={6} className="d-none" style={{ paddingLeft: '0px', paddingRight: '30px' }}>
                  <div className="content" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '28pt', marginTop: '15px', marginBottom: '10px', height: '476px', overflowX: 'hidden' }}>
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#bfe4f3' }}
                      highlightClassName="match"
                      searchWords={hashtags}
                      textToHighlight={this.props.description}
                    />
                  </div>
                  <div className="applink" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '13.9pt', marginTop: '0%', color: ' #333333' }}>        <Link href="/">
                    <a style={{ color: '#0645FF' }}>Get the App</a>
                  </Link> to reply and make genuin connection</div>
                  <div className="sociallink" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '13.9pt', margin: '2% 0', direction: 'rtl' }}>
                    <Link href="/">
                      <a id="whatsappIcon"><FontAwesomeIcon icon={faWhatsapp} style={{ width: '5%', height: '5%' }} /></a>
                    </Link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <Link href="/">
                      <a id="instaIcon"><FontAwesomeIcon icon={faInstagram} style={{ width: '5%', height: '5%' }} /></a>
                    </Link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <Link href="/">
                      <a id="twitterIcon"><FontAwesomeIcon icon={faTwitter} style={{ width: '6%', height: '5%' }} /></a>
                    </Link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <Link href="/">
                      <a id="facebookIcon"><FontAwesomeIcon icon={faFacebookF} style={{ width: '4%', height: '5%' }} /></a>
                    </Link>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                </div>
                  <div className="media-link padding-0" style={{ width: '100%', height: '29pt', border: '1px #0094D0 solid', borderRadius: '9px', padding: '4px', color: ' #333333' }}>
                    <span className="urltxt" style={{ fontSize: '12pt', fontFamily: 'AvenirNext-DemiBold', fontWeight: 'bold', cursor: 'default', display: 'inline-block', margin: '2px 0 0 6px' }}>
                      {this.props.link}
                    </span>&nbsp;&nbsp;
                      <span class="copytxt" style={{ color: '#FF0000', fontFamily: 'AvenirNext-Bold', textTransform: 'uppercase', margin: '7px 6px 0 0', textAlign: 'right', fontSize: '10pt', cursor: 'pointer', 'display': 'inline-block', 'float': 'right' }} onClick={this.handleCopy}>
                      {this.state.copyText}
                    </span>
                  </div>
                </Col>
              </Row>
              <Row className="d-none">
                <Col md={12}>
                  <div className='linkPreview' style={{ marginTop: '7px' }}>
                    {preview}
                  </div>
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </Card>
      </Layout >
    );
  }
}

export default Player;