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
import {config} from '@fortawesome/fontawesome-svg-core';
import { faPlay, faPause, faUser } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faTwitter, faLinkedinIn, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Error from 'next/error';

import { increaseVideoViewCount } from '../actions/postActions';
import {
 TwitterShareButton,
 WhatsappShareButton,
 FacebookShareButton,
 LinkedinShareButton
} from "react-share";

config.autoAddCss = false;

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copyText: 'copy',
      playedSeconds: 0,
      totalDuration: 0,
      loaded: 0,
      currentDisplayMinutes:0,
      currentDisplaySeconds:0,
      playing: false,
      buttonVisible: 'block',
      baseUrl: '',
      urlToCopy: ''
    };
    if (typeof window === 'undefined') {
      global.window = {}
    }
  }

  handleCopy = state => {
    copy(this.state.urlToCopy);
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
    if(state.playedSeconds !== undefined && state.playedSeconds !== null && state.playedSeconds.toFixed(0) >= 4 && this.state.playedSeconds.toFixed(0) < 4){
      // console.log('view count increased');
      increaseVideoViewCount(this.props.video_id_to_use);
    }
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
    // console.log('handleProgress', state);
    var currentTotalSeconds = parseInt(this.state.totalDuration - state.playedSeconds.toFixed(0)) >= 0?parseInt(this.state.totalDuration - state.playedSeconds.toFixed(0)):0;
    var tmpCurrentDisplayMinutes = currentTotalSeconds == 0?0:Math.floor(currentTotalSeconds/60);
    var tmpCurrentDisplaySeconds = parseInt(currentTotalSeconds-(tmpCurrentDisplayMinutes*60));

    this.setState({ currentDisplayMinutes: tmpCurrentDisplayMinutes });
    this.setState({ currentDisplaySeconds: tmpCurrentDisplaySeconds });
  }
  handleDuration = (totalDuration) => {
    // console.log('totalDuration', Math.round(totalDuration));
    this.setState({ totalDuration: Math.round(totalDuration) })
  }
  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }


  render() {
    if (this.props.videoUrl == undefined || this.props.videoUrl == null || this.props.videoUrl == '') return <Error statusCode="404" />;
    const hashtags = this.props.description.match(/#\w+/g) || [];
    this.state.baseUrl = process.env.hostname + this.props.asPath;
    this.state.urlToCopy = process.env.hostname+"/"+this.props.video_id_to_use;
    let preview = '';
    if (this.props.link == '' || this.props.link == undefined || this.props.link == null) {
      preview = '';
    } else {
      var metaLink = this.props.link;
      metaLink = (metaLink.indexOf('://') === -1) ? 'http://' + metaLink : metaLink;
      preview = <Microlink media='logo' url={metaLink} style={{ maxWidth: '100%', height: '96px', backgroundColor: 'lightgrey', borderRadius:'5px' }} />
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
    var currentTotalSeconds = parseInt(this.state.totalDuration - this.state.playedSeconds.toFixed(0)) >= 0?parseInt(this.state.totalDuration - this.state.playedSeconds.toFixed(0)):0;
    var tmpCurrentDisplayMinutes = currentTotalSeconds == 0?0:Math.floor(currentTotalSeconds/60);
    var tmpCurrentDisplaySeconds = parseInt(currentTotalSeconds-(tmpCurrentDisplayMinutes*60));
    var tmpHeight = this.props.link.length > 0 ? 130 : 15;

    // this.setState({ currentDisplayMinutes: tmpCurrentDisplayMinutes });
    // this.setState({ currentDisplaySeconds: tmpCurrentDisplaySeconds });
    return (
      <React.Fragment>
      {this.props.loading !== undefined && this.props.loading ? 
        <div className="div-spinner">
          <div className="row">
            <div className="text-center">
              <div className="loader-spin" />
              <p>Please wait . . .</p>
            </div>
          </div>
        </div> : 
        <Layout title="Genuin" videoUrl={this.props.videoUrl} metaImageWidth={metaImageWidth} metaImageHeight={metaImageHeight} metaImage={metaImage} content={this.props.videoThumbnail} description={this.props.description} currentUrl={this.state.urlToCopy} keyword='genuine'>
          <Card style={{ width: 'auto', borderRadius: '10px'}}>
            <div className="main-meddle">
            <Card.Body className="p-0">
              <Container fluid="md">
                <Row className="bg-white d-flex-video desktop_white_video_flex_card" style={{borderRadius: "10px",overflow: "hidden", height: "100vh"}}>
                  <Col md={6} className="adjust_height_for_link_preview padding-0 w-100" style={{
                    width: 'auto',
                    maxWidth: '40%',
                    flexBasis: 'auto',
                    height: `calc(100% - ${tmpHeight+14}px)`
                  }}>
                    {/* <span className="d-none-v" style={{
                      position: 'absolute', top: '6%', left: '9%', zIndex: '9', fontFamily: 'AvenirNext-DemiBold',
                      color: '#FFFFFF',
                      fontSize: '18pt'
                    }}>{this.state.currentDisplayMinutes}:{this.state.currentDisplaySeconds}</span> */}
                    <FontAwesomeIcon icon={this.state.playing ? faPause : faPlay} className="playbtn" onClick={this.handlePlayPause} style={{ color: 'rgb(255 255 255 / 0.4)', width: '14%', cursor: 'pointer', right: '44%', zIndex: '999999', position: 'absolute', top: '43%', display: this.state.buttonVisible }} />

                    <div className="d-none-v" style={{
                      zIndex: '999999',
                      top: '95%',
                      position: 'absolute',
                      width: '91%'
                    }}>
                      <div className="icon-position" style={{ width: '50%', display: 'inline-block', paddingLeft:'15px' }}>
                        <img src={require('../images/ic_replies.png')} alt="" style={{ width: '15%', color: 'white', verticalAlign:'sub' }} />
                        <span className="commentxt" style={{ lineHeight: '28px', width: 'auto', color: 'white', fontSize: '20pt', fontFamily: 'AvenirNext-DemiBold', paddingLeft:'4px', verticalAlign:'top' }}>{this.props.noOfConversation}
                          <sub style={{ position: 'relative', fontSize: '12pt', bottom: '6px', left: '4px' }}>replies</sub></span>
                      </div>
                      <div className="icon-position" style={{ width: '50%', display: 'inline-block', paddingRight:'15px', textAlign: 'right' }}>
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
                    {/* <span className="d-block-v" style={{
                      position: 'relative', top: '25px', left: '18px', zIndex: '9', fontFamily: 'AvenirNext-DemiBold',
                      color: '#FFFFFF',
                      fontSize: '18pt'
                    }}>{this.state.currentDisplayMinutes}:{this.state.currentDisplaySeconds}</span> */}
                    <ReactPlayer
                      className='react-player fixed-bottom-video'
                      url={this.props.videoUrl}
                      playing={this.state.playing}
                      display='inline-block'
                    
                      style={{
                        marginTop: '15px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer'
                      }}
                      controls={false}
                      playsinline={true}
                      // light={true}
                      onClick={this.handlePlayPause}
                      onPlay={this.handlePlay}
                      onPause={this.handlePause}
                      onProgress={this.handleProgress}
                      onDuration={this.handleDuration}
                    />
                    <div className="d-block-v" style={{ fontFamily: 'AvenirNext-DemiBold', fontSize: '13.9pt', margin: '2% 0', width: '2.3rem', position: 'absolute', top: 'calc(100vh - 20rem)', right: '4%'}}>
                      <WhatsappShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="whatsappIcon">
                            <img src={require('../images/ic_whatsapp.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faWhatsapp}  style={{color:'#ffffff',height: '30px'}}/>
                        </Link>
                      </WhatsappShareButton>
                      <LinkedinShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="instaIcon">

                            <img src={require('../images/ic_insta.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faLinkedinIn}  style={{color:'#ffffff',height: '30px'}}/>
                        </Link>
                      </LinkedinShareButton>
                      <TwitterShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="twitterIcon">

                            <img src={require('../images/ic_twitter.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faTwitter}  style={{color:'#ffffff',height: '30px'}}/>
                        </Link>
                      </TwitterShareButton>
                      <FacebookShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="facebookIcon">

                            <img src={require('../images/ic_facebook.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faFacebookF}  style={{color:'#ffffff',height: '30px'}}/>
                        </Link>
                      </FacebookShareButton>
                    </div>
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
                  <Col md={6} className="d-none-v" style={{ paddingLeft: '0px', paddingRight: '15px', width: '60%', maxWidth: '60%', flexBasis: '60%', height: `calc(100% - ${tmpHeight}px) !important` }}>
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
                      <WhatsappShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="whatsappIcon">
                            <img src={require('../images/ic_whatsapp.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faWhatsapp}  style={{color:'#333333',height: '24px'}}/>
                        </Link>
                      </WhatsappShareButton>
                      <LinkedinShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="instaIcon">

                            <img src={require('../images/ic_insta.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faLinkedinIn}  style={{color:'#333333',height: '24px'}}/>
                        </Link>
                      </LinkedinShareButton>
                      <TwitterShareButton url={this.state.urlToCopy} >
                        <Link href={this.props.asPath}>
                          {/* <a id="twitterIcon">

                            <img src={require('../images/ic_twitter.png')} />
                          </a> */}
                          <FontAwesomeIcon icon={faTwitter}  style={{color:'#333333',height: '24px'}}/>
                        </Link>
                      </TwitterShareButton>
                      <FacebookShareButton url={this.state.urlToCopy} >
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
                        {this.state.urlToCopy}
                      </span>&nbsp;&nbsp;
                        <span className="copytxt" style={{ color: '#0645FF', backgroundColor: '#FFFFFF', paddingLeft: '6px', fontFamily: 'AvenirNext-Bold', textTransform: 'uppercase', margin: '7px 6px 0 0', textAlign: 'right', fontSize: '10pt', cursor: 'pointer', 'display': 'inline-block', 'float': 'right', 'position': 'relative', 'top': '-28px' }} onClick={this.handleCopy}>
                      {this.state.copyText}
                    </span>
                    </div>
                    </div>
                  </Col>

                  <Col md={12} className="d-none-v bg-white padding-0" style={{height: '103px'}} >
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
      }
      </React.Fragment>
    );
  }
}

export default Player;