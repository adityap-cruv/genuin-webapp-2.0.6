import React from 'react'
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import Player from '../pages/player';
class ProfileIndexPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        if (typeof window === 'undefined') {
            global.window = {}
        }
    }

    handleAndroidInstallClick = () => {
        // console.log('this is:', this);
        window.open("https://install.begenuin.com/86sn/cgs");

    }
    handleIosInstallClick = () => {
        // console.log('this is:', this);
        window.open("https://install.begenuin.com/86sn/cgs"); 
    }
    render() {
        console.log('this.props', this.props);
        var preview_image = (this.props.preview_image !== undefined && this.props.preview_image !== null)?this.props.preview_image:'';
        var currentUrl = process.env.hostname + this.props.url.asPath;
        var name = this.props.name !== undefined && this.props.name !== null && this.props.name !== '' ? this.props.name+' is on Genuin' : '';
        var bio = this.props.bio !== undefined && this.props.bio !== null && this.props.bio !== '' ? this.props.bio : '';
        var settings = {
            dots: false,
            arrows: true,
            fade: true,
            autoplay: false,
            infinite: true,
            speed: 800,
            slidesToShow: 1,
            slidesToScroll: 1,
            // autoplaySpeed: 3000
        };
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
                .slick-prev,
                .slick-next
                {
                    font-size: 0;
                    line-height: 0;

                    position: absolute;
                    top: 50%;

                    display: block;

                    width: 20px;
                    height: 20px;
                    padding: 0;
                    -webkit-transform: translate(0, -50%);
                    -ms-transform: translate(0, -50%);
                    transform: translate(0, -50%);

                    cursor: pointer;

                    color: transparent;
                    border: none;
                    outline: none;
                    background: transparent;
                }
                .slick-prev:hover,
                .slick-prev:focus,
                .slick-next:hover,
                .slick-next:focus
                {
                    color: transparent;
                    outline: none;
                    background: transparent;
                }
                .slick-prev:hover:before,
                .slick-prev:focus:before,
                .slick-next:hover:before,
                .slick-next:focus:before
                {
                    opacity: 1;
                }
                .slick-prev.slick-disabled:before,
                .slick-next.slick-disabled:before
                {
                    opacity: .25;
                }

                .slick-prev:before,
                .slick-next:before
                {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 20px;
                    line-height: 1;

                    opacity: .75;
                    color: white;

                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                .slick-prev
                {
                    left: -25px;
                }
                [dir='rtl'] .slick-prev
                {
                    right: -25px;
                    left: auto;
                }
                .slick-prev:before
                {
                    content: '←';
                }
                [dir='rtl'] .slick-prev:before
                {
                    content: '→';
                }

                .slick-next
                {
                    right: -25px;
                }
                [dir='rtl'] .slick-next
                {
                    right: auto;
                    left: -25px;
                }
                .slick-next:before
                {
                    content: '→';
                }
                [dir='rtl'] .slick-next:before
                {
                    content: '←';
                }
            `}</style>
            <NextSeo
                title= {name}
                description={bio}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${name}`,
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
                    <Slider {...settings}>
                        {
                            this.props.videos.map((video) => <Player {...{video_id_to_use:video.video_uuid, ...video}} {...this.props.url} installUrl={process.env.installurl+video.video_uuid} />)
                        }
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
                        <Link href={process.env.genuinurl}>
                            <img src={require('../images/logo_header.png')} alt="Genuin" />
                        </Link>
                    </div>
                    <div className="chat_not_found">
                        <h3>Sorry, this page isn’t available.</h3>
                        <p>The link you followed may be broken, or the page may have been removed. Go to <Link href={process.env.genuinurl}><a>Genuin homepage.</a></Link>
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