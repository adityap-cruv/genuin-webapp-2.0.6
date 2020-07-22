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
        className: "d-none",
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
          overflow: 'inherit',
          background: '#000',
          borderRadius: '0px'
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
          height: '382px',
          overflowX: 'hidden'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJsaW5rIiwic2V0U3RhdGUiLCJjb3B5VGV4dCIsImNvbnNvbGUiLCJsb2ciLCJwbGF5aW5nIiwiYnV0dG9uVmlzaWJsZSIsInNlZWtpbmciLCJwbGF5ZWRTZWNvbmRzIiwibG9hZGVkIiwidmlkZW9VcmwiLCJ1bmRlZmluZWQiLCJoYXNodGFncyIsImRlc2NyaXB0aW9uIiwibWF0Y2giLCJjdXJyZW50VXJsIiwicHJvY2VzcyIsImFzUGF0aCIsInZpZGVvVGh1bWJuYWlsIiwid2lkdGgiLCJoZWlnaHQiLCJib3JkZXJSYWRpdXMiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJ6SW5kZXgiLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJ0b0ZpeGVkIiwiZmFQYXVzZSIsImZhUGxheSIsImhhbmRsZVBsYXlQYXVzZSIsImN1cnNvciIsInJpZ2h0IiwiZGlzcGxheSIsImJvdHRvbSIsIm1hcmdpblRvcCIsImZhQ29tbWVudERvdHMiLCJjb2xvciIsImxpbmVIZWlnaHQiLCJub09mQ29udmVyc2F0aW9uIiwiZmFFeWUiLCJub09mVmlld3MiLCJtYXJnaW4iLCJtaW5IZWlnaHQiLCJvdmVyZmxvdyIsImJhY2tncm91bmQiLCJiYWNrZ3JvdW5kQ29sb3IiLCJoYW5kbGVQbGF5IiwiaGFuZGxlUGF1c2UiLCJoYW5kbGVQcm9ncmVzcyIsIm92ZXJmbG93WCIsImRpcmVjdGlvbiIsImZhV2hhdHNhcHAiLCJmYUluc3RhZ3JhbSIsImZhVHdpdHRlciIsImZhRmFjZWJvb2tGIiwiYm9yZGVyIiwicGFkZGluZyIsImZvbnRXZWlnaHQiLCJ0ZXh0QWxpZ24iLCJoYW5kbGVDb3B5IiwibWF4V2lkdGgiLCJSZWFjdCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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ZF0uanMuODc0M2U3MzVjYThmNGI1ZDc2NzAuaG90LXVwZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcclxuLy8gaW1wb3J0IFJlYWN0UGxheWVyIGZyb20gJ3JlYWN0LXBsYXllcidcclxuaW1wb3J0IHsgQ29udGFpbmVyLCBSb3csIENvbCB9IGZyb20gJ3JlYWN0LWdyaWQtc3lzdGVtJztcclxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gJ3JlYWN0LWJvb3RzdHJhcCc7XHJcbmltcG9ydCBMYXlvdXQgZnJvbSBcIi4uL2NvbXBvbmVudHMvTGF5b3V0XCI7XHJcbmltcG9ydCBSZWFjdFBsYXllciBmcm9tICdyZWFjdC1wbGF5ZXInO1xyXG5pbXBvcnQgcm91dGVyIGZyb20gJ25leHQvcm91dGVyJztcclxuaW1wb3J0IGNvcHkgZnJvbSAnY29weS10by1jbGlwYm9hcmQnO1xyXG5pbXBvcnQgSGlnaGxpZ2h0ZXIgZnJvbSBcInJlYWN0LWhpZ2hsaWdodC13b3Jkc1wiO1xyXG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnO1xyXG5pbXBvcnQgTWljcm9saW5rIGZyb20gJ0BtaWNyb2xpbmsvcmVhY3QnO1xyXG5pbXBvcnQgeyBGb250QXdlc29tZUljb24gfSBmcm9tIFwiQGZvcnRhd2Vzb21lL3JlYWN0LWZvbnRhd2Vzb21lXCI7XHJcbmltcG9ydCB7IGxpYnJhcnkgfSBmcm9tICdAZm9ydGF3ZXNvbWUvZm9udGF3ZXNvbWUtc3ZnLWNvcmUnXHJcbmltcG9ydCB7IGZhVGltZXMsIGZhUGxheSwgZmFQYXVzZSwgZmFDb21tZW50RG90cywgZmFFeWUsIGZhRXllRHJvcHBlciB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnNcIjtcclxuaW1wb3J0IHsgZmFGYWNlYm9va0YsIGZhSW5zdGFncmFtLCBmYVdoYXRzYXBwLCBmYVR3aXR0ZXIgfSBmcm9tIFwiQGZvcnRhd2Vzb21lL2ZyZWUtYnJhbmRzLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgRXJyb3IgZnJvbSAnbmV4dC9lcnJvcic7XHJcbmltcG9ydCBjdXN0b20gZnJvbSAnLi9jdXN0b20uc2Nzcyc7XHJcblxyXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlID0ge1xyXG4gICAgICBjb3B5VGV4dDogJ2NvcHknLFxyXG4gICAgICBwbGF5ZWRTZWNvbmRzOiAwLFxyXG4gICAgICBsb2FkZWQ6IDAsXHJcbiAgICAgIHBsYXlpbmc6IGZhbHNlLFxyXG4gICAgICBidXR0b25WaXNpYmxlOiAnYmxvY2snXHJcbiAgICB9O1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGdsb2JhbC53aW5kb3cgPSB7fVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlQ29weSA9IHN0YXRlID0+IHtcclxuICAgIGNvcHkodGhpcy5wcm9wcy5saW5rKTtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5VGV4dDogXCJDb3BpZWQhXCIgfSk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVQbGF5ID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUGxheScpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogdHJ1ZSB9KVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGJ1dHRvblZpc2libGU6ICdub25lJyB9KVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlUGF1c2UgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25QYXVzZScpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogZmFsc2UgfSlcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBidXR0b25WaXNpYmxlOiAnYmxvY2snIH0pXHJcbiAgfVxyXG5cclxuICBoYW5kbGVQcm9ncmVzcyA9IHN0YXRlID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblByb2dyZXNzJywgc3RhdGUpXHJcbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gdXBkYXRlIHRpbWUgc2xpZGVyIGlmIHdlIGFyZSBub3QgY3VycmVudGx5IHNlZWtpbmdcclxuICAgIGlmICghdGhpcy5zdGF0ZS5zZWVraW5nKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpXHJcbiAgICB9XHJcbiAgfVxyXG4gIGhhbmRsZVBsYXlQYXVzZSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUucGxheWluZylcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiAhdGhpcy5zdGF0ZS5wbGF5aW5nIH0pXHJcbiAgfVxyXG5cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYgKHRoaXMucHJvcHMudmlkZW9VcmwgPT0gdW5kZWZpbmVkIHx8IHRoaXMucHJvcHMudmlkZW9VcmwgPT0gbnVsbCB8fCB0aGlzLnByb3BzLnZpZGVvVXJsID09ICcnKSByZXR1cm4gPEVycm9yIHN0YXR1c0NvZGU9XCI0MDRcIiAvPjtcclxuICAgIGNvbnN0IGhhc2h0YWdzID0gdGhpcy5wcm9wcy5kZXNjcmlwdGlvbi5tYXRjaCgvI1xcdysvZykgfHwgW107XHJcbiAgICBjb25zdCBjdXJyZW50VXJsID0gcHJvY2Vzcy5lbnYuaG9zdG5hbWUgKyB0aGlzLnByb3BzLmFzUGF0aDtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicGF0aFwiLGN1cnJlbnRVcmwpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPExheW91dCB0aXRsZT1cIkdlbnVpblwiIGNvbnRlbnQ9e3RoaXMucHJvcHMudmlkZW9UaHVtYm5haWx9IGRlc2NyaXB0aW9uPXt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufSBjdXJyZW50VXJsPXtjdXJyZW50VXJsfSBrZXl3b3JkPSdnZW51aW5lJz5cclxuICAgICAgICA8Q2FyZCBzdHlsZT17eyB3aWR0aDogJzUwcmVtJywgaGVpZ2h0OiAnOTklJywgYm9yZGVyUmFkaXVzOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICA8Q2FyZC5Cb2R5ID5cclxuICAgICAgICAgICAgPENvbnRhaW5lciBmbHVpZD1cIm1kXCI+XHJcbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJkLWJsb2NrXCI+XHJcbiAgICAgICAgICAgICAgICA8Q29sIG1kPXs2fSBjbGFzc05hbWU9XCJwYWRkaW5nLTAgdy0xMDBcIj5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZC1ub25lXCIgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnNCUnLCBsZWZ0OiAnMTYlJywgekluZGV4OiAnMScsIGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJyxcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb2xvcjogJyNGRkZGRkYnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMjBwdCdcclxuICAgICAgICAgICAgICAgICAgfX0+e3RoaXMuc3RhdGUucGxheWVkU2Vjb25kcy50b0ZpeGVkKDApfSBTZWM8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxGb250QXdlc29tZUljb24gaWNvbj17dGhpcy5zdGF0ZS5wbGF5aW5nID8gZmFQYXVzZSA6IGZhUGxheX0gY2xhc3NOYW1lPVwicGxheWJ0blwiIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUGxheVBhdXNlfSBzdHlsZT17eyB3aWR0aDogJzE0JScsIGN1cnNvcjogJ3BvaW50ZXInLCByaWdodDogJzQ0JScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICczOSUnLCBkaXNwbGF5OiB0aGlzLnN0YXRlLmJ1dHRvblZpc2libGUgfX0gLz5cclxuXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZC1ub25lXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3R0b206ICcxNnB4JywgbWFyZ2luVG9wOiAnMzBweCcsd2lkdGg6ICc1MCUnfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxGb250QXdlc29tZUljb24gY2xhc3NOYW1lPVwiY29tbWVudEljb25cIiBpY29uPXtmYUNvbW1lbnREb3RzfSBzdHlsZT17eyB3aWR0aDogJzUlJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNzglJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzk0JScgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiY29tbWVudHh0XCIgc3R5bGU9e3sgbGluZUhlaWdodDogJzI4cHgnLCB3aWR0aDogJzUlJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNzIlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzkzJScsZm9udFNpemU6ICcxNnB0JyB9fT57dGhpcy5wcm9wcy5ub09mQ29udmVyc2F0aW9ufSBcclxuICAgICAgICAgICAgICAgICAgPHN1YiBzdHlsZT17e3Bvc2l0aW9uOiAncmVsYXRpdmUnLCBmb250U2l6ZTogJzEycHQnLCBib3R0b206ICc2cHgnfX0+cmVwbGllczwvc3ViPjwvc3Bhbj4gXHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvdHRvbTogJzE2cHgnLCBtYXJnaW5Ub3A6ICczMHB4Jyx3aWR0aDogJzUwJSd9fT5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBjbGFzc05hbWU9XCJleWVJY29uXCIgaWNvbj17ZmFFeWV9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc1MSUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTQlJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ2aWV3dHh0XCIgc3R5bGU9e3sgbGluZUhlaWdodDogJzI4cHgnLCB3aWR0aDogJzklJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNDAlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzkzJScsZm9udFNpemU6ICcxNnB0J319Pnt0aGlzLnByb3BzLm5vT2ZWaWV3c31cclxuICAgICAgICAgICAgICAgICAgPHN1YiBzdHlsZT17e3Bvc2l0aW9uOiAncmVsYXRpdmUnLCBmb250U2l6ZTogJzEycHQnLCBib3R0b206ICc2cHgnLCBsZWZ0OiAnMnB4JyB9fT52aWV3czwvc3ViPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRlbnQgdGFnXCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzE2cHQnLCBtYXJnaW46ICcwcHgnLG1pbkhlaWdodDogJ2F1dG8nLG92ZXJmbG93OiAnaW5oZXJpdCcsIGJhY2tncm91bmQ6ICcjMDAwJywgYm9yZGVyUmFkaXVzOiAnMHB4J319PlxyXG4gICAgICAgICAgICAgICAgICAgIDxIaWdobGlnaHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0U3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2JmZTRmMycgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodENsYXNzTmFtZT1cIm1hdGNoXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFdvcmRzPXtoYXNodGFnc31cclxuICAgICAgICAgICAgICAgICAgICAgIHRleHRUb0hpZ2hsaWdodD17dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn1cclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPFJlYWN0UGxheWVyXHJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdyZWFjdC1wbGF5ZXIgZml4ZWQtYm90dG9tJ1xyXG4gICAgICAgICAgICAgICAgICAgIHVybD17dGhpcy5wcm9wcy52aWRlb1VybH1cclxuICAgICAgICAgICAgICAgICAgICBwbGF5aW5nPXt0aGlzLnN0YXRlLnBsYXlpbmd9XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9JzM1MHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD0nNjIwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJy0zJScsIGJvcmRlclJhZGl1czogJzIycHgnLCBvdmVyZmxvdzogJ2hpZGRlbicsIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICBjb250cm9scz17ZmFsc2V9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGlnaHQ9e3RydWV9XHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVQbGF5UGF1c2V9XHJcbiAgICAgICAgICAgICAgICAgICAgb25QbGF5PXt0aGlzLmhhbmRsZVBsYXl9XHJcbiAgICAgICAgICAgICAgICAgICAgb25QYXVzZT17dGhpcy5oYW5kbGVQYXVzZX1cclxuICAgICAgICAgICAgICAgICAgICBvblByb2dyZXNzPXt0aGlzLmhhbmRsZVByb2dyZXNzfVxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPC9Db2w+XHJcbiAgICAgICAgICAgICAgICA8Q29sIG1kPXs2fSBjbGFzc05hbWU9XCJkLW5vbmVcIj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250ZW50XCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzI2LjlwdCcsIG1hcmdpblRvcDogJzE1cHgnLGhlaWdodDogJzM4MnB4JyxvdmVyZmxvd1g6ICdoaWRkZW4nfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEhpZ2hsaWdodGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjYmZlNGYzJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0Q2xhc3NOYW1lPVwibWF0Y2hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgc2VhcmNoV29yZHM9e2hhc2h0YWdzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgdGV4dFRvSGlnaGxpZ2h0PXt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufVxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGxpbmtcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMTMuOXB0JywgbWFyZ2luVG9wOiAnMzQlJyB9fT4gICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGE+R2V0IHRoZSBBcHA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvTGluaz4gdG8gcmVwbHkgYW5kIG1ha2UgZ2VudWluIGNvbm5lY3Rpb248L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzb2NpYWxsaW5rXCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzEzLjlwdCcsIG1hcmdpblRvcDogJzMlJywgZGlyZWN0aW9uOiAncnRsJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJ3aGF0c2FwcEljb25cIj48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhV2hhdHNhcHB9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImluc3RhSWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFJbnN0YWdyYW19IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJ0d2l0dGVySWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFUd2l0dGVyfSBzdHlsZT17eyB3aWR0aDogJzYlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiZmFjZWJvb2tJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUZhY2Vib29rRn0gc3R5bGU9e3sgd2lkdGg6ICc0JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWVkaWEtbGluayBwYWRkaW5nLTBcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcyOXB0JywgYm9yZGVyOiAnMXB4ICMwMDk0RDAgc29saWQnLCBib3JkZXJSYWRpdXM6ICc5cHgnLCBwYWRkaW5nOiAnNHB4JywgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidXJsdHh0XCIgc3R5bGU9e3sgZm9udFNpemU6ICcxNXB0JywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250V2VpZ2h0OiAnYm9sZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgbWFyZ2luVG9wOiAnLTEwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMubGlua31cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNvcHl0eHRcIiBzdHlsZT17eyBjb2xvcjogJyNGRjAwMDAnLCBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1Cb2xkJywgdGV4dEFsaWduOiAncmlnaHQnLCBmb250U2l6ZTogJzE1cHQnLCBjdXJzb3I6ICdwb2ludGVyJywgJ2Rpc3BsYXknOiAnaW5saW5lLWJsb2NrJywgJ2Zsb2F0JzogJ3JpZ2h0JywgJ21hcmdpblRvcCc6ICctNHB4JyB9fSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNvcHl9PlxyXG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuY29weVRleHR9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvQ29sPlxyXG4gICAgICAgICAgICAgIDwvUm93PlxyXG4gICAgICAgICAgICAgIDxSb3cgIGNsYXNzTmFtZT1cImQtbm9uZVwiPlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17MTJ9PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbGlua1ByZXZpZXcnIHN0eWxlPXt7IG1hcmdpblRvcDogJzdweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgey8qIDxGb250QXdlc29tZUljb24gaWNvbj17ZmFUaW1lc30gc3R5bGU9e3sgd2lkdGg6ICcxJScsIGhlaWdodDogJzYlJywgekluZGV4OiAnOTk5OTk5OTknLHBvc2l0aW9uOiAnZml4ZWQnLHJpZ2h0OiAnMTMlJyB9fSAvPiAqL31cclxuICAgICAgICAgICAgICAgICAgICA8TWljcm9saW5rIHVybD17dGhpcy5wcm9wcy5saW5rfSBzdHlsZT17eyBtYXhXaWR0aDogJzc4M3B4JywgaGVpZ2h0OiAnMTAwcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICdsaWdodGdyZXknIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9Db2w+XHJcbiAgICAgICAgICAgICAgPC9Sb3c+XHJcbiAgICAgICAgICAgIDwvQ29udGFpbmVyPlxyXG4gICAgICAgICAgPC9DYXJkLkJvZHk+XHJcbiAgICAgICAgPC9DYXJkPlxyXG4gICAgICA8L0xheW91dCA+XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheWVyOyJdLCJzb3VyY2VSb290IjoiIn0=