import React from 'react'
// import ReactPlayer from 'react-player'
import { Container, Row, Col } from 'react-grid-system';
import { Card, Media } from 'react-bootstrap';
import Layout from "../components/Layout";
import ReactPlayer from 'react-player';
import copy from 'copy-to-clipboard';
import Highlighter from "react-highlight-words";
import Link from 'next/link';
import Microlink from '@microlink/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faUser } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faTwitter, faLinkedinIn, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Error from 'next/error';

import {
 TwitterShareButton,
 WhatsappShareButton,
 FacebookShareButton,
 LinkedinShareButton
  } from "react-share";

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copyText: 'copy',
      playedSeconds: 0,
      loaded: 0,
      playing: false,
      buttonVisible: 'block',
      baseUrl: ''
    };
    if (typeof window === 'undefined') {
      global.window = {}
    }
  }

  handleCopy = state => {
    copy(this.state.baseUrl);
    this.setState({ copyText: "Copied!" });
  }

  handlePlay = () => {
    this.setState({ playing: true })
    this.setState({ buttonVisible: 'none' })
  }

  handlePause = () => {
    this.setState({ playing: false })
    this.setState({ buttonVisible: 'block' })
  }

  handleProgress = state => {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }
  handleDuration = (totalDuration) => {
    console.log('totalDuration', totalDuration);
  }
  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }


  render() {
    if (this.props.videoUrl == undefined || this.props.videoUrl == null || this.props.videoUrl == '') return <Error statusCode="404" />;
    const hashtags = this.props.description.match(/#\w+/g) || [];
    this.state.baseUrl = process.env.hostname + this.props.asPath;
    let preview = '';
    if (this.props.link == '' || this.props.link == undefined || this.props.link == null) {
      preview = '';
    } else {
      var metaLink = this.props.link;
      metaLink = (metaLink.indexOf('://') === -1) ? 'http://' + metaLink : metaLink;
      preview = <Microlink media='logo' url={metaLink} style={{ maxWidth: '783px', height: '100px', backgroundColor: 'lightgrey', borderRadius:'5px' }} />
    }
    let metaImage = this.props.videoPreviewImage;
    let metaImageWidth = 1200;
    let metaImageHeight = 630;
    // if (this.props.videoShareImage != '' && this.props.videoShareImage != undefined && this.props.videoShareImage != null) {
    //   metaImage = this.props.videoShareImage;
    //   metaImageWidth = 350;
    //   metaImageHeight = 650;
    // }

    var descMax160 = this.props.description.length > 160 ? `${this.props.description.substring(0,157)}...` : this.props.description;

    return (
      <Layout title="Genuin" videoUrl={this.props.videoUrl} metaImageWidth={metaImageWidth} metaImageHeight={metaImageHeight} metaImage={metaImage} content={this.props.videoThumbnail} description={this.props.description} currentUrl={this.state.baseUrl} keyword='genuine'>
        <Card style={{ width: '52rem', borderRadius: '10px'}}>
          <div className="main-meddle">
          <Card.Body className="p-0">
            <Container fluid="md">
              <Row className="bg-white d-flex-video" style={{borderRadius: "10px",overflow: "hidden"}}>
                <Col md={6} className="padding-0 w-100" style={{
                  width: '40%',
                  maxWidth: '40%',
                  flexBasis: '40%'
                }}>
                  <span className="d-none-v" style={{
                    position: 'absolute', top: '6%', left: '9%', zIndex: '9', fontFamily: 'AvenirNext-DemiBold',
                     color: '#FFFFFF',
                    fontSize: '18pt'
                  }}>{this.state.playedSeconds.toFixed(0)}</span>
                  <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} className="playbtn" onClick={this.handlePlayPause} style={{ color: 'rgb(255 255 255 / 0.4)', width: '14%', cursor: 'pointer', right: '44%', zIndex: '999999', position: 'absolute', top: '44%', display: this.state.buttonVisible }} />

                  <div className="d-none-v" style={{
                    zIndex: '999999',
                    top: '92%',
                    position: 'absolute',
                    width: '100%'
                  }}>
                    <div className="icon-position" style={{ width: '50%', display: 'inline-block', paddingLeft:'15px' }}>
                      <img src={require('../images/ic_replies.png')} alt="" style={{ width: '15%', color: 'white', verticalAlign:'sub' }} />
                      <span className="commentxt" style={{ lineHeight: '28px', width: 'auto', color: 'white', fontSize: '20pt', fontFamily: 'AvenirNext-DemiBold', paddingLeft:'4px', verticalAlign:'top' }}>{this.props.noOfConversation}
                        <sub style={{ position: 'relative', fontSize: '12pt', bottom: '6px', left: '4px' }}>replies</sub></span>
                    </div>
                    <div className="icon-position" style={{ width: '50%', display: 'inline-block' }}>
                      <img src={require('../images/ic_views.png')} alt="" style={{ width: '15%', color: 'white', verticalAlign:'sub' }} />
                      <span className="viewtxt" style={{ lineHeight: '28px', width: 'auto', color: 'white', fontSize: '20pt', fontFamily: 'AvenirNext-DemiBold', paddingLeft:'4px', verticalAlign:'top' }}>{this.props.noOfViews}
                        <sub style={{ position: 'relative', fontSize: '12pt', bottom: '6px', left: '4px' }}>views</sub></span>
                    </div>
                  </div>
                  <div className="content tag" style={{ color:'white', fontFamily: 'AvenirNext-DemiBold', fontSize: '16pt', height: 'auto', marginBottom: '0', overflow: 'inherit', background: '#000', borderRadius: '0px' }}>
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#cddaff' }}
                      highlightClassName="match"
                      searchWords={hashtags}
                      textToHighlight={descMax160}
                    />
                  </div>
                  <span className="d-block-v" style={{
                    position: 'relative', top: '25px', left: '18px', zIndex: '9', fontFamily: 'AvenirNext-DemiBold',
                    color: '#FFFFFF',
                    fontSize: '18pt'
                  }}>{this.state.playedSeconds.toFixed(0)}</span>
                  <ReactPlayer
                    className='react-player fixed-bottom-video'
                    url={this.props.videoUrl}
                    playing={this.state.playing}
                    display='inline-block'
                  
                    style={{
                      marginTop: '6%', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer'
                    }}
                    controls={false}
                    // light={true}
                    onClick={this.handlePlayPause}
                    onPlay={this.handlePlay}
                    onPause={this.handlePause}
                    onProgress={this.handleProgress}
                    onDuration={this.handleDuration}
                  />
                  <div className="my app-download">
                    {/* <img src="https://imgur.com/URiFQhg.png" alt="imges" style={{ position: 'absolute', bottom: '0px', padding: '0 20px', maxWidth: '100%', left: '50%', transform: 'translate(-50%, -50%)' }} /> */}
                    {/* <a href="https://www.begenuin.com/" target="_blank"> */}
                      <div className="mobile-app-download-btn">
                          <div className="inner-block">
                            <Media>
                              <img
                                width={42}
                                height={42}
                                className="mr-2"
                                src={require('../images/genuin_app_icon.png')} alt="Generic"
                              />
                              <Media.Body>
                                <h5>Genuin App</h5>
                                <p>
                                Connect with real people
                                </p>
                              </Media.Body>
                            </Media>
                          </div>
                          <div className="btn-width">
                              <a href={this.props.installUrl} target="_blank">Install</a>
                          </div>
                      </div>
                    {/* </a> */}
                  </div>
                </Col>
                <Col md={6} className="d-none-v" style={{ paddingLeft: '0px', paddingRight: '15px', width: '60%', maxWidth: '60%', flexBasis: '60%' }}>
                  <div className="content" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '22pt', marginTop: '15px', marginBottom: '10px', height: '408px', overflowX: 'hidden' }}>
                    <Highlighter
                      highlightStyle={{ backgroundColor: '#cddaff' }}
                      highlightClassName="match"
                      searchWords={hashtags}
                      textToHighlight={descMax160}
                    />
                  </div>
                  <div className="url-block" style={{width: '100%'}}>
                  <div className="applink" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '13.9pt', marginTop: '0%', color: ' #333333', textAlign: 'center' }}>
                    {/* <Link href={process.env.genuinurl}> */}
                      <a href={process.env.genuinurl} target="_blank" style={{ color: '#0645FF' }}>Get the App</a>
                    {/* </Link> */}
                    &nbsp;to reply and make genuin connection</div>
                  <div className="sociallink" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '13.9pt', margin: '2% 0', direction: 'rtl', textAlign: 'right'}}>
                    <WhatsappShareButton url={this.state.baseUrl} >
                      <Link href={this.props.asPath}>
                        {/* <a id="whatsappIcon">
                          <img src={require('../images/ic_whatsapp.png')} />
                        </a> */}
                        <FontAwesomeIcon icon={faWhatsapp}  style={{color:'#333333',height: '24px'}}/>
                      </Link>
                    </WhatsappShareButton>
                    <LinkedinShareButton url={this.state.baseUrl} >
                      <Link href={this.props.asPath}>
                        {/* <a id="instaIcon">

                          <img src={require('../images/ic_insta.png')} />
                        </a> */}
                        <FontAwesomeIcon icon={faLinkedinIn}  style={{color:'#333333',height: '24px'}}/>
                      </Link>
                    </LinkedinShareButton>
                    <TwitterShareButton url={this.state.baseUrl} >
                      <Link href={this.props.asPath}>
                        {/* <a id="twitterIcon">

                          <img src={require('../images/ic_twitter.png')} />
                        </a> */}
                        <FontAwesomeIcon icon={faTwitter}  style={{color:'#333333',height: '24px'}}/>
                      </Link>
                    </TwitterShareButton>
                    <FacebookShareButton url={this.state.baseUrl} >
                      <Link href={this.props.asPath}>
                        {/* <a id="facebookIcon">

                          <img src={require('../images/ic_facebook.png')} />
                        </a> */}
                        <FontAwesomeIcon icon={faFacebookF}  style={{color:'#333333',height: '24px'}}/>
                      </Link>
                    </FacebookShareButton>
                 </div>
                                
                  <div className="media-link padding-0" style={{ width: '100%', height: '29pt', border: '1px #0645FF solid', borderRadius: '10px', padding: '4px', color: ' #333333' }}>
                    <span className="urltxt" style={{ fontSize: '12pt', fontFamily: 'AvenirNext-DemiBold', fontWeight: 'bold', cursor: 'default', display: '-webkit-box', margin: '2px 0 0 6px' }}>
                      {this.state.baseUrl}
                    </span>&nbsp;&nbsp;
                      <span className="copytxt" style={{ color: '#0645FF', backgroundColor: '#FFFFFF', paddingLeft: '6px', fontFamily: 'AvenirNext-Bold', textTransform: 'uppercase', margin: '7px 6px 0 0', textAlign: 'right', fontSize: '10pt', cursor: 'pointer', 'display': 'inline-block', 'float': 'right', 'position': 'relative', 'top': '-28px' }} onClick={this.handleCopy}>
                    {this.state.copyText}
                  </span>
                  </div>
                  </div>
                </Col>

                <Col md={12} className="bg-white padding-0" >
                <div className='linkPreview d-none-v' style={{ marginTop: '7px' }}>
                  {preview}
                </div>
              </Col>
              </Row>
             
            </Container>
          </Card.Body>
          </div>
        </Card>
      </Layout >
    );
  }
}

export default Player;