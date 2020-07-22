webpackHotUpdate("static\\development\\pages\\video\\[id].js",{

/***/ "./pages/player.js":
/*!*************************!*\
  !*** ./pages/player.js ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ "./node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ "./node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ "./node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ "./node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var react_grid_system__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-grid-system */ "./node_modules/react-grid-system/build/index.js");
/* harmony import */ var react_grid_system__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(react_grid_system__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-bootstrap */ "./node_modules/react-bootstrap/esm/index.js");
/* harmony import */ var _components_Layout__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../components/Layout */ "./components/Layout.js");
/* harmony import */ var react_player__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react-player */ "./node_modules/react-player/lib/index.js");
/* harmony import */ var react_player__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_player__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! next/router */ "./node_modules/next/dist/client/router.js");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var copy_to_clipboard__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! copy-to-clipboard */ "./node_modules/copy-to-clipboard/index.js");
/* harmony import */ var copy_to_clipboard__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(copy_to_clipboard__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var react_highlight_words__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react-highlight-words */ "./node_modules/react-highlight-words/dist/main.js");
/* harmony import */ var react_highlight_words__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react_highlight_words__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var _microlink_react__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @microlink/react */ "./node_modules/@microlink/react/dist/microlink.module.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_fontawesome_svg_core__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @fortawesome/fontawesome-svg-core */ "./node_modules/@fortawesome/fontawesome-svg-core/index.es.js");
/* harmony import */ var _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @fortawesome/free-solid-svg-icons */ "./node_modules/@fortawesome/free-solid-svg-icons/index.es.js");
/* harmony import */ var _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @fortawesome/free-brands-svg-icons */ "./node_modules/@fortawesome/free-brands-svg-icons/index.es.js");
/* harmony import */ var next_error__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! next/error */ "./node_modules/next/error.js");
/* harmony import */ var next_error__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(next_error__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var _custom_scss__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./custom.scss */ "./pages/custom.scss");
/* harmony import */ var _custom_scss__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(_custom_scss__WEBPACK_IMPORTED_MODULE_22__);







var _jsxFileName = "C:\\xampp\\htdocs\\genuin-webapp\\pages\\player.js";
var __jsx = react__WEBPACK_IMPORTED_MODULE_7___default.a.createElement;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

 // import ReactPlayer from 'react-player'

















var Player = /*#__PURE__*/function (_React$Component) {
  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__["default"])(Player, _React$Component);

  var _super = _createSuper(Player);

  function Player(props) {
    var _this;

    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__["default"])(this, Player);

    _this = _super.call(this, props);

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(Object(_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this), "handleCopy", function (state) {
      copy_to_clipboard__WEBPACK_IMPORTED_MODULE_13___default()(_this.props.link);

      _this.setState({
        copyText: "Copied!"
      });
    });

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(Object(_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this), "handlePlay", function () {
      console.log('onPlay');

      _this.setState({
        playing: true
      });

      _this.setState({
        buttonVisible: 'none'
      });
    });

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(Object(_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this), "handlePause", function () {
      console.log('onPause');

      _this.setState({
        playing: false
      });

      _this.setState({
        buttonVisible: 'block'
      });
    });

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(Object(_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this), "handleProgress", function (state) {
      console.log('onProgress', state); // We only want to update time slider if we are not currently seeking

      if (!_this.state.seeking) {
        _this.setState(state);
      }
    });

    Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_6__["default"])(Object(_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__["default"])(_this), "handlePlayPause", function () {
      console.log(_this.state.playing);

      _this.setState({
        playing: !_this.state.playing
      });
    });

    _this.state = {
      copyText: 'copy',
      playedSeconds: 0,
      loaded: 0,
      playing: false,
      buttonVisible: 'block'
    };

    if (false) {}

    return _this;
  }

  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__["default"])(Player, [{
    key: "render",
    value: function render() {
      if (this.props.videoUrl == undefined || this.props.videoUrl == null || this.props.videoUrl == '') return __jsx(next_error__WEBPACK_IMPORTED_MODULE_21___default.a, {
        statusCode: "404",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 65,
          columnNumber: 110
        }
      });
      var hashtags = this.props.description.match(/#\w+/g) || [];
      var currentUrl = "http://134.209.152.229:4000" + this.props.asPath; // console.log("path",currentUrl);

      return __jsx(_components_Layout__WEBPACK_IMPORTED_MODULE_10__["default"], {
        title: "Genuin",
        content: this.props.videoThumbnail,
        description: this.props.description,
        currentUrl: currentUrl,
        keyword: "genuine",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 70,
          columnNumber: 7
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_9__["Card"], {
        style: {
          width: '50rem',
          height: '99%',
          borderRadius: '10px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 71,
          columnNumber: 9
        }
      }, __jsx(react_bootstrap__WEBPACK_IMPORTED_MODULE_9__["Card"].Body, {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 72,
          columnNumber: 11
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Container"], {
        fluid: "md",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 73,
          columnNumber: 13
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Row"], {
        className: "d-block",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 74,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        className: "padding-0 w-100",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 75,
          columnNumber: 17
        }
      }, __jsx("span", {
        style: {
          position: 'absolute',
          top: '4%',
          left: '16%',
          zIndex: '1',
          fontFamily: 'AvenirNext-DemiBold',
          // color: '#FFFFFF',
          fontSize: '20pt'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 76,
          columnNumber: 19
        }
      }, this.state.playedSeconds.toFixed(0), " Sec"), __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: this.state.playing ? _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_19__["faPause"] : _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_19__["faPlay"],
        className: "playbtn",
        onClick: this.handlePlayPause,
        style: {
          width: '14%',
          cursor: 'pointer',
          right: '44%',
          zIndex: '999999',
          position: 'absolute',
          top: '39%',
          display: this.state.buttonVisible
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 81,
          columnNumber: 19
        }
      }), __jsx("div", {
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83,
          columnNumber: 19
        }
      }, __jsx("div", {
        style: {
          bottom: '16px',
          marginTop: '30px',
          width: '50%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 84,
          columnNumber: 21
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        className: "commentIcon",
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_19__["faCommentDots"],
        style: {
          width: '5%',
          color: 'white',
          right: '78%',
          zIndex: '999999',
          position: 'absolute',
          top: '94%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 85,
          columnNumber: 19
        }
      }), __jsx("span", {
        className: "commentxt",
        style: {
          lineHeight: '28px',
          width: '5%',
          color: 'white',
          right: '72%',
          zIndex: '999999',
          position: 'absolute',
          top: '93%',
          fontSize: '16pt'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 86,
          columnNumber: 19
        }
      }, this.props.noOfConversation, __jsx("sub", {
        style: {
          position: 'relative',
          fontSize: '12pt',
          bottom: '6px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 87,
          columnNumber: 19
        }
      }, "replies"))), __jsx("div", {
        style: {
          bottom: '16px',
          marginTop: '30px',
          width: '50%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 89,
          columnNumber: 19
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        className: "eyeIcon",
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_19__["faEye"],
        style: {
          width: '5%',
          color: 'white',
          right: '51%',
          zIndex: '999999',
          position: 'absolute',
          top: '94%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 90,
          columnNumber: 19
        }
      }), __jsx("span", {
        className: "viewtxt",
        style: {
          lineHeight: '28px',
          width: '9%',
          color: 'white',
          right: '40%',
          zIndex: '999999',
          position: 'absolute',
          top: '93%',
          fontSize: '16pt'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 91,
          columnNumber: 19
        }
      }, this.props.noOfViews, __jsx("sub", {
        style: {
          position: 'relative',
          fontSize: '12pt',
          bottom: '6px',
          left: '2px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 92,
          columnNumber: 19
        }
      }, "views")))), __jsx("div", {
        className: "content tag",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '16pt',
          margin: '0px',
          minHeight: 'auto',
          overflow: 'inherit'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 95,
          columnNumber: 19
        }
      }, __jsx(react_highlight_words__WEBPACK_IMPORTED_MODULE_14___default.a, {
        highlightStyle: {
          backgroundColor: '#bfe4f3'
        },
        highlightClassName: "match",
        searchWords: hashtags,
        textToHighlight: this.props.description,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 96,
          columnNumber: 21
        }
      })), __jsx(react_player__WEBPACK_IMPORTED_MODULE_11___default.a, {
        className: "react-player fixed-bottom",
        url: this.props.videoUrl,
        playing: this.state.playing,
        width: "350px",
        height: "620px",
        style: {
          marginTop: '-3%',
          borderRadius: '22px',
          overflow: 'hidden',
          cursor: 'pointer'
        },
        controls: false // light={true}
        ,
        onClick: this.handlePlayPause,
        onPlay: this.handlePlay,
        onPause: this.handlePause,
        onProgress: this.handleProgress,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 103,
          columnNumber: 19
        }
      })), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 120,
          columnNumber: 17
        }
      }, __jsx("div", {
        className: "content",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '26.9pt',
          marginTop: '15px',
          minHeight: '382px',
          overflow: 'auto'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 121,
          columnNumber: 19
        }
      }, __jsx(react_highlight_words__WEBPACK_IMPORTED_MODULE_14___default.a, {
        highlightStyle: {
          backgroundColor: '#bfe4f3'
        },
        highlightClassName: "match",
        searchWords: hashtags,
        textToHighlight: this.props.description,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 122,
          columnNumber: 21
        }
      })), __jsx("div", {
        className: "applink",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '13.9pt',
          marginTop: '34%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 129,
          columnNumber: 19
        }
      }, "        ", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 129,
          columnNumber: 136
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 130,
          columnNumber: 21
        }
      }, "Get the App")), " to reply and make genuin connection"), __jsx("div", {
        className: "sociallink",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '13.9pt',
          marginTop: '3%',
          direction: 'rtl'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 132,
          columnNumber: 19
        }
      }, __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 133,
          columnNumber: 21
        }
      }, __jsx("a", {
        id: "whatsappIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 134,
          columnNumber: 23
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__["faWhatsapp"],
        style: {
          width: '5%',
          height: '5%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 134,
          columnNumber: 44
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 136,
          columnNumber: 33
        }
      }, __jsx("a", {
        id: "instaIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 137,
          columnNumber: 23
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__["faInstagram"],
        style: {
          width: '5%',
          height: '5%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 137,
          columnNumber: 41
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 139,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "twitterIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 140,
          columnNumber: 23
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__["faTwitter"],
        style: {
          width: '6%',
          height: '5%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 140,
          columnNumber: 43
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 142,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "facebookIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 143,
          columnNumber: 23
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__["faFacebookF"],
        style: {
          width: '4%',
          height: '5%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 143,
          columnNumber: 44
        }
      }))), "\xA0\xA0\xA0\xA0\xA0"), __jsx("div", {
        className: "media-link padding-0",
        style: {
          width: '100%',
          height: '29pt',
          border: '1px #0094D0 solid',
          borderRadius: '9px',
          padding: '4px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 146,
          columnNumber: 19
        }
      }, __jsx("span", {
        className: "urltxt",
        style: {
          fontSize: '15pt',
          fontFamily: 'AvenirNext-DemiBold',
          fontWeight: 'bold',
          cursor: 'default',
          display: 'inline-block',
          marginTop: '-10px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 147,
          columnNumber: 21
        }
      }, this.props.link), "\xA0\xA0", __jsx("span", {
        "class": "copytxt",
        style: {
          color: '#FF0000',
          fontFamily: 'AvenirNext-Bold',
          textAlign: 'right',
          fontSize: '15pt',
          cursor: 'pointer',
          'display': 'inline-block',
          'float': 'right',
          'marginTop': '-4px'
        },
        onClick: this.handleCopy,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 150,
          columnNumber: 23
        }
      }, this.state.copyText)))), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Row"], {
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 156,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 12,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 157,
          columnNumber: 17
        }
      }, __jsx("div", {
        className: "linkPreview",
        style: {
          marginTop: '7px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 158,
          columnNumber: 19
        }
      }, __jsx(_microlink_react__WEBPACK_IMPORTED_MODULE_16__["default"], {
        url: this.props.link,
        style: {
          maxWidth: '783px',
          height: '100px',
          backgroundColor: 'lightgrey'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 160,
          columnNumber: 21
        }
      }))))))));
    }
  }]);

  return Player;
}(react__WEBPACK_IMPORTED_MODULE_7___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (Player);

;
    var _a, _b;
    // Legacy CSS implementations will `eval` browser code in a Node.js context
    // to extract CSS. For backwards compatibility, we need to check we're in a
    // browser context before continuing.
    if (typeof self !== 'undefined' &&
        // AMP / No-JS mode does not inject these helpers:
        '$RefreshHelpers$' in self) {
        var currentExports_1 = module.__proto__.exports;
        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;
        // This cannot happen in MainTemplate because the exports mismatch between
        // templating and execution.
        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports_1, module.i);
        // A module can be accepted automatically based on its exports, e.g. when
        // it is a Refresh Boundary.
        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports_1)) {
            // Save the previous exports on update so we can compare the boundary
            // signatures.
            module.hot.dispose(function (data) {
                data.prevExports = currentExports_1;
            });
            // Unconditionally accept an update to this module, we'll check if it's
            // still a Refresh Boundary later.
            module.hot.accept();
            // This field is set when the previous version of this module was a
            // Refresh Boundary, letting us know we need to check for invalidation or
            // enqueue an update.
            if (prevExports !== null) {
                // A boundary can become ineligible if its exports are incompatible
                // with the previous exports.
                //
                // For example, if you add/remove/change exports, we'll want to
                // re-execute the importing modules, and force those components to
                // re-render. Similarly, if you convert a class component to a
                // function, we want to invalidate the boundary.
                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports_1)) {
                    module.hot.invalidate();
                }
                else {
                    self.$RefreshHelpers$.scheduleUpdate();
                }
            }
        }
        else {
            // Since we just executed the code for the module, it's possible that the
            // new exports made it ineligible for being a boundary.
            // We only care about the case when we were _previously_ a boundary,
            // because we already accepted this update (accidental side effect).
            var isNoLongerABoundary = prevExports !== null;
            if (isNoLongerABoundary) {
                module.hot.invalidate();
            }
        }
    }

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ })

})
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJsaW5rIiwic2V0U3RhdGUiLCJjb3B5VGV4dCIsImNvbnNvbGUiLCJsb2ciLCJwbGF5aW5nIiwiYnV0dG9uVmlzaWJsZSIsInNlZWtpbmciLCJwbGF5ZWRTZWNvbmRzIiwibG9hZGVkIiwidmlkZW9VcmwiLCJ1bmRlZmluZWQiLCJoYXNodGFncyIsImRlc2NyaXB0aW9uIiwibWF0Y2giLCJjdXJyZW50VXJsIiwicHJvY2VzcyIsImFzUGF0aCIsInZpZGVvVGh1bWJuYWlsIiwid2lkdGgiLCJoZWlnaHQiLCJib3JkZXJSYWRpdXMiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJ6SW5kZXgiLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJ0b0ZpeGVkIiwiZmFQYXVzZSIsImZhUGxheSIsImhhbmRsZVBsYXlQYXVzZSIsImN1cnNvciIsInJpZ2h0IiwiZGlzcGxheSIsImJvdHRvbSIsIm1hcmdpblRvcCIsImZhQ29tbWVudERvdHMiLCJjb2xvciIsImxpbmVIZWlnaHQiLCJub09mQ29udmVyc2F0aW9uIiwiZmFFeWUiLCJub09mVmlld3MiLCJtYXJnaW4iLCJtaW5IZWlnaHQiLCJvdmVyZmxvdyIsImJhY2tncm91bmRDb2xvciIsImhhbmRsZVBsYXkiLCJoYW5kbGVQYXVzZSIsImhhbmRsZVByb2dyZXNzIiwiZGlyZWN0aW9uIiwiZmFXaGF0c2FwcCIsImZhSW5zdGFncmFtIiwiZmFUd2l0dGVyIiwiZmFGYWNlYm9va0YiLCJib3JkZXIiLCJwYWRkaW5nIiwiZm9udFdlaWdodCIsInRleHRBbGlnbiIsImhhbmRsZUNvcHkiLCJtYXhXaWR0aCIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FDQTs7QUFDQTtBQUNB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QVEsRUFBRSxNQUFqRjtBQUF5RkssZ0JBQU0sRUFBRSxTQUFqRztBQUE0RyxxQkFBVyxjQUF2SDtBQUF1SSxtQkFBUyxPQUFoSjtBQUF5Six1QkFBYTtBQUF0SyxTQUE3QjtBQUE2TSxlQUFPLEVBQUUsS0FBSzJCLFVBQTNOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FDQyxLQUFLN0QsS0FBTCxDQUFXSSxRQURaLENBSkosQ0ExQkYsQ0E5Q0YsQ0FERixFQW1GRSxNQUFDLHFEQUFEO0FBQU0saUJBQVMsRUFBQyxRQUFoQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQ0UsTUFBQyxxREFBRDtBQUFLLFVBQUUsRUFBRSxFQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FDRTtBQUFLLGlCQUFTLEVBQUMsYUFBZjtBQUE2QixhQUFLLEVBQUU7QUFBRWtDLG1CQUFTLEVBQUU7QUFBYixTQUFwQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBRUUsTUFBQyx5REFBRDtBQUFXLFdBQUcsRUFBRSxLQUFLdkMsS0FBTCxDQUFXRyxJQUEzQjtBQUFpQyxhQUFLLEVBQUU7QUFBRTRELGtCQUFRLEVBQUUsT0FBWjtBQUFxQnhDLGdCQUFNLEVBQUUsT0FBN0I7QUFBc0MwQix5QkFBZSxFQUFFO0FBQXZELFNBQXhDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFGRixDQURGLENBREYsQ0FuRkYsQ0FERixDQURGLENBREYsQ0FERjtBQW9HRDs7OztFQXRKa0JlLDRDQUFLLENBQUNDLFM7O0FBeUpabEUscUVBQWYiLCJmaWxlIjoic3RhdGljL3dlYnBhY2svc3RhdGljXFxkZXZlbG9wbWVudFxccGFnZXNcXHZpZGVvXFxbaWRdLmpzLmNlMjBhM2U3YTRlMjc2MTM4ZGU0LmhvdC11cGRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXHJcbi8vIGltcG9ydCBSZWFjdFBsYXllciBmcm9tICdyZWFjdC1wbGF5ZXInXHJcbmltcG9ydCB7IENvbnRhaW5lciwgUm93LCBDb2wgfSBmcm9tICdyZWFjdC1ncmlkLXN5c3RlbSc7XHJcbmltcG9ydCB7IENhcmQgfSBmcm9tICdyZWFjdC1ib290c3RyYXAnO1xyXG5pbXBvcnQgTGF5b3V0IGZyb20gXCIuLi9jb21wb25lbnRzL0xheW91dFwiO1xyXG5pbXBvcnQgUmVhY3RQbGF5ZXIgZnJvbSAncmVhY3QtcGxheWVyJztcclxuaW1wb3J0IHJvdXRlciBmcm9tICduZXh0L3JvdXRlcic7XHJcbmltcG9ydCBjb3B5IGZyb20gJ2NvcHktdG8tY2xpcGJvYXJkJztcclxuaW1wb3J0IEhpZ2hsaWdodGVyIGZyb20gXCJyZWFjdC1oaWdobGlnaHQtd29yZHNcIjtcclxuaW1wb3J0IExpbmsgZnJvbSAnbmV4dC9saW5rJztcclxuaW1wb3J0IE1pY3JvbGluayBmcm9tICdAbWljcm9saW5rL3JlYWN0JztcclxuaW1wb3J0IHsgRm9udEF3ZXNvbWVJY29uIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9yZWFjdC1mb250YXdlc29tZVwiO1xyXG5pbXBvcnQgeyBsaWJyYXJ5IH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZvbnRhd2Vzb21lLXN2Zy1jb3JlJ1xyXG5pbXBvcnQgeyBmYVRpbWVzLCBmYVBsYXksIGZhUGF1c2UsIGZhQ29tbWVudERvdHMsIGZhRXllLCBmYUV5ZURyb3BwZXIgfSBmcm9tIFwiQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zXCI7XHJcbmltcG9ydCB7IGZhRmFjZWJvb2tGLCBmYUluc3RhZ3JhbSwgZmFXaGF0c2FwcCwgZmFUd2l0dGVyIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9mcmVlLWJyYW5kcy1zdmctaWNvbnNcIjtcclxuaW1wb3J0IEVycm9yIGZyb20gJ25leHQvZXJyb3InO1xyXG5pbXBvcnQgY3VzdG9tIGZyb20gJy4vY3VzdG9tLnNjc3MnO1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgY29weVRleHQ6ICdjb3B5JyxcclxuICAgICAgcGxheWVkU2Vjb25kczogMCxcclxuICAgICAgbG9hZGVkOiAwLFxyXG4gICAgICBwbGF5aW5nOiBmYWxzZSxcclxuICAgICAgYnV0dG9uVmlzaWJsZTogJ2Jsb2NrJ1xyXG4gICAgfTtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBnbG9iYWwud2luZG93ID0ge31cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhhbmRsZUNvcHkgPSBzdGF0ZSA9PiB7XHJcbiAgICBjb3B5KHRoaXMucHJvcHMubGluayk7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgY29weVRleHQ6IFwiQ29waWVkIVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlUGxheSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblBsYXknKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IHRydWUgfSlcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBidXR0b25WaXNpYmxlOiAnbm9uZScgfSlcclxuICB9XHJcblxyXG4gIGhhbmRsZVBhdXNlID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUGF1c2UnKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IGZhbHNlIH0pXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgYnV0dG9uVmlzaWJsZTogJ2Jsb2NrJyB9KVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlUHJvZ3Jlc3MgPSBzdGF0ZSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25Qcm9ncmVzcycsIHN0YXRlKVxyXG4gICAgLy8gV2Ugb25seSB3YW50IHRvIHVwZGF0ZSB0aW1lIHNsaWRlciBpZiB3ZSBhcmUgbm90IGN1cnJlbnRseSBzZWVraW5nXHJcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2Vla2luZykge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKVxyXG4gICAgfVxyXG4gIH1cclxuICBoYW5kbGVQbGF5UGF1c2UgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLnBsYXlpbmcpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogIXRoaXMuc3RhdGUucGxheWluZyB9KVxyXG4gIH1cclxuXHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnZpZGVvVXJsID09IHVuZGVmaW5lZCB8fCB0aGlzLnByb3BzLnZpZGVvVXJsID09IG51bGwgfHwgdGhpcy5wcm9wcy52aWRlb1VybCA9PSAnJykgcmV0dXJuIDxFcnJvciBzdGF0dXNDb2RlPVwiNDA0XCIgLz47XHJcbiAgICBjb25zdCBoYXNodGFncyA9IHRoaXMucHJvcHMuZGVzY3JpcHRpb24ubWF0Y2goLyNcXHcrL2cpIHx8IFtdO1xyXG4gICAgY29uc3QgY3VycmVudFVybCA9IHByb2Nlc3MuZW52Lmhvc3RuYW1lICsgdGhpcy5wcm9wcy5hc1BhdGg7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInBhdGhcIixjdXJyZW50VXJsKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxMYXlvdXQgdGl0bGU9XCJHZW51aW5cIiBjb250ZW50PXt0aGlzLnByb3BzLnZpZGVvVGh1bWJuYWlsfSBkZXNjcmlwdGlvbj17dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn0gY3VycmVudFVybD17Y3VycmVudFVybH0ga2V5d29yZD0nZ2VudWluZSc+XHJcbiAgICAgICAgPENhcmQgc3R5bGU9e3sgd2lkdGg6ICc1MHJlbScsIGhlaWdodDogJzk5JScsIGJvcmRlclJhZGl1czogJzEwcHgnIH19PlxyXG4gICAgICAgICAgPENhcmQuQm9keSA+XHJcbiAgICAgICAgICAgIDxDb250YWluZXIgZmx1aWQ9XCJtZFwiPlxyXG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiZC1ibG9ja1wiPlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17Nn0gY2xhc3NOYW1lPVwicGFkZGluZy0wIHctMTAwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzQlJywgbGVmdDogJzE2JScsIHpJbmRleDogJzEnLCBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY29sb3I6ICcjRkZGRkZGJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzIwcHQnXHJcbiAgICAgICAgICAgICAgICAgIH19Pnt0aGlzLnN0YXRlLnBsYXllZFNlY29uZHMudG9GaXhlZCgwKX0gU2VjPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGljb249e3RoaXMuc3RhdGUucGxheWluZyA/IGZhUGF1c2UgOiBmYVBsYXl9IGNsYXNzTmFtZT1cInBsYXlidG5cIiBvbkNsaWNrPXt0aGlzLmhhbmRsZVBsYXlQYXVzZX0gc3R5bGU9e3sgd2lkdGg6ICcxNCUnLCBjdXJzb3I6ICdwb2ludGVyJywgcmlnaHQ6ICc0NCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnMzklJywgZGlzcGxheTogdGhpcy5zdGF0ZS5idXR0b25WaXNpYmxlIH19IC8+XHJcblxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImQtbm9uZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm90dG9tOiAnMTZweCcsIG1hcmdpblRvcDogJzMwcHgnLHdpZHRoOiAnNTAlJ319PlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGNsYXNzTmFtZT1cImNvbW1lbnRJY29uXCIgaWNvbj17ZmFDb21tZW50RG90c30gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzc4JScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNvbW1lbnR4dFwiIHN0eWxlPXt7IGxpbmVIZWlnaHQ6ICcyOHB4Jywgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzcyJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5MyUnLGZvbnRTaXplOiAnMTZwdCcgfX0+e3RoaXMucHJvcHMubm9PZkNvbnZlcnNhdGlvbn0gXHJcbiAgICAgICAgICAgICAgICAgIDxzdWIgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJywgZm9udFNpemU6ICcxMnB0JywgYm90dG9tOiAnNnB4J319PnJlcGxpZXM8L3N1Yj48L3NwYW4+IFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3R0b206ICcxNnB4JywgbWFyZ2luVG9wOiAnMzBweCcsd2lkdGg6ICc1MCUnfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxGb250QXdlc29tZUljb24gY2xhc3NOYW1lPVwiZXllSWNvblwiIGljb249e2ZhRXllfSBzdHlsZT17eyB3aWR0aDogJzUlJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNTElJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzk0JScgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidmlld3R4dFwiIHN0eWxlPXt7IGxpbmVIZWlnaHQ6ICcyOHB4Jywgd2lkdGg6ICc5JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzQwJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5MyUnLGZvbnRTaXplOiAnMTZwdCd9fT57dGhpcy5wcm9wcy5ub09mVmlld3N9XHJcbiAgICAgICAgICAgICAgICAgIDxzdWIgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJywgZm9udFNpemU6ICcxMnB0JywgYm90dG9tOiAnNnB4JywgbGVmdDogJzJweCcgfX0+dmlld3M8L3N1Yj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250ZW50IHRhZ1wiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcxNnB0JywgbWFyZ2luOiAnMHB4JyxtaW5IZWlnaHQ6ICdhdXRvJyxvdmVyZmxvdzogJ2luaGVyaXQnfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEhpZ2hsaWdodGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjYmZlNGYzJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0Q2xhc3NOYW1lPVwibWF0Y2hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgc2VhcmNoV29yZHM9e2hhc2h0YWdzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgdGV4dFRvSGlnaGxpZ2h0PXt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufVxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8UmVhY3RQbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J3JlYWN0LXBsYXllciBmaXhlZC1ib3R0b20nXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsPXt0aGlzLnByb3BzLnZpZGVvVXJsfVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXlpbmc9e3RoaXMuc3RhdGUucGxheWluZ31cclxuICAgICAgICAgICAgICAgICAgICB3aWR0aD0nMzUwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PSc2MjBweCdcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnLTMlJywgYm9yZGVyUmFkaXVzOiAnMjJweCcsIG92ZXJmbG93OiAnaGlkZGVuJywgY3Vyc29yOiAncG9pbnRlcidcclxuICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzPXtmYWxzZX1cclxuICAgICAgICAgICAgICAgICAgICAvLyBsaWdodD17dHJ1ZX1cclxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVBsYXlQYXVzZX1cclxuICAgICAgICAgICAgICAgICAgICBvblBsYXk9e3RoaXMuaGFuZGxlUGxheX1cclxuICAgICAgICAgICAgICAgICAgICBvblBhdXNlPXt0aGlzLmhhbmRsZVBhdXNlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUHJvZ3Jlc3M9e3RoaXMuaGFuZGxlUHJvZ3Jlc3N9XHJcbiAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezZ9IGNsYXNzTmFtZT1cImQtbm9uZVwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRlbnRcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMjYuOXB0JywgbWFyZ2luVG9wOiAnMTVweCcsbWluSGVpZ2h0OiAnMzgycHgnLG92ZXJmbG93OiAnYXV0byd9fT5cclxuICAgICAgICAgICAgICAgICAgICA8SGlnaGxpZ2h0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodFN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNiZmU0ZjMnIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRDbGFzc05hbWU9XCJtYXRjaFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hXb3Jkcz17aGFzaHRhZ3N9XHJcbiAgICAgICAgICAgICAgICAgICAgICB0ZXh0VG9IaWdobGlnaHQ9e3RoaXMucHJvcHMuZGVzY3JpcHRpb259XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwbGlua1wiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcxMy45cHQnLCBtYXJnaW5Ub3A6ICczNCUnIH19PiAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YT5HZXQgdGhlIEFwcDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9MaW5rPiB0byByZXBseSBhbmQgbWFrZSBnZW51aW4gY29ubmVjdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNvY2lhbGxpbmtcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMTMuOXB0JywgbWFyZ2luVG9wOiAnMyUnLCBkaXJlY3Rpb246ICdydGwnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIndoYXRzYXBwSWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFXaGF0c2FwcH0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiaW5zdGFJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUluc3RhZ3JhbX0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cInR3aXR0ZXJJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYVR3aXR0ZXJ9IHN0eWxlPXt7IHdpZHRoOiAnNiUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJmYWNlYm9va0ljb25cIj48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhRmFjZWJvb2tGfSBzdHlsZT17eyB3aWR0aDogJzQlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZWRpYS1saW5rIHBhZGRpbmctMFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzI5cHQnLCBib3JkZXI6ICcxcHggIzAwOTREMCBzb2xpZCcsIGJvcmRlclJhZGl1czogJzlweCcsIHBhZGRpbmc6ICc0cHgnLCB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ1cmx0eHRcIiBzdHlsZT17eyBmb250U2l6ZTogJzE1cHQnLCBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRXZWlnaHQ6ICdib2xkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXJnaW5Ub3A6ICctMTBweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5saW5rfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4mbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY29weXR4dFwiIHN0eWxlPXt7IGNvbG9yOiAnI0ZGMDAwMCcsIGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LUJvbGQnLCB0ZXh0QWxpZ246ICdyaWdodCcsIGZvbnRTaXplOiAnMTVwdCcsIGN1cnNvcjogJ3BvaW50ZXInLCAnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snLCAnZmxvYXQnOiAncmlnaHQnLCAnbWFyZ2luVG9wJzogJy00cHgnIH19IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ29weX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5jb3B5VGV4dH1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9Db2w+XHJcbiAgICAgICAgICAgICAgPC9Sb3c+XHJcbiAgICAgICAgICAgICAgPFJvdyAgY2xhc3NOYW1lPVwiZC1ub25lXCI+XHJcbiAgICAgICAgICAgICAgICA8Q29sIG1kPXsxMn0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdsaW5rUHJldmlldycgc3R5bGU9e3sgbWFyZ2luVG9wOiAnN3B4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7LyogPEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYVRpbWVzfSBzdHlsZT17eyB3aWR0aDogJzElJywgaGVpZ2h0OiAnNiUnLCB6SW5kZXg6ICc5OTk5OTk5OScscG9zaXRpb246ICdmaXhlZCcscmlnaHQ6ICcxMyUnIH19IC8+ICovfVxyXG4gICAgICAgICAgICAgICAgICAgIDxNaWNyb2xpbmsgdXJsPXt0aGlzLnByb3BzLmxpbmt9IHN0eWxlPXt7IG1heFdpZHRoOiAnNzgzcHgnLCBoZWlnaHQ6ICcxMDBweCcsIGJhY2tncm91bmRDb2xvcjogJ2xpZ2h0Z3JleScgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgPC9Db250YWluZXI+XHJcbiAgICAgICAgICA8L0NhcmQuQm9keT5cclxuICAgICAgICA8L0NhcmQ+XHJcbiAgICAgIDwvTGF5b3V0ID5cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7Il0sInNvdXJjZVJvb3QiOiIifQ==