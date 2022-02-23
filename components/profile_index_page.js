import React from 'react'
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import Player from '../pages/player';
import { fetchVideos } from "../actions/postActions";
class ProfileIndexPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerRefs: [],
            nav: null,
            start: 0,
            rows: 10,
            videos: [],
            loading: false,
            lastVideoNum: 0
        };
        if (typeof window === 'undefined') {
            global.window = {}
        }
    }
    componentWillMount() {
        // this.fetchVideos();
        this.setState({
            videos: this.props.videos,
        });
    }
    componentDidMount() {
        this.setState({
          nav: this.slider,
        });
    }
    fetchVideos = async () => {
        this.setState({
          loading: true
        })
        var request_string = `?user_id=${this.props.user_id}&start=${this.state.start}&rows=${this.state.rows}`
        let response = await fetchVideos(request_string, this.state.videos);
        this.setState({
          videos: await response,
          start: parseInt(this.state.start) + parseInt(this.state.rows),
          loading: false
        });
    };
    handleAndroidInstallClick = () => {
        // console.log('this is:', this);
        window.open("https://install.begenuin.com/86sn/cgs");

    }
    handleIosInstallClick = () => {
        // console.log('this is:', this);
        window.open("https://install.begenuin.com/86sn/cgs"); 
    }
    beforeChange = (prev, next) => {
        this.state.playerRefs[prev].handlePause();
    }
    afterChange = (slide) => {
        // console.log('slide', slide)
        // console.log('this.state.lastVideoNum', this.state.lastVideoNum)
        if (slide > this.state.lastVideoNum) {
            this.state.lastVideoNum = slide;
            if (this.state.videos.length - 5 === this.state.lastVideoNum) {
                this.fetchVideos();
            }
        }
    };
    abbreviateNumber = (value) => {
        var newValue = value;
        if (value >= 1000) {
            var suffixes = ["", "k", "m", "b","t"];
            var suffixNum = Math.floor( (""+value).length/3 );
            var shortValue = '';
            for (var precision = 2; precision >= 1; precision--) {
                shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
                var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
                if (dotLessShortValue.length <= 2) { break; }
            }
            if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
            newValue = shortValue+suffixes[suffixNum];
        }
        return newValue;
    }
    render() {
        // console.log('this.props', this.props);
        // if(this.props.user_id !== undefined && this.props.user_id !== null && this.props.user_id !== '' && this.props.videos !== undefined && this.props.videos !== null && this.props.videos.length == 0){
        //     window.location.href = "https://begenuin.com";
        // }
        var preview_image = (this.props.preview_image !== undefined && this.props.preview_image !== null)?this.props.preview_image:'';
        var currentUrl = process.env.hostname + this.props.url.asPath;
        var name_nickname = this.props.name !== undefined && this.props.name !== null && this.props.name !== '' ? this.props.name : this.props.nickname;
        var views_formatted = this.abbreviateNumber(this.props.no_of_views);
        // console.log('views_formatted', views_formatted);
        var meta_title = name_nickname+' is on Genuin. Connect with him.';
        var meta_description = `${name_nickname}, ${this.props.no_of_videos} Videos, ${views_formatted} Views, ${this.props.no_of_replies} Replies`;
        var settings = {
            dots: false,
            arrows: true,
            fade: true,
            autoplay: false,
            infinite: true,
            speed: 800,
            slidesToShow: 1,
            slidesToScroll: 1,
            // autoplaySpeed: 3000,
            beforeChange: this.beforeChange,
            afterChange: this.afterChange
        };
        // console.log('this.state.videos', this.state.videos);
        return (
            <div className="main_rt_index">
            <style>{`
                @font-face {
                    font-family: 'AvenirNext';
                    src: url('/fonts/AvenirNext-Bold-01.ttf');
                    src: url('/fonts/AvenirNext-BoldItalic-02.ttf');
                    src: url('/fonts/AvenirNext-DemiBold-03.ttf');
                    src: url('/fonts/AvenirNext-DemiBoldItalic-04.ttf');
                    src: url('/fonts/AvenirNext-Heavy-09.ttf');
                    src: url('/fonts/AvenirNext-HeavyItalic-10.ttf');
                    src: url('/fonts/AvenirNext-Italic-05.ttf');
                    src: url('/fonts/AvenirNext-Medium-06.ttf');
                    src: url('/fonts/AvenirNext-MediumItalic-07.ttf');
                    src: url('/fonts/AvenirNext-Regular-08.ttf');
                    src: url('/fonts/AvenirNext-UltraLight-11.ttf');
                    src: url('/fonts/AvenirNext-UltraLightItalic-12.ttf');
                }  
                @font-face {
                    font-family: 'AvenirNext-DemiBold';
                    src: url('/fonts/AvenirNext-DemiBold-03.ttf');
                }
                @font-face {
                    font-family: 'AvenirNext-Bold';
                    src: url('/fonts/AvenirNext-Bold-01.ttf');
                }
                @font-face {
                    font-family: 'AvenirNext-Medium';
                    src: url('/fonts/AvenirNext-Medium-06.ttf');
                }
                body {
                    margin: 0px;
                }
                .main_rt_index {
                    background: transparent radial-gradient(closest-side at 50% 50%, #00189F 0%, #000000 140%) 0% 0% no-repeat padding-box;
                    width: 100vw;
                    height: 100vh;
                    opacity: 1;
                    position: relative;
                }
                .app_store_buttons {
                    opacity: 1;
                    width: 100%;
                    height: auto;
                    position: relative;
                    margin-top: 3%;
                    text-align: center;
                }
                .app_store_buttons .ios, .app_store_buttons .android {
                    display: inline-block;
                    cursor: pointer;
                }
                .app_store_buttons .ios img, .app_store_buttons .android img {
                    width: 100%;
                }
                @media (min-width:432px){
                    .app_store_buttons .android {
                        margin-left: 1.5rem;
                    }
                }

                .icon-position img {
                    display: inline;
                }
                .grey_logo {
                    position: absolute;
                    left: calc(82.5% + 32.61px);
                    top: 7.33%;
                    mix-blend-mode: overlay;
                    /* background: white; */
                    display: block;
                    width: 46px;
                    height: 64px;
                    padding: 0;
                    z-index: 1;
                    opacity: 1;
                }

                .slick-slider, .slick-list {
                    width: 100vw;
                    height: 100vh;
                    opacity: 1;
                    position: relative;
                }
                .slick-track {
                    height: 100vh;
                }
                .slick-prev,
                .slick-next
                {
                    font-size: 0;
                    line-height: 0;
                    position: absolute;
                    display: block;
                    width: 68px;
                    height: 68px;
                    padding: 0;
                    -webkit-transform: translate(0, -50%);
                    -ms-transform: translate(0, -50%);
                    transform: translate(0, -50%);
                    cursor: pointer;
                    color: transparent;
                    border: none;
                    outline: none;
                    z-index: 1;
                    opacity: .75;
                }
                .slick-prev:hover,
                .slick-prev:focus,
                .slick-next:hover,
                .slick-next:focus
                {
                    color: transparent;
                    outline: none;
                    opacity: 1;
                }
                .slick-prev:hover,
                .slick-prev:focus
                {
                    background: no-repeat url(https://media.begenuin.com/backend_assets/slider_navigate_up.png) !important;
                }
                .slick-next:hover,
                .slick-next:focus
                {
                    background: no-repeat url(https://media.begenuin.com/backend_assets/slider_navigate_down.png) !important;
                }
                .slick-prev.slick-disabled,
                .slick-next.slick-disabled
                {
                    opacity: .25;
                }
                .slick-prev
                {
                    left: calc(82.5% + 32.61px);
                    top: 45.81%;
                    background: no-repeat url(https://media.begenuin.com/backend_assets/slider_navigate_up.png);
                }
                /*[dir='rtl'] .slick-prev
                {
                    right: -25px;
                    left: auto;
                }*/
                .slick-next
                {
                    left: calc(82.5% + 32.61px);
                    top: 54.5%;
                    background: no-repeat url(https://media.begenuin.com/backend_assets/slider_navigate_down.png);
                }
                /*[dir='rtl'] .slick-next
                {
                    right: auto;
                    left: -25px;
                }*/
                .slick-prev:before, .slick-next:before, [dir='rtl'] .slick-prev:before, [dir='rtl'] .slick-next:before {
                    content: none !important;
                }
                .slick-slide:not(.slick-current) {
                    visibility: hidden;
                }
                .div-spinner {
                    display: flex;
                    flex-direction: row;
                    width: 100%;
                    justify-content: center;
                    margin: 15% 0%;
                }  
                .loader-spin {
                    border: 16px solid #f3f3f3 !important;
                    border-radius: 50% !important;
                    border-top: 16px solid #3498db !important;
                    width: 120px !important;
                    height: 120px !important;
                    -webkit-animation: spin 2s linear infinite !important; /* Safari */
                    animation: spin 2s linear infinite !important;
                }
            `}</style>
            <NextSeo
                title= {meta_title}
                description={meta_description}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${meta_title}`,
                    images: [
                        {
                          url: preview_image,
                          width: 1084,
                          height: 546,
                          alt: 'Genuin',
                        },
                        {
                            url: preview_image,
                            width: 300,
                            height: 200,
                            alt: 'Genuin',
                            // type:'image/png'
                        }
                    ],
                    site_name: 'Genuin',
                }}
                facebook={{
                    appId: 1234567890,
                }}
                twitter={{
                    handle: '@handle',
                    site: '@site',
                    cardType: 'summary_large_image',
                }}
            />
            {
                this.props.user_id !== undefined && this.props.user_id !== null && this.props.user_id !== ''?
                <React.Fragment>
                    <a href="/" className="grey_logo">
                        <img src="https://media.begenuin.com/backend_assets/logo_grey.png" alt="Genuin" />
                    </a>
                    <Slider ref={(slider) => (this.slider = slider)} {...settings}>
                        {this.state.videos.map((video) => {
                            return <Player 
                                key={video.video_uuid} 
                                loading={this.state.loading}
                                {...{video_id_to_use:video.video_uuid, ...video}} 
                                {...this.props.url} 
                                installUrl={process.env.installurl+video.video_uuid} 
                                ref={(ref) => {
                                    var playerRefs = this.state.playerRefs;
                                    if(ref !== null){
                                        playerRefs.push(ref);
                                    }
                                    this.state.playerRefs = playerRefs;
                                }}
                            />
                        })}
                    </Slider>
                </React.Fragment>
                :
                <React.Fragment>
                    <style>{`
                    .chat_not_found {
                        opacity: 1;
                        width: 53.47%;
                        height: auto;
                        position: relative;
                        padding: 17.8% 0px 14.8% 0px;
                        margin-left: 23.26%;
                        text-align:center;
                    }
                    .chat_not_found h3 {
                        color: #ffffff;
                        font-family: 'AvenirNext-Bold';
                        font-size: 36px;
                        letter-spacing: 0px;
                    }
                    .chat_not_found p {
                        color: #ffffff;
                        font-family: 'AvenirNext-Medium';
                        font-size: 28px;
                        letter-spacing: 0px;
                    }
                    .chat_not_found a {
                        text-decoration: none;
                        color: #0645FF;
                    }
                    .not_found_page_logo {
                        position: absolute;
                        top: 4%;
                        left: 5%;
                    }
                    .not_found_page_logo img {
                        width: 180px;
                        cursor: pointer;
                    }
                    `}</style>
                    <div className="not_found_page_logo">
                        <Link href="/">
                            <img src={require('../images/logo_header.png')} alt="Genuin" />
                        </Link>
                    </div>
                    <div className="chat_not_found">
                        <h3>Sorry, this page isn’t available.</h3>
                        <p>The link you followed may be broken, or the page may have been removed. Go to <Link href="/"><a>Genuin homepage.</a></Link>
                        </p>
                    </div>
                    <div className="app_store_buttons">
                        <div className="ios">
                            <img src={require('../images/badge_appstore.png')} onClick={this.handleIosInstallClick} alt="badge_appstore" />
                        </div>
                        <div className="android">
                            <img src={require('../images/badge_playstore.png')} onClick={this.handleAndroidInstallClick} alt="badge_playstore" />
                        </div>
                    </div>
                </React.Fragment>
            }
        </div>
        );
    }
}

export default ProfileIndexPage;