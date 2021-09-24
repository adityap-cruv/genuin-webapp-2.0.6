import React from 'react'
import { NextSeo } from 'next-seo';
class RTIndexPage extends React.Component {
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
        window.open("https://play.google.com/store/apps/details?id=com.begenuin.begenuin");

    }
    handleIosInstallClick = () => {
        // console.log('this is:', this);
        window.open("https://apps.apple.com/us/app/id1511177838"); 
    }
    render() {
        // console.log('this.props', this.props);
        var preview_image = (this.props.preview_image !== undefined && this.props.preview_image !== null)?this.props.preview_image:'';
        var currentUrl = process.env.hostname + this.props.asPath;
        var description = this.props.group && this.props.group.group_description ? this.props.group.group_description : '';
        let group_name = this.props.group && this.props.group.group_name ? `${this.props.group.group_name} Roundtable on Genuin` : '';
        return (
            <div className="main_rt_index">
            <style>{`
                body {
                    margin: 0px;
                }
                .main_rt_index {
                    background: transparent radial-gradient(closest-side at 50% 50%, #00189F 0%, #000000 140%) 0% 0% no-repeat padding-box;
                    width: 100vw;
                    height: 100vh;
                    opacity: 1;
                    postion: relative;
                }
                .preview_image {
                    opacity: 1;
                    width: 76.96%;
                    height: auto;
                    position: relative;
                    margin-top: 4.5%;
                    margin-left: 11.52%;
                    border-radius: 20px;
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
                .app_store_buttons .android {
                    margin-left: 1.5rem;
                }
            `}</style>
            <NextSeo
                title="Genuin"
                description={description}
                openGraph={{
                    type: 'object',
                    url: currentUrl,
                    title: `${group_name}`,
                    // description: description,
                    images: [
                        {
                          url: this.props.preview_image,
                          width: 1084,
                          height: 546,
                          alt: 'Genuin',
                        },
                        {
                            url: this.props.preview_image,
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
            <img className="preview_image" src={preview_image} />
            <div className="app_store_buttons">
                <div className="ios">
                    <img src={require('../images/badge_appstore.png')} onClick={this.handleIosInstallClick} alt="badge_appstore" />
                </div>
                <div className="android">
                    <img src={require('../images/badge_playstore.png')} onClick={this.handleAndroidInstallClick} alt="badge_playstore" />
                </div>
            </div>
        </div>
        );
    }
}

export default RTIndexPage;