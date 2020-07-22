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
      }, __jsx("div", {
        style: {
          bottom: '16px',
          marginTop: '30px',
          width: '50%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 75,
          columnNumber: 15
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
          lineNumber: 76,
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
          lineNumber: 77,
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
          lineNumber: 78,
          columnNumber: 19
        }
      }, "replies"))), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        className: "padding-0 w-100",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 80,
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
          lineNumber: 81,
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
          lineNumber: 86,
          columnNumber: 19
        }
      }), __jsx("div", {
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 88,
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
          lineNumber: 89,
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
          lineNumber: 90,
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
          lineNumber: 91,
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
          lineNumber: 92,
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
          lineNumber: 94,
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
          lineNumber: 95,
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
          lineNumber: 96,
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
          lineNumber: 97,
          columnNumber: 19
        }
      }, "views")))), __jsx(react_player__WEBPACK_IMPORTED_MODULE_11___default.a, {
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
          lineNumber: 100,
          columnNumber: 19
        }
      })), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 117,
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
          lineNumber: 118,
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
          lineNumber: 119,
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
          lineNumber: 126,
          columnNumber: 19
        }
      }, "        ", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 126,
          columnNumber: 136
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 127,
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
          lineNumber: 129,
          columnNumber: 19
        }
      }, __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 130,
          columnNumber: 21
        }
      }, __jsx("a", {
        id: "whatsappIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 131,
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
          lineNumber: 131,
          columnNumber: 44
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 133,
          columnNumber: 33
        }
      }, __jsx("a", {
        id: "instaIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 134,
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
          lineNumber: 134,
          columnNumber: 41
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 136,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "twitterIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 137,
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
          lineNumber: 137,
          columnNumber: 43
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
        id: "facebookIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 140,
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
          lineNumber: 140,
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
          lineNumber: 143,
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
          lineNumber: 144,
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
          lineNumber: 147,
          columnNumber: 23
        }
      }, this.state.copyText)))), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Row"], {
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 153,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 12,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 154,
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
          lineNumber: 155,
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
          lineNumber: 157,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJsaW5rIiwic2V0U3RhdGUiLCJjb3B5VGV4dCIsImNvbnNvbGUiLCJsb2ciLCJwbGF5aW5nIiwiYnV0dG9uVmlzaWJsZSIsInNlZWtpbmciLCJwbGF5ZWRTZWNvbmRzIiwibG9hZGVkIiwidmlkZW9VcmwiLCJ1bmRlZmluZWQiLCJoYXNodGFncyIsImRlc2NyaXB0aW9uIiwibWF0Y2giLCJjdXJyZW50VXJsIiwicHJvY2VzcyIsImFzUGF0aCIsInZpZGVvVGh1bWJuYWlsIiwid2lkdGgiLCJoZWlnaHQiLCJib3JkZXJSYWRpdXMiLCJib3R0b20iLCJtYXJnaW5Ub3AiLCJmYUNvbW1lbnREb3RzIiwiY29sb3IiLCJyaWdodCIsInpJbmRleCIsInBvc2l0aW9uIiwidG9wIiwibGluZUhlaWdodCIsImZvbnRTaXplIiwibm9PZkNvbnZlcnNhdGlvbiIsImxlZnQiLCJmb250RmFtaWx5IiwidG9GaXhlZCIsImZhUGF1c2UiLCJmYVBsYXkiLCJoYW5kbGVQbGF5UGF1c2UiLCJjdXJzb3IiLCJkaXNwbGF5IiwiZmFFeWUiLCJub09mVmlld3MiLCJvdmVyZmxvdyIsImhhbmRsZVBsYXkiLCJoYW5kbGVQYXVzZSIsImhhbmRsZVByb2dyZXNzIiwibWluSGVpZ2h0IiwiYmFja2dyb3VuZENvbG9yIiwiZGlyZWN0aW9uIiwiZmFXaGF0c2FwcCIsImZhSW5zdGFncmFtIiwiZmFUd2l0dGVyIiwiZmFGYWNlYm9va0YiLCJib3JkZXIiLCJwYWRkaW5nIiwiZm9udFdlaWdodCIsInRleHRBbGlnbiIsImhhbmRsZUNvcHkiLCJtYXhXaWR0aCIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FDQTs7QUFDQTtBQUNBO0FBQ0E7QUFD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RDtBQUFXLFdBQUcsRUFBRSxLQUFLMUIsS0FBTCxDQUFXRyxJQUEzQjtBQUFpQyxhQUFLLEVBQUU7QUFBRTJELGtCQUFRLEVBQUUsT0FBWjtBQUFxQnZDLGdCQUFNLEVBQUUsT0FBN0I7QUFBc0M0Qix5QkFBZSxFQUFFO0FBQXZELFNBQXhDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsUUFGRixDQURGLENBREYsQ0FoRkYsQ0FERixDQURGLENBREYsQ0FERjtBQWlHRDs7OztFQW5Ka0JZLDRDQUFLLENBQUNDLFM7O0FBc0paakUscUVBQWYiLCJmaWxlIjoic3RhdGljL3dlYnBhY2svc3RhdGljXFxkZXZlbG9wbWVudFxccGFnZXNcXHZpZGVvXFxbaWRdLmpzLjUxOWI0YzUzOTA5MzI2NDIyZjFkLmhvdC11cGRhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXHJcbi8vIGltcG9ydCBSZWFjdFBsYXllciBmcm9tICdyZWFjdC1wbGF5ZXInXHJcbmltcG9ydCB7IENvbnRhaW5lciwgUm93LCBDb2wgfSBmcm9tICdyZWFjdC1ncmlkLXN5c3RlbSc7XHJcbmltcG9ydCB7IENhcmQgfSBmcm9tICdyZWFjdC1ib290c3RyYXAnO1xyXG5pbXBvcnQgTGF5b3V0IGZyb20gXCIuLi9jb21wb25lbnRzL0xheW91dFwiO1xyXG5pbXBvcnQgUmVhY3RQbGF5ZXIgZnJvbSAncmVhY3QtcGxheWVyJztcclxuaW1wb3J0IHJvdXRlciBmcm9tICduZXh0L3JvdXRlcic7XHJcbmltcG9ydCBjb3B5IGZyb20gJ2NvcHktdG8tY2xpcGJvYXJkJztcclxuaW1wb3J0IEhpZ2hsaWdodGVyIGZyb20gXCJyZWFjdC1oaWdobGlnaHQtd29yZHNcIjtcclxuaW1wb3J0IExpbmsgZnJvbSAnbmV4dC9saW5rJztcclxuaW1wb3J0IE1pY3JvbGluayBmcm9tICdAbWljcm9saW5rL3JlYWN0JztcclxuaW1wb3J0IHsgRm9udEF3ZXNvbWVJY29uIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9yZWFjdC1mb250YXdlc29tZVwiO1xyXG5pbXBvcnQgeyBsaWJyYXJ5IH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZvbnRhd2Vzb21lLXN2Zy1jb3JlJ1xyXG5pbXBvcnQgeyBmYVRpbWVzLCBmYVBsYXksIGZhUGF1c2UsIGZhQ29tbWVudERvdHMsIGZhRXllLCBmYUV5ZURyb3BwZXIgfSBmcm9tIFwiQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zXCI7XHJcbmltcG9ydCB7IGZhRmFjZWJvb2tGLCBmYUluc3RhZ3JhbSwgZmFXaGF0c2FwcCwgZmFUd2l0dGVyIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9mcmVlLWJyYW5kcy1zdmctaWNvbnNcIjtcclxuaW1wb3J0IEVycm9yIGZyb20gJ25leHQvZXJyb3InO1xyXG5pbXBvcnQgY3VzdG9tIGZyb20gJy4vY3VzdG9tLnNjc3MnO1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgY29weVRleHQ6ICdjb3B5JyxcclxuICAgICAgcGxheWVkU2Vjb25kczogMCxcclxuICAgICAgbG9hZGVkOiAwLFxyXG4gICAgICBwbGF5aW5nOiBmYWxzZSxcclxuICAgICAgYnV0dG9uVmlzaWJsZTogJ2Jsb2NrJ1xyXG4gICAgfTtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBnbG9iYWwud2luZG93ID0ge31cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhhbmRsZUNvcHkgPSBzdGF0ZSA9PiB7XHJcbiAgICBjb3B5KHRoaXMucHJvcHMubGluayk7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgY29weVRleHQ6IFwiQ29waWVkIVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlUGxheSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblBsYXknKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IHRydWUgfSlcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBidXR0b25WaXNpYmxlOiAnbm9uZScgfSlcclxuICB9XHJcblxyXG4gIGhhbmRsZVBhdXNlID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUGF1c2UnKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IGZhbHNlIH0pXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgYnV0dG9uVmlzaWJsZTogJ2Jsb2NrJyB9KVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlUHJvZ3Jlc3MgPSBzdGF0ZSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25Qcm9ncmVzcycsIHN0YXRlKVxyXG4gICAgLy8gV2Ugb25seSB3YW50IHRvIHVwZGF0ZSB0aW1lIHNsaWRlciBpZiB3ZSBhcmUgbm90IGN1cnJlbnRseSBzZWVraW5nXHJcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2Vla2luZykge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKVxyXG4gICAgfVxyXG4gIH1cclxuICBoYW5kbGVQbGF5UGF1c2UgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLnBsYXlpbmcpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogIXRoaXMuc3RhdGUucGxheWluZyB9KVxyXG4gIH1cclxuXHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnZpZGVvVXJsID09IHVuZGVmaW5lZCB8fCB0aGlzLnByb3BzLnZpZGVvVXJsID09IG51bGwgfHwgdGhpcy5wcm9wcy52aWRlb1VybCA9PSAnJykgcmV0dXJuIDxFcnJvciBzdGF0dXNDb2RlPVwiNDA0XCIgLz47XHJcbiAgICBjb25zdCBoYXNodGFncyA9IHRoaXMucHJvcHMuZGVzY3JpcHRpb24ubWF0Y2goLyNcXHcrL2cpIHx8IFtdO1xyXG4gICAgY29uc3QgY3VycmVudFVybCA9IHByb2Nlc3MuZW52Lmhvc3RuYW1lICsgdGhpcy5wcm9wcy5hc1BhdGg7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhcInBhdGhcIixjdXJyZW50VXJsKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxMYXlvdXQgdGl0bGU9XCJHZW51aW5cIiBjb250ZW50PXt0aGlzLnByb3BzLnZpZGVvVGh1bWJuYWlsfSBkZXNjcmlwdGlvbj17dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn0gY3VycmVudFVybD17Y3VycmVudFVybH0ga2V5d29yZD0nZ2VudWluZSc+XHJcbiAgICAgICAgPENhcmQgc3R5bGU9e3sgd2lkdGg6ICc1MHJlbScsIGhlaWdodDogJzk5JScsIGJvcmRlclJhZGl1czogJzEwcHgnIH19PlxyXG4gICAgICAgICAgPENhcmQuQm9keSA+XHJcbiAgICAgICAgICAgIDxDb250YWluZXIgZmx1aWQ9XCJtZFwiPlxyXG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiZC1ibG9ja1wiPlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm90dG9tOiAnMTZweCcsIG1hcmdpblRvcDogJzMwcHgnLHdpZHRoOiAnNTAlJ319PlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGNsYXNzTmFtZT1cImNvbW1lbnRJY29uXCIgaWNvbj17ZmFDb21tZW50RG90c30gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzc4JScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNvbW1lbnR4dFwiIHN0eWxlPXt7IGxpbmVIZWlnaHQ6ICcyOHB4Jywgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzcyJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5MyUnLGZvbnRTaXplOiAnMTZwdCcgfX0+e3RoaXMucHJvcHMubm9PZkNvbnZlcnNhdGlvbn0gXHJcbiAgICAgICAgICAgICAgICAgIDxzdWIgc3R5bGU9e3twb3NpdGlvbjogJ3JlbGF0aXZlJywgZm9udFNpemU6ICcxMnB0JywgYm90dG9tOiAnNnB4J319PnJlcGxpZXM8L3N1Yj48L3NwYW4+IFxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezZ9IGNsYXNzTmFtZT1cInBhZGRpbmctMCB3LTEwMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc0JScsIGxlZnQ6ICcxNiUnLCB6SW5kZXg6ICcxJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyMHB0J1xyXG4gICAgICAgICAgICAgICAgICB9fT57dGhpcy5zdGF0ZS5wbGF5ZWRTZWNvbmRzLnRvRml4ZWQoMCl9IFNlYzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBpY29uPXt0aGlzLnN0YXRlLnBsYXlpbmcgPyBmYVBhdXNlIDogZmFQbGF5fSBjbGFzc05hbWU9XCJwbGF5YnRuXCIgb25DbGljaz17dGhpcy5oYW5kbGVQbGF5UGF1c2V9IHN0eWxlPXt7IHdpZHRoOiAnMTQlJywgY3Vyc29yOiAncG9pbnRlcicsIHJpZ2h0OiAnNDQlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzM5JScsIGRpc3BsYXk6IHRoaXMuc3RhdGUuYnV0dG9uVmlzaWJsZSB9fSAvPlxyXG5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkLW5vbmVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvdHRvbTogJzE2cHgnLCBtYXJnaW5Ub3A6ICczMHB4Jyx3aWR0aDogJzUwJSd9fT5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBjbGFzc05hbWU9XCJjb21tZW50SWNvblwiIGljb249e2ZhQ29tbWVudERvdHN9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc3OCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTQlJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJjb21tZW50eHRcIiBzdHlsZT17eyBsaW5lSGVpZ2h0OiAnMjhweCcsIHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc3MiUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTMlJyxmb250U2l6ZTogJzE2cHQnIH19Pnt0aGlzLnByb3BzLm5vT2ZDb252ZXJzYXRpb259IFxyXG4gICAgICAgICAgICAgICAgICA8c3ViIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZScsIGZvbnRTaXplOiAnMTJwdCcsIGJvdHRvbTogJzZweCd9fT5yZXBsaWVzPC9zdWI+PC9zcGFuPiBcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm90dG9tOiAnMTZweCcsIG1hcmdpblRvcDogJzMwcHgnLHdpZHRoOiAnNTAlJ319PlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGNsYXNzTmFtZT1cImV5ZUljb25cIiBpY29uPXtmYUV5ZX0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzUxJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInZpZXd0eHRcIiBzdHlsZT17eyBsaW5lSGVpZ2h0OiAnMjhweCcsIHdpZHRoOiAnOSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc0MCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTMlJyxmb250U2l6ZTogJzE2cHQnfX0+e3RoaXMucHJvcHMubm9PZlZpZXdzfVxyXG4gICAgICAgICAgICAgICAgICA8c3ViIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZScsIGZvbnRTaXplOiAnMTJwdCcsIGJvdHRvbTogJzZweCcsIGxlZnQ6ICcycHgnIH19PnZpZXdzPC9zdWI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxSZWFjdFBsYXllclxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ncmVhY3QtcGxheWVyIGZpeGVkLWJvdHRvbSdcclxuICAgICAgICAgICAgICAgICAgICB1cmw9e3RoaXMucHJvcHMudmlkZW9Vcmx9XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWluZz17dGhpcy5zdGF0ZS5wbGF5aW5nfVxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPSczNTBweCdcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9JzYyMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICctMyUnLCBib3JkZXJSYWRpdXM6ICcyMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHM9e2ZhbHNlfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpZ2h0PXt0cnVlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUGxheVBhdXNlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUGxheT17dGhpcy5oYW5kbGVQbGF5fVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUGF1c2U9e3RoaXMuaGFuZGxlUGF1c2V9XHJcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9ncmVzcz17dGhpcy5oYW5kbGVQcm9ncmVzc31cclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvQ29sPlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17Nn0gY2xhc3NOYW1lPVwiZC1ub25lXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGVudFwiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcyNi45cHQnLCBtYXJnaW5Ub3A6ICcxNXB4JyxtaW5IZWlnaHQ6ICczODJweCcsb3ZlcmZsb3c6ICdhdXRvJ319PlxyXG4gICAgICAgICAgICAgICAgICAgIDxIaWdobGlnaHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0U3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2JmZTRmMycgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodENsYXNzTmFtZT1cIm1hdGNoXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFdvcmRzPXtoYXNodGFnc31cclxuICAgICAgICAgICAgICAgICAgICAgIHRleHRUb0hpZ2hsaWdodD17dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn1cclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBsaW5rXCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzEzLjlwdCcsIG1hcmdpblRvcDogJzM0JScgfX0+ICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhPkdldCB0aGUgQXBwPC9hPlxyXG4gICAgICAgICAgICAgICAgICA8L0xpbms+IHRvIHJlcGx5IGFuZCBtYWtlIGdlbnVpbiBjb25uZWN0aW9uPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic29jaWFsbGlua1wiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcxMy45cHQnLCBtYXJnaW5Ub3A6ICczJScsIGRpcmVjdGlvbjogJ3J0bCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwid2hhdHNhcHBJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYVdoYXRzYXBwfSBzdHlsZT17eyB3aWR0aDogJzUlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJpbnN0YUljb25cIj48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhSW5zdGFncmFtfSBzdHlsZT17eyB3aWR0aDogJzUlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwidHdpdHRlckljb25cIj48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhVHdpdHRlcn0gc3R5bGU9e3sgd2lkdGg6ICc2JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImZhY2Vib29rSWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFGYWNlYm9va0Z9IHN0eWxlPXt7IHdpZHRoOiAnNCUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1lZGlhLWxpbmsgcGFkZGluZy0wXCIgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMjlwdCcsIGJvcmRlcjogJzFweCAjMDA5NEQwIHNvbGlkJywgYm9yZGVyUmFkaXVzOiAnOXB4JywgcGFkZGluZzogJzRweCcsIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInVybHR4dFwiIHN0eWxlPXt7IGZvbnRTaXplOiAnMTVwdCcsIGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFdlaWdodDogJ2JvbGQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIG1hcmdpblRvcDogJy0xMHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmxpbmt9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3B5dHh0XCIgc3R5bGU9e3sgY29sb3I6ICcjRkYwMDAwJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtQm9sZCcsIHRleHRBbGlnbjogJ3JpZ2h0JywgZm9udFNpemU6ICcxNXB0JywgY3Vyc29yOiAncG9pbnRlcicsICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaycsICdmbG9hdCc6ICdyaWdodCcsICdtYXJnaW5Ub3AnOiAnLTRweCcgfX0gb25DbGljaz17dGhpcy5oYW5kbGVDb3B5fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvcHlUZXh0fVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgICA8Um93ICBjbGFzc05hbWU9XCJkLW5vbmVcIj5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezEyfT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2xpbmtQcmV2aWV3JyBzdHlsZT17eyBtYXJnaW5Ub3A6ICc3cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiA8Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhVGltZXN9IHN0eWxlPXt7IHdpZHRoOiAnMSUnLCBoZWlnaHQ6ICc2JScsIHpJbmRleDogJzk5OTk5OTk5Jyxwb3NpdGlvbjogJ2ZpeGVkJyxyaWdodDogJzEzJScgfX0gLz4gKi99XHJcbiAgICAgICAgICAgICAgICAgICAgPE1pY3JvbGluayB1cmw9e3RoaXMucHJvcHMubGlua30gc3R5bGU9e3sgbWF4V2lkdGg6ICc3ODNweCcsIGhlaWdodDogJzEwMHB4JywgYmFja2dyb3VuZENvbG9yOiAnbGlnaHRncmV5JyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvQ29sPlxyXG4gICAgICAgICAgICAgIDwvUm93PlxyXG4gICAgICAgICAgICA8L0NvbnRhaW5lcj5cclxuICAgICAgICAgIDwvQ2FyZC5Cb2R5PlxyXG4gICAgICAgIDwvQ2FyZD5cclxuICAgICAgPC9MYXlvdXQgPlxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXllcjsiXSwic291cmNlUm9vdCI6IiJ9