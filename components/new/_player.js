import React, { useEffect, useMemo, useState } from "react";
// import ReactPlayer from 'react-player'
import { Container } from "react-grid-system";
import {
  Card,
  Row,
  Col,
  Image,
  Navbar,
  Nav,
  Offcanvas,
  Button,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import Layout from "./player/layout";
import ReactPlayer from "react-player";
import copy from "copy-to-clipboard";
import Highlighter from "react-highlight-words";
import Link from "next/link";
import Microlink from "@microlink/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import { faPlay, faPause, faUser } from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import Error from "next/error";

import { increaseVideoViewCount } from "../../actions/postActions";
import {
  TwitterShareButton,
  WhatsappShareButton,
  FacebookShareButton,
  LinkedinShareButton,
} from "react-share";

config.autoAddCss = false;

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copyText: "copy",
      playedSeconds: 0,
      totalDuration: 0,
      loaded: 0,
      currentDisplayMinutes: 0,
      currentDisplaySeconds: 0,
      playing: false,
      buttonVisible: "block",
      baseUrl: "",
      urlToCopy: "",
      videoUrl: props.videoUrl,
    };
    if (typeof window === "undefined") {
      global.window = {};
    }
  }

  handleCopy = (state) => {
    copy(this.state.urlToCopy);
    this.setState({ copyText: "Copied!" });
  };

  handlePlay = () => {
    this.setState({ playing: true });
    this.setState({ buttonVisible: "none" });
  };

  handlePause = () => {
    this.setState({ playing: false });
    this.setState({ buttonVisible: "block" });
  };

  handleProgress = (state) => {
    if (
      state.playedSeconds !== undefined &&
      state.playedSeconds !== null &&
      state.playedSeconds.toFixed(0) >= 4 &&
      this.state.playedSeconds.toFixed(0) < 4
    ) {
      // console.log('view count increased');
      increaseVideoViewCount(this.props.video_id_to_use);
    }
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state);
    }
    // console.log('handleProgress', state);
    var currentTotalSeconds =
      parseInt(this.state.totalDuration - state.playedSeconds.toFixed(0)) >= 0
        ? parseInt(this.state.totalDuration - state.playedSeconds.toFixed(0))
        : 0;
    var tmpCurrentDisplayMinutes =
      currentTotalSeconds == 0 ? 0 : Math.floor(currentTotalSeconds / 60);
    var tmpCurrentDisplaySeconds = parseInt(
      currentTotalSeconds - tmpCurrentDisplayMinutes * 60
    );

    this.setState({ currentDisplayMinutes: tmpCurrentDisplayMinutes });
    this.setState({ currentDisplaySeconds: tmpCurrentDisplaySeconds });
  };
  handleDuration = (totalDuration) => {
    console.log(totalDuration);
    // console.log('totalDuration', Math.round(totalDuration));
    this.setState({ totalDuration: Math.round(totalDuration) });
  };
  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing });
  };
  handleEnded = (ele) => {
    // console.log('ele', ele);
    this.setState({ videoUrl: "" });
    this.setState({ videoUrl: this.state.videoUrl });
  };

  render() {
    if (
      this.props.videoUrl == undefined ||
      this.props.videoUrl == null ||
      this.props.videoUrl == ""
    )
      return <Error statusCode="404" />;
    const hashtags = this.props.description.match(/#\w+/g) || [];
    this.state.baseUrl = process.env.hostname + this.props.asPath;
    this.state.urlToCopy =
      process.env.hostname + "/" + this.props.video_id_to_use;
    let preview = "";
    if (
      this.props.link == "" ||
      this.props.link == undefined ||
      this.props.link == null
    ) {
      preview = "";
    } else {
      var metaLink = this.props.link;
      metaLink =
        metaLink.indexOf("://") === -1 ? "http://" + metaLink : metaLink;
      preview = (
        <Microlink
          media="logo"
          url={metaLink}
          style={{
            maxWidth: "100%",
            height: "96px",
            backgroundColor: "lightgrey",
            borderRadius: "5px",
          }}
        />
      );
    }
    let metaImage = this.props.videoPreviewImage;
    let metaImageWidth = 1200;
    let metaImageHeight = 630;
    // if (this.props.videoShareImage != '' && this.props.videoShareImage != undefined && this.props.videoShareImage != null) {
    //   metaImage = this.props.videoShareImage;
    //   metaImageWidth = 350;
    //   metaImageHeight = 650;
    // }

    var descMax160 =
      this.props.description.length > 160
        ? `${this.props.description.substring(0, 157)}...`
        : this.props.description;
    var currentTotalSeconds =
      parseInt(
        this.state.totalDuration - this.state.playedSeconds.toFixed(0)
      ) >= 0
        ? parseInt(
            this.state.totalDuration - this.state.playedSeconds.toFixed(0)
          )
        : 0;
    var tmpCurrentDisplayMinutes =
      currentTotalSeconds == 0 ? 0 : Math.floor(currentTotalSeconds / 60);
    var tmpCurrentDisplaySeconds = parseInt(
      currentTotalSeconds - tmpCurrentDisplayMinutes * 60
    );
    var tmpHeight = this.props.link.length > 0 ? 130 : 15;

    // this.setState({ currentDisplayMinutes: tmpCurrentDisplayMinutes });
    // this.setState({ currentDisplaySeconds: tmpCurrentDisplaySeconds });
    return (
      <React.Fragment>
        {this.props.loading !== undefined && this.props.loading ? (
          <div className="div-spinner">
            <div className="row">
              <div className="text-center">
                <div className="loader-spin" />
                <p>Please wait . . .</p>
              </div>
            </div>
          </div>
        ) : (
          <Layout
            title="Genuin"
            videoUrl={this.props.videoUrl}
            metaImageWidth={metaImageWidth}
            metaImageHeight={metaImageHeight}
            metaImage={metaImage}
            content={this.props.videoThumbnail}
            description={this.props.description}
            currentUrl={this.state.urlToCopy}
            keyword="genuine"
          >
            <TopNav />
            <div className="video-container">
              <ReactPlayer
                key={this.state.videoUrl}
                url={this.props.videoUrl}
                playing={this.state.playing}
                controls={false}
                playsinline={true}
                // light={this.props.videoThumbnail}
                light="https://images.unsplash.com/photo-1616578492900-ea5a8fc6c341?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=654&q=80"
                config={{
                  file: {
                    attributes: { poster: this.props.videoThumbnail },
                  },
                }}
                className="video-wrapper"
                width="auto"
                height="100%"
                fluid
                aspectRatio="9:16"
                onClick={this.handlePlayPause}
                onPlay={this.handlePlay}
                onPause={this.handlePause}
                onProgress={this.handleProgress}
                onDuration={this.handleDuration}
                onEnded={this.handleEnded}
              />

              <FontAwesomeIcon
                icon={this.state.playing ? faPause : faPlay}
                onClick={this.handlePlayPause}
                style={{
                  display: this.state.buttonVisible,
                }}
                className="btn-play"
              />
              <div className="video-footer bg-gradient-180">
                <div className="d-flex align-items-end justify-content-between">
                  <div className="d-flex flex-column">
                    <div className="video-auther mb-2">
                      {/* If auther has no uploaded his profile pic then show below code for as his profile pic. */}
                      {/* <h6 className="flex-shrink-0 mb-0 img-auther-text text-uppercase">
                        <span>pu</span>
                      </h6> */}
                      <Image
                        src={require("../../images/img-profile-demo.jpg")}
                        width="36"
                        height="36"
                        alt="@pusateri"
                        title="@pusateri"
                        className="img-auther-pic"
                      />
                      <h5 className="mb-0">@pusateri</h5>
                    </div>
                    <p className="mb-0">
                      asdf asdfkjasl asdkfjlx jkasldjflkxj lkasjdfkjx
                      asdlkfjalskdjfaieriocx vjlasdfjkaksljf
                    </p>
                  </div>
                  <div className="flex-shrink-0 position-relative video-more-option">
                    <ul>
                      <li>
                        <Image
                          src={require("../../images/video-more-options/ic-link.svg")}
                          width="24"
                          height="24"
                          alt="Bookmark"
                          title="Bookmark"
                        />
                      </li>
                      <li>
                        <Image
                          src={require("../../images/video-more-options/ic-bookmark.svg")}
                          width="24"
                          height="24"
                          alt="Bookmark"
                          title="Bookmark"
                        />
                      </li>
                      <li>
                        <Image
                          src={require("../../images/video-more-options/ic-share.svg")}
                          width="24"
                          height="24"
                          alt="Bookmark"
                          title="Bookmark"
                        />
                      </li>
                      <li>
                        <Image
                          src={require("../../images/video-more-options/ic-replay.svg")}
                          width="24"
                          height="24"
                          alt="Bookmark"
                          title="Bookmark"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
                <ProgressBar now={60} />
              </div>
            </div>
          </Layout>
        )}
      </React.Fragment>
    );
  }
}

export default Player;
