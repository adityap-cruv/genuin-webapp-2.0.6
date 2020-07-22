import React from 'react'
// import ReactPlayer from 'react-player'
import { Container, Row, Col } from 'react-grid-system';
import { Card } from 'react-bootstrap';
import Layout from "../components/Layout";
import ReactPlayer from 'react-player';
import router from 'next/router';
import copy from 'copy-to-clipboard';
import Highlighter from "react-highlight-words";
import Link from 'next/link';
import Microlink from '@microlink/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTimes, faPlay, faPause, faCommentDots, faEye, faEyeDropper } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faWhatsapp, faTwitter } from "@fortawesome/free-brands-svg-icons";
import Error from 'next/error';
import custom from './custom.scss';

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
    // console.log("path",currentUrl);
    return (
      <Layout title="Genuin" content={this.props.videoThumbnail} description={this.props.description} currentUrl={currentUrl} keyword='genuine'>
        <Card style={{ width: '50rem', height: '99%', borderRadius: '10px' }}>
          <Card.Body >
            <Container fluid="md">
              <Row>
                <Col md={6}>
                  <span style={{
                    position: 'absolute', top: '4%', left: '20%', zIndex: '1',
                    // color: '#FFFFFF',
                    fontSize: '20pt'
                  }}>{this.state.playedSeconds.toFixed(0)} Sec</span>
                  <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} className="playbtn" onClick={this.handlePlayPause} style={{ width: '14%', cursor: 'pointer', right: '44%', zIndex: '999999', position: 'absolute', top: '39%', display: this.state.buttonVisible }} />
                  <FontAwesomeIcon className="commentIcon" icon={faCommentDots} style={{ width: '5%', color: 'white', right: '78%', zIndex: '999999', position: 'absolute', top: '94%' }} />
                  <span className="commentxt" style={{ width: '5%', color: 'white', right: '72%', zIndex: '999999', position: 'absolute', top: '93%' }}>{this.props.noOfConversation}replies</span> &nbsp;
                  <FontAwesomeIcon className="eyeIcon" icon={faEye} style={{ width: '5%', color: 'white', right: '50%', zIndex: '999999', position: 'absolute', top: '94%' }} />
                  <span className="viewtxt" style={{ width: '5%', color: 'white', right: '44%', zIndex: '999999', position: 'absolute', top: '93%' }}>{this.props.noOfViews}views</span>
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
                </Col>
                <Col md={6}>
                  <div className="content" style={{fontWeight: '600',fontSize: '26.9pt', marginTop: '15px' }}>
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#bfe4f3' }}
                      highlightClassName="match"
                      searchWords={hashtags}
                      textToHighlight={this.props.description}
                    />
                  </div>
                  <div className="applink" style={{ fontSize: '13.9pt', marginTop: '69%' }}>        <Link href="/">
                    <a>Get the App</a>
                  </Link> to reply and make genuin connection</div>
                  <div className="sociallink" style={{fontSize: '13.9pt', marginTop: '3%', direction: 'rtl' }}>
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
                  <div className="media-link" style={{ width: '100%', height: '29pt', border: '1px #0094D0 solid', borderRadius: '9px', padding: '4px', }}>
                    <span className="urltxt" style={{ fontSize: '15pt', fontWeight: 'bold', cursor: 'default', display: 'inline-block', marginTop: '-10px' }}>
                      {this.props.link}
                    </span>&nbsp;&nbsp;
                      <span class="copytxt" style={{ color: '#FF0000', textAlign: 'right', fontSize: '15pt', cursor: 'pointer', 'display': 'inline-block', 'float': 'right', 'marginTop': '-4px' }} onClick={this.handleCopy}>
                      {this.state.copyText}
                    </span>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <div className='linkPreview' style={{ marginTop: '7px' }}>
                    {/* <FontAwesomeIcon icon={faTimes} style={{ width: '1%', height: '6%', zIndex: '99999999',position: 'fixed',right: '13%' }} /> */}
                    <Microlink url={this.props.link} style={{ maxWidth: '783px', height: '100px', backgroundColor: 'lightgrey' }} />
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