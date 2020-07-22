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
          lineNumber: 95,
          columnNumber: 19
        }
      })), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 112,
          columnNumber: 17
        }
      }, __jsx("div", {
        className: "d-block content",
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
          lineNumber: 113,
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
          lineNumber: 114,
          columnNumber: 21
        }
      })), __jsx("div", {
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 121,
          columnNumber: 19
        }
      }, __jsx("div", {
        className: "applink",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '13.9pt',
          marginTop: '34%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 122,
          columnNumber: 19
        }
      }, "        ", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 122,
          columnNumber: 136
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 123,
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
          lineNumber: 125,
          columnNumber: 19
        }
      }, __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 126,
          columnNumber: 21
        }
      }, __jsx("a", {
        id: "whatsappIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 127,
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
          lineNumber: 127,
          columnNumber: 44
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 129,
          columnNumber: 33
        }
      }, __jsx("a", {
        id: "instaIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 130,
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
          lineNumber: 130,
          columnNumber: 41
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 132,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "twitterIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 133,
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
          lineNumber: 133,
          columnNumber: 43
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 135,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "facebookIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 136,
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
          lineNumber: 136,
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
          lineNumber: 139,
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
          lineNumber: 140,
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
          lineNumber: 143,
          columnNumber: 23
        }
      }, this.state.copyText))))), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Row"], {
        className: "d-none",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 150,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 12,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 151,
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
          lineNumber: 152,
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
          lineNumber: 154,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJsaW5rIiwic2V0U3RhdGUiLCJjb3B5VGV4dCIsImNvbnNvbGUiLCJsb2ciLCJwbGF5aW5nIiwiYnV0dG9uVmlzaWJsZSIsInNlZWtpbmciLCJwbGF5ZWRTZWNvbmRzIiwibG9hZGVkIiwidmlkZW9VcmwiLCJ1bmRlZmluZWQiLCJoYXNodGFncyIsImRlc2NyaXB0aW9uIiwibWF0Y2giLCJjdXJyZW50VXJsIiwicHJvY2VzcyIsImFzUGF0aCIsInZpZGVvVGh1bWJuYWlsIiwid2lkdGgiLCJoZWlnaHQiLCJib3JkZXJSYWRpdXMiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJ6SW5kZXgiLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJ0b0ZpeGVkIiwiZmFQYXVzZSIsImZhUGxheSIsImhhbmRsZVBsYXlQYXVzZSIsImN1cnNvciIsInJpZ2h0IiwiZGlzcGxheSIsImJvdHRvbSIsIm1hcmdpblRvcCIsImZhQ29tbWVudERvdHMiLCJjb2xvciIsImxpbmVIZWlnaHQiLCJub09mQ29udmVyc2F0aW9uIiwiZmFFeWUiLCJub09mVmlld3MiLCJvdmVyZmxvdyIsImhhbmRsZVBsYXkiLCJoYW5kbGVQYXVzZSIsImhhbmRsZVByb2dyZXNzIiwibWluSGVpZ2h0IiwiYmFja2dyb3VuZENvbG9yIiwiZGlyZWN0aW9uIiwiZmFXaGF0c2FwcCIsImZhSW5zdGFncmFtIiwiZmFUd2l0dGVyIiwiZmFGYWNlYm9va0YiLCJib3JkZXIiLCJwYWRkaW5nIiwiZm9udFdlaWdodCIsInRleHRBbGlnbiIsImhhbmRsZUNvcHkiLCJtYXhXaWR0aCIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FDQTs7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFBSyxpQkFBUyxFQUFDLGFBQWY7QUFBNkIsYUFBSyxFQUFFO0FBQUVrQyxtQkFBUyxFQUFFO0FBQWIsU0FBcEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUVFLE1BQUMseURBQUQ7QUFBVyxXQUFHLEVBQUUsS0FBS3ZDLEtBQUwsQ0FBV0csSUFBM0I7QUFBaUMsYUFBSyxFQUFFO0FBQUUyRCxrQkFBUSxFQUFFLE9BQVo7QUFBcUJ2QyxnQkFBTSxFQUFFLE9BQTdCO0FBQXNDNEIseUJBQWUsRUFBRTtBQUF2RCxTQUF4QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBRkYsQ0FERixDQURGLENBN0VGLENBREYsQ0FERixDQURGLENBREY7QUE4RkQ7Ozs7RUFoSmtCWSw0Q0FBSyxDQUFDQyxTOztBQW1KWmpFLHFFQUFmIiwiZmlsZSI6InN0YXRpYy93ZWJwYWNrL3N0YXRpY1xcZGV2ZWxvcG1lbnRcXHBhZ2VzXFx2aWRlb1xcW2lkXS5qcy42MGYzYmIzZDU1MDA5NTExYmNhZi5ob3QtdXBkYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xyXG4vLyBpbXBvcnQgUmVhY3RQbGF5ZXIgZnJvbSAncmVhY3QtcGxheWVyJ1xyXG5pbXBvcnQgeyBDb250YWluZXIsIFJvdywgQ29sIH0gZnJvbSAncmVhY3QtZ3JpZC1zeXN0ZW0nO1xyXG5pbXBvcnQgeyBDYXJkIH0gZnJvbSAncmVhY3QtYm9vdHN0cmFwJztcclxuaW1wb3J0IExheW91dCBmcm9tIFwiLi4vY29tcG9uZW50cy9MYXlvdXRcIjtcclxuaW1wb3J0IFJlYWN0UGxheWVyIGZyb20gJ3JlYWN0LXBsYXllcic7XHJcbmltcG9ydCByb3V0ZXIgZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG5pbXBvcnQgY29weSBmcm9tICdjb3B5LXRvLWNsaXBib2FyZCc7XHJcbmltcG9ydCBIaWdobGlnaHRlciBmcm9tIFwicmVhY3QtaGlnaGxpZ2h0LXdvcmRzXCI7XHJcbmltcG9ydCBMaW5rIGZyb20gJ25leHQvbGluayc7XHJcbmltcG9ydCBNaWNyb2xpbmsgZnJvbSAnQG1pY3JvbGluay9yZWFjdCc7XHJcbmltcG9ydCB7IEZvbnRBd2Vzb21lSWNvbiB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvcmVhY3QtZm9udGF3ZXNvbWVcIjtcclxuaW1wb3J0IHsgbGlicmFyeSB9IGZyb20gJ0Bmb3J0YXdlc29tZS9mb250YXdlc29tZS1zdmctY29yZSdcclxuaW1wb3J0IHsgZmFUaW1lcywgZmFQbGF5LCBmYVBhdXNlLCBmYUNvbW1lbnREb3RzLCBmYUV5ZSwgZmFFeWVEcm9wcGVyIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9mcmVlLXNvbGlkLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgeyBmYUZhY2Vib29rRiwgZmFJbnN0YWdyYW0sIGZhV2hhdHNhcHAsIGZhVHdpdHRlciB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvZnJlZS1icmFuZHMtc3ZnLWljb25zXCI7XHJcbmltcG9ydCBFcnJvciBmcm9tICduZXh0L2Vycm9yJztcclxuaW1wb3J0IGN1c3RvbSBmcm9tICcuL2N1c3RvbS5zY3NzJztcclxuXHJcbmNsYXNzIFBsYXllciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgIGNvcHlUZXh0OiAnY29weScsXHJcbiAgICAgIHBsYXllZFNlY29uZHM6IDAsXHJcbiAgICAgIGxvYWRlZDogMCxcclxuICAgICAgcGxheWluZzogZmFsc2UsXHJcbiAgICAgIGJ1dHRvblZpc2libGU6ICdibG9jaydcclxuICAgIH07XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZ2xvYmFsLndpbmRvdyA9IHt9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoYW5kbGVDb3B5ID0gc3RhdGUgPT4ge1xyXG4gICAgY29weSh0aGlzLnByb3BzLmxpbmspO1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGNvcHlUZXh0OiBcIkNvcGllZCFcIiB9KTtcclxuICB9XHJcblxyXG4gIGhhbmRsZVBsYXkgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25QbGF5JylcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiB0cnVlIH0pXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgYnV0dG9uVmlzaWJsZTogJ25vbmUnIH0pXHJcbiAgfVxyXG5cclxuICBoYW5kbGVQYXVzZSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblBhdXNlJylcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiBmYWxzZSB9KVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGJ1dHRvblZpc2libGU6ICdibG9jaycgfSlcclxuICB9XHJcblxyXG4gIGhhbmRsZVByb2dyZXNzID0gc3RhdGUgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUHJvZ3Jlc3MnLCBzdGF0ZSlcclxuICAgIC8vIFdlIG9ubHkgd2FudCB0byB1cGRhdGUgdGltZSBzbGlkZXIgaWYgd2UgYXJlIG5vdCBjdXJyZW50bHkgc2Vla2luZ1xyXG4gICAgaWYgKCF0aGlzLnN0YXRlLnNlZWtpbmcpIHtcclxuICAgICAgdGhpcy5zZXRTdGF0ZShzdGF0ZSlcclxuICAgIH1cclxuICB9XHJcbiAgaGFuZGxlUGxheVBhdXNlID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2codGhpcy5zdGF0ZS5wbGF5aW5nKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6ICF0aGlzLnN0YXRlLnBsYXlpbmcgfSlcclxuICB9XHJcblxyXG5cclxuICByZW5kZXIoKSB7XHJcbiAgICBpZiAodGhpcy5wcm9wcy52aWRlb1VybCA9PSB1bmRlZmluZWQgfHwgdGhpcy5wcm9wcy52aWRlb1VybCA9PSBudWxsIHx8IHRoaXMucHJvcHMudmlkZW9VcmwgPT0gJycpIHJldHVybiA8RXJyb3Igc3RhdHVzQ29kZT1cIjQwNFwiIC8+O1xyXG4gICAgY29uc3QgaGFzaHRhZ3MgPSB0aGlzLnByb3BzLmRlc2NyaXB0aW9uLm1hdGNoKC8jXFx3Ky9nKSB8fCBbXTtcclxuICAgIGNvbnN0IGN1cnJlbnRVcmwgPSBwcm9jZXNzLmVudi5ob3N0bmFtZSArIHRoaXMucHJvcHMuYXNQYXRoO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwYXRoXCIsY3VycmVudFVybCk7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8TGF5b3V0IHRpdGxlPVwiR2VudWluXCIgY29udGVudD17dGhpcy5wcm9wcy52aWRlb1RodW1ibmFpbH0gZGVzY3JpcHRpb249e3RoaXMucHJvcHMuZGVzY3JpcHRpb259IGN1cnJlbnRVcmw9e2N1cnJlbnRVcmx9IGtleXdvcmQ9J2dlbnVpbmUnPlxyXG4gICAgICAgIDxDYXJkIHN0eWxlPXt7IHdpZHRoOiAnNTByZW0nLCBoZWlnaHQ6ICc5OSUnLCBib3JkZXJSYWRpdXM6ICcxMHB4JyB9fT5cclxuICAgICAgICAgIDxDYXJkLkJvZHkgPlxyXG4gICAgICAgICAgICA8Q29udGFpbmVyIGZsdWlkPVwibWRcIj5cclxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImQtYmxvY2tcIj5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezZ9IGNsYXNzTmFtZT1cInBhZGRpbmctMCB3LTEwMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc0JScsIGxlZnQ6ICcxNiUnLCB6SW5kZXg6ICcxJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyMHB0J1xyXG4gICAgICAgICAgICAgICAgICB9fT57dGhpcy5zdGF0ZS5wbGF5ZWRTZWNvbmRzLnRvRml4ZWQoMCl9IFNlYzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBpY29uPXt0aGlzLnN0YXRlLnBsYXlpbmcgPyBmYVBhdXNlIDogZmFQbGF5fSBjbGFzc05hbWU9XCJwbGF5YnRuXCIgb25DbGljaz17dGhpcy5oYW5kbGVQbGF5UGF1c2V9IHN0eWxlPXt7IHdpZHRoOiAnMTQlJywgY3Vyc29yOiAncG9pbnRlcicsIHJpZ2h0OiAnNDQlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzM5JScsIGRpc3BsYXk6IHRoaXMuc3RhdGUuYnV0dG9uVmlzaWJsZSB9fSAvPlxyXG5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkLW5vbmVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvdHRvbTogJzE2cHgnLCBtYXJnaW5Ub3A6ICczMHB4Jyx3aWR0aDogJzUwJSd9fT5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBjbGFzc05hbWU9XCJjb21tZW50SWNvblwiIGljb249e2ZhQ29tbWVudERvdHN9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc3OCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTQlJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJjb21tZW50eHRcIiBzdHlsZT17eyBsaW5lSGVpZ2h0OiAnMjhweCcsIHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc3MiUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTMlJyxmb250U2l6ZTogJzE2cHQnIH19Pnt0aGlzLnByb3BzLm5vT2ZDb252ZXJzYXRpb259IFxyXG4gICAgICAgICAgICAgICAgICA8c3ViIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZScsIGZvbnRTaXplOiAnMTJwdCcsIGJvdHRvbTogJzZweCd9fT5yZXBsaWVzPC9zdWI+PC9zcGFuPiBcclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm90dG9tOiAnMTZweCcsIG1hcmdpblRvcDogJzMwcHgnLHdpZHRoOiAnNTAlJ319PlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGNsYXNzTmFtZT1cImV5ZUljb25cIiBpY29uPXtmYUV5ZX0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzUxJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInZpZXd0eHRcIiBzdHlsZT17eyBsaW5lSGVpZ2h0OiAnMjhweCcsIHdpZHRoOiAnOSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc0MCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTMlJyxmb250U2l6ZTogJzE2cHQnfX0+e3RoaXMucHJvcHMubm9PZlZpZXdzfVxyXG4gICAgICAgICAgICAgICAgICA8c3ViIHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZScsIGZvbnRTaXplOiAnMTJwdCcsIGJvdHRvbTogJzZweCcsIGxlZnQ6ICcycHgnIH19PnZpZXdzPC9zdWI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxSZWFjdFBsYXllclxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ncmVhY3QtcGxheWVyIGZpeGVkLWJvdHRvbSdcclxuICAgICAgICAgICAgICAgICAgICB1cmw9e3RoaXMucHJvcHMudmlkZW9Vcmx9XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWluZz17dGhpcy5zdGF0ZS5wbGF5aW5nfVxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPSczNTBweCdcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9JzYyMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICctMyUnLCBib3JkZXJSYWRpdXM6ICcyMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHM9e2ZhbHNlfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpZ2h0PXt0cnVlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUGxheVBhdXNlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUGxheT17dGhpcy5oYW5kbGVQbGF5fVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUGF1c2U9e3RoaXMuaGFuZGxlUGF1c2V9XHJcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9ncmVzcz17dGhpcy5oYW5kbGVQcm9ncmVzc31cclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvQ29sPlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17Nn0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZC1ibG9jayBjb250ZW50XCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzI2LjlwdCcsIG1hcmdpblRvcDogJzE1cHgnLG1pbkhlaWdodDogJzM4MnB4JyxvdmVyZmxvdzogJ2F1dG8nfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEhpZ2hsaWdodGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRTdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjYmZlNGYzJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0Q2xhc3NOYW1lPVwibWF0Y2hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgc2VhcmNoV29yZHM9e2hhc2h0YWdzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgdGV4dFRvSGlnaGxpZ2h0PXt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufVxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImQtbm9uZVwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcGxpbmtcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMTMuOXB0JywgbWFyZ2luVG9wOiAnMzQlJyB9fT4gICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGE+R2V0IHRoZSBBcHA8L2E+XHJcbiAgICAgICAgICAgICAgICAgIDwvTGluaz4gdG8gcmVwbHkgYW5kIG1ha2UgZ2VudWluIGNvbm5lY3Rpb248L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzb2NpYWxsaW5rXCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzEzLjlwdCcsIG1hcmdpblRvcDogJzMlJywgZGlyZWN0aW9uOiAncnRsJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJ3aGF0c2FwcEljb25cIj48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhV2hhdHNhcHB9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cImluc3RhSWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFJbnN0YWdyYW19IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJ0d2l0dGVySWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFUd2l0dGVyfSBzdHlsZT17eyB3aWR0aDogJzYlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiZmFjZWJvb2tJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUZhY2Vib29rRn0gc3R5bGU9e3sgd2lkdGg6ICc0JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWVkaWEtbGluayBwYWRkaW5nLTBcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcyOXB0JywgYm9yZGVyOiAnMXB4ICMwMDk0RDAgc29saWQnLCBib3JkZXJSYWRpdXM6ICc5cHgnLCBwYWRkaW5nOiAnNHB4JywgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidXJsdHh0XCIgc3R5bGU9e3sgZm9udFNpemU6ICcxNXB0JywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250V2VpZ2h0OiAnYm9sZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgbWFyZ2luVG9wOiAnLTEwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMubGlua31cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNvcHl0eHRcIiBzdHlsZT17eyBjb2xvcjogJyNGRjAwMDAnLCBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1Cb2xkJywgdGV4dEFsaWduOiAncmlnaHQnLCBmb250U2l6ZTogJzE1cHQnLCBjdXJzb3I6ICdwb2ludGVyJywgJ2Rpc3BsYXknOiAnaW5saW5lLWJsb2NrJywgJ2Zsb2F0JzogJ3JpZ2h0JywgJ21hcmdpblRvcCc6ICctNHB4JyB9fSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNvcHl9PlxyXG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuY29weVRleHR9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgICA8Um93ICBjbGFzc05hbWU9XCJkLW5vbmVcIj5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezEyfT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2xpbmtQcmV2aWV3JyBzdHlsZT17eyBtYXJnaW5Ub3A6ICc3cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiA8Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhVGltZXN9IHN0eWxlPXt7IHdpZHRoOiAnMSUnLCBoZWlnaHQ6ICc2JScsIHpJbmRleDogJzk5OTk5OTk5Jyxwb3NpdGlvbjogJ2ZpeGVkJyxyaWdodDogJzEzJScgfX0gLz4gKi99XHJcbiAgICAgICAgICAgICAgICAgICAgPE1pY3JvbGluayB1cmw9e3RoaXMucHJvcHMubGlua30gc3R5bGU9e3sgbWF4V2lkdGg6ICc3ODNweCcsIGhlaWdodDogJzEwMHB4JywgYmFja2dyb3VuZENvbG9yOiAnbGlnaHRncmV5JyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvQ29sPlxyXG4gICAgICAgICAgICAgIDwvUm93PlxyXG4gICAgICAgICAgICA8L0NvbnRhaW5lcj5cclxuICAgICAgICAgIDwvQ2FyZC5Cb2R5PlxyXG4gICAgICAgIDwvQ2FyZD5cclxuICAgICAgPC9MYXlvdXQgPlxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBsYXllcjsiXSwic291cmNlUm9vdCI6IiJ9