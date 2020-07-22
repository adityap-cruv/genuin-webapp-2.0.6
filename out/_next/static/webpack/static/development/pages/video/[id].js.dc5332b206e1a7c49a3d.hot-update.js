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
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 74,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
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
          left: '20%',
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
      }), __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
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
          lineNumber: 82,
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
          fontSize: '20pt'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83,
          columnNumber: 19
        }
      }, this.props.noOfConversation, __jsx("sub", {
        style: {
          position: 'absolute',
          fontSize: '12pt',
          bottom: '-4px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 84,
          columnNumber: 19
        }
      }, "replies")), " \xA0", __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        className: "eyeIcon",
        icon: _fortawesome_free_solid_svg_icons__WEBPACK_IMPORTED_MODULE_19__["faEye"],
        style: {
          width: '5%',
          color: 'white',
          right: '50%',
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
        className: "viewtxt",
        style: {
          lineHeight: '28px',
          width: '5%',
          color: 'white',
          right: '44%',
          zIndex: '999999',
          position: 'absolute',
          top: '93%',
          fontSize: '20pt'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 86,
          columnNumber: 19
        }
      }, this.props.noOfViews, __jsx("sub", {
        style: {
          position: 'absolute',
          fontSize: '12pt',
          bottom: '-4px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 87,
          columnNumber: 19
        }
      }, "views")), __jsx(react_player__WEBPACK_IMPORTED_MODULE_11___default.a, {
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
          lineNumber: 88,
          columnNumber: 19
        }
      })), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 105,
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
          lineNumber: 106,
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
          lineNumber: 107,
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
          lineNumber: 114,
          columnNumber: 19
        }
      }, "        ", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 114,
          columnNumber: 136
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 115,
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
          lineNumber: 117,
          columnNumber: 19
        }
      }, __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 118,
          columnNumber: 21
        }
      }, __jsx("a", {
        id: "whatsappIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 119,
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
          lineNumber: 119,
          columnNumber: 44
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 121,
          columnNumber: 33
        }
      }, __jsx("a", {
        id: "instaIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 122,
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
          lineNumber: 122,
          columnNumber: 41
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 124,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "twitterIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 125,
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
          lineNumber: 125,
          columnNumber: 43
        }
      }))), "\xA0\xA0\xA0\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 127,
          columnNumber: 37
        }
      }, __jsx("a", {
        id: "facebookIcon",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 128,
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
          lineNumber: 128,
          columnNumber: 44
        }
      }))), "\xA0\xA0\xA0\xA0\xA0"), __jsx("div", {
        className: "media-link",
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
          lineNumber: 131,
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
          lineNumber: 132,
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
          lineNumber: 135,
          columnNumber: 23
        }
      }, this.state.copyText)))), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Row"], {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 141,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 12,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 142,
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
          lineNumber: 143,
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
          lineNumber: 145,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJsaW5rIiwic2V0U3RhdGUiLCJjb3B5VGV4dCIsImNvbnNvbGUiLCJsb2ciLCJwbGF5aW5nIiwiYnV0dG9uVmlzaWJsZSIsInNlZWtpbmciLCJwbGF5ZWRTZWNvbmRzIiwibG9hZGVkIiwidmlkZW9VcmwiLCJ1bmRlZmluZWQiLCJoYXNodGFncyIsImRlc2NyaXB0aW9uIiwibWF0Y2giLCJjdXJyZW50VXJsIiwicHJvY2VzcyIsImFzUGF0aCIsInZpZGVvVGh1bWJuYWlsIiwid2lkdGgiLCJoZWlnaHQiLCJib3JkZXJSYWRpdXMiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJ6SW5kZXgiLCJmb250RmFtaWx5IiwiZm9udFNpemUiLCJ0b0ZpeGVkIiwiZmFQYXVzZSIsImZhUGxheSIsImhhbmRsZVBsYXlQYXVzZSIsImN1cnNvciIsInJpZ2h0IiwiZGlzcGxheSIsImZhQ29tbWVudERvdHMiLCJjb2xvciIsImxpbmVIZWlnaHQiLCJub09mQ29udmVyc2F0aW9uIiwiYm90dG9tIiwiZmFFeWUiLCJub09mVmlld3MiLCJtYXJnaW5Ub3AiLCJvdmVyZmxvdyIsImhhbmRsZVBsYXkiLCJoYW5kbGVQYXVzZSIsImhhbmRsZVByb2dyZXNzIiwibWluSGVpZ2h0IiwiYmFja2dyb3VuZENvbG9yIiwiZGlyZWN0aW9uIiwiZmFXaGF0c2FwcCIsImZhSW5zdGFncmFtIiwiZmFUd2l0dGVyIiwiZmFGYWNlYm9va0YiLCJib3JkZXIiLCJwYWRkaW5nIiwiZm9udFdlaWdodCIsInRleHRBbGlnbiIsImhhbmRsZUNvcHkiLCJtYXhXaWR0aCIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FDQTs7QUFDQTtBQUNBO0FBQ0E7QUFD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VDtBQUFvQlYsb0JBQVUsRUFBRSxpQkFBaEM7QUFBbUQrQixtQkFBUyxFQUFFLE9BQTlEO0FBQXVFOUIsa0JBQVEsRUFBRSxNQUFqRjtBQUF5RkssZ0JBQU0sRUFBRSxTQUFqRztBQUE0RyxxQkFBVyxjQUF2SDtBQUF1SSxtQkFBUyxPQUFoSjtBQUF5Six1QkFBYTtBQUF0SyxTQUE3QjtBQUE2TSxlQUFPLEVBQUUsS0FBSzBCLFVBQTNOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FDQyxLQUFLNUQsS0FBTCxDQUFXSSxRQURaLENBSkosQ0ExQkYsQ0EvQkYsQ0FERixFQW9FRSxNQUFDLHFEQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FDRSxNQUFDLHFEQUFEO0FBQUssVUFBRSxFQUFFLEVBQVQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUNFO0FBQUssaUJBQVMsRUFBQyxhQUFmO0FBQTZCLGFBQUssRUFBRTtBQUFFd0MsbUJBQVMsRUFBRTtBQUFiLFNBQXBDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FFRSxNQUFDLHlEQUFEO0FBQVcsV0FBRyxFQUFFLEtBQUs3QyxLQUFMLENBQVdHLElBQTNCO0FBQWlDLGFBQUssRUFBRTtBQUFFMkQsa0JBQVEsRUFBRSxPQUFaO0FBQXFCdkMsZ0JBQU0sRUFBRSxPQUE3QjtBQUFzQzRCLHlCQUFlLEVBQUU7QUFBdkQsU0FBeEM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUZGLENBREYsQ0FERixDQXBFRixDQURGLENBREYsQ0FERixDQURGO0FBcUZEOzs7O0VBdklrQlksNENBQUssQ0FBQ0MsUzs7QUEwSVpqRSxxRUFBZiIsImZpbGUiOiJzdGF0aWMvd2VicGFjay9zdGF0aWNcXGRldmVsb3BtZW50XFxwYWdlc1xcdmlkZW9cXFtpZF0uanMuZGM1MzMyYjIwNmUxYTdjNDlhM2QuaG90LXVwZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcclxuLy8gaW1wb3J0IFJlYWN0UGxheWVyIGZyb20gJ3JlYWN0LXBsYXllcidcclxuaW1wb3J0IHsgQ29udGFpbmVyLCBSb3csIENvbCB9IGZyb20gJ3JlYWN0LWdyaWQtc3lzdGVtJztcclxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gJ3JlYWN0LWJvb3RzdHJhcCc7XHJcbmltcG9ydCBMYXlvdXQgZnJvbSBcIi4uL2NvbXBvbmVudHMvTGF5b3V0XCI7XHJcbmltcG9ydCBSZWFjdFBsYXllciBmcm9tICdyZWFjdC1wbGF5ZXInO1xyXG5pbXBvcnQgcm91dGVyIGZyb20gJ25leHQvcm91dGVyJztcclxuaW1wb3J0IGNvcHkgZnJvbSAnY29weS10by1jbGlwYm9hcmQnO1xyXG5pbXBvcnQgSGlnaGxpZ2h0ZXIgZnJvbSBcInJlYWN0LWhpZ2hsaWdodC13b3Jkc1wiO1xyXG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnO1xyXG5pbXBvcnQgTWljcm9saW5rIGZyb20gJ0BtaWNyb2xpbmsvcmVhY3QnO1xyXG5pbXBvcnQgeyBGb250QXdlc29tZUljb24gfSBmcm9tIFwiQGZvcnRhd2Vzb21lL3JlYWN0LWZvbnRhd2Vzb21lXCI7XHJcbmltcG9ydCB7IGxpYnJhcnkgfSBmcm9tICdAZm9ydGF3ZXNvbWUvZm9udGF3ZXNvbWUtc3ZnLWNvcmUnXHJcbmltcG9ydCB7IGZhVGltZXMsIGZhUGxheSwgZmFQYXVzZSwgZmFDb21tZW50RG90cywgZmFFeWUsIGZhRXllRHJvcHBlciB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnNcIjtcclxuaW1wb3J0IHsgZmFGYWNlYm9va0YsIGZhSW5zdGFncmFtLCBmYVdoYXRzYXBwLCBmYVR3aXR0ZXIgfSBmcm9tIFwiQGZvcnRhd2Vzb21lL2ZyZWUtYnJhbmRzLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgRXJyb3IgZnJvbSAnbmV4dC9lcnJvcic7XHJcbmltcG9ydCBjdXN0b20gZnJvbSAnLi9jdXN0b20uc2Nzcyc7XHJcblxyXG5jbGFzcyBQbGF5ZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcyk7XHJcbiAgICB0aGlzLnN0YXRlID0ge1xyXG4gICAgICBjb3B5VGV4dDogJ2NvcHknLFxyXG4gICAgICBwbGF5ZWRTZWNvbmRzOiAwLFxyXG4gICAgICBsb2FkZWQ6IDAsXHJcbiAgICAgIHBsYXlpbmc6IGZhbHNlLFxyXG4gICAgICBidXR0b25WaXNpYmxlOiAnYmxvY2snXHJcbiAgICB9O1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGdsb2JhbC53aW5kb3cgPSB7fVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlQ29weSA9IHN0YXRlID0+IHtcclxuICAgIGNvcHkodGhpcy5wcm9wcy5saW5rKTtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5VGV4dDogXCJDb3BpZWQhXCIgfSk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVQbGF5ID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUGxheScpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogdHJ1ZSB9KVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGJ1dHRvblZpc2libGU6ICdub25lJyB9KVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlUGF1c2UgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25QYXVzZScpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogZmFsc2UgfSlcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBidXR0b25WaXNpYmxlOiAnYmxvY2snIH0pXHJcbiAgfVxyXG5cclxuICBoYW5kbGVQcm9ncmVzcyA9IHN0YXRlID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblByb2dyZXNzJywgc3RhdGUpXHJcbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gdXBkYXRlIHRpbWUgc2xpZGVyIGlmIHdlIGFyZSBub3QgY3VycmVudGx5IHNlZWtpbmdcclxuICAgIGlmICghdGhpcy5zdGF0ZS5zZWVraW5nKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpXHJcbiAgICB9XHJcbiAgfVxyXG4gIGhhbmRsZVBsYXlQYXVzZSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUucGxheWluZylcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiAhdGhpcy5zdGF0ZS5wbGF5aW5nIH0pXHJcbiAgfVxyXG5cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYgKHRoaXMucHJvcHMudmlkZW9VcmwgPT0gdW5kZWZpbmVkIHx8IHRoaXMucHJvcHMudmlkZW9VcmwgPT0gbnVsbCB8fCB0aGlzLnByb3BzLnZpZGVvVXJsID09ICcnKSByZXR1cm4gPEVycm9yIHN0YXR1c0NvZGU9XCI0MDRcIiAvPjtcclxuICAgIGNvbnN0IGhhc2h0YWdzID0gdGhpcy5wcm9wcy5kZXNjcmlwdGlvbi5tYXRjaCgvI1xcdysvZykgfHwgW107XHJcbiAgICBjb25zdCBjdXJyZW50VXJsID0gcHJvY2Vzcy5lbnYuaG9zdG5hbWUgKyB0aGlzLnByb3BzLmFzUGF0aDtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicGF0aFwiLGN1cnJlbnRVcmwpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPExheW91dCB0aXRsZT1cIkdlbnVpblwiIGNvbnRlbnQ9e3RoaXMucHJvcHMudmlkZW9UaHVtYm5haWx9IGRlc2NyaXB0aW9uPXt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufSBjdXJyZW50VXJsPXtjdXJyZW50VXJsfSBrZXl3b3JkPSdnZW51aW5lJz5cclxuICAgICAgICA8Q2FyZCBzdHlsZT17eyB3aWR0aDogJzUwcmVtJywgaGVpZ2h0OiAnOTklJywgYm9yZGVyUmFkaXVzOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICA8Q2FyZC5Cb2R5ID5cclxuICAgICAgICAgICAgPENvbnRhaW5lciBmbHVpZD1cIm1kXCI+XHJcbiAgICAgICAgICAgICAgPFJvdz5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezZ9PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc0JScsIGxlZnQ6ICcyMCUnLCB6SW5kZXg6ICcxJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyMHB0J1xyXG4gICAgICAgICAgICAgICAgICB9fT57dGhpcy5zdGF0ZS5wbGF5ZWRTZWNvbmRzLnRvRml4ZWQoMCl9IFNlYzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBpY29uPXt0aGlzLnN0YXRlLnBsYXlpbmcgPyBmYVBhdXNlIDogZmFQbGF5fSBjbGFzc05hbWU9XCJwbGF5YnRuXCIgb25DbGljaz17dGhpcy5oYW5kbGVQbGF5UGF1c2V9IHN0eWxlPXt7IHdpZHRoOiAnMTQlJywgY3Vyc29yOiAncG9pbnRlcicsIHJpZ2h0OiAnNDQlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzM5JScsIGRpc3BsYXk6IHRoaXMuc3RhdGUuYnV0dG9uVmlzaWJsZSB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGNsYXNzTmFtZT1cImNvbW1lbnRJY29uXCIgaWNvbj17ZmFDb21tZW50RG90c30gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzc4JScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNvbW1lbnR4dFwiIHN0eWxlPXt7IGxpbmVIZWlnaHQ6ICcyOHB4Jywgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzcyJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5MyUnLGZvbnRTaXplOiAnMjBwdCcgfX0+e3RoaXMucHJvcHMubm9PZkNvbnZlcnNhdGlvbn0gXHJcbiAgICAgICAgICAgICAgICAgIDxzdWIgc3R5bGU9e3twb3NpdGlvbjogJ2Fic29sdXRlJywgZm9udFNpemU6ICcxMnB0JywgYm90dG9tOiAnLTRweCd9fT5yZXBsaWVzPC9zdWI+PC9zcGFuPiAmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBjbGFzc05hbWU9XCJleWVJY29uXCIgaWNvbj17ZmFFeWV9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc1MCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTQlJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ2aWV3dHh0XCIgc3R5bGU9e3sgbGluZUhlaWdodDogJzI4cHgnLCB3aWR0aDogJzUlJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNDQlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzkzJScsZm9udFNpemU6ICcyMHB0J319Pnt0aGlzLnByb3BzLm5vT2ZWaWV3c31cclxuICAgICAgICAgICAgICAgICAgPHN1YiBzdHlsZT17e3Bvc2l0aW9uOiAnYWJzb2x1dGUnLCBmb250U2l6ZTogJzEycHQnLCBib3R0b206ICctNHB4J319PnZpZXdzPC9zdWI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8UmVhY3RQbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J3JlYWN0LXBsYXllciBmaXhlZC1ib3R0b20nXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsPXt0aGlzLnByb3BzLnZpZGVvVXJsfVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXlpbmc9e3RoaXMuc3RhdGUucGxheWluZ31cclxuICAgICAgICAgICAgICAgICAgICB3aWR0aD0nMzUwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PSc2MjBweCdcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnLTMlJywgYm9yZGVyUmFkaXVzOiAnMjJweCcsIG92ZXJmbG93OiAnaGlkZGVuJywgY3Vyc29yOiAncG9pbnRlcidcclxuICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xzPXtmYWxzZX1cclxuICAgICAgICAgICAgICAgICAgICAvLyBsaWdodD17dHJ1ZX1cclxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVBsYXlQYXVzZX1cclxuICAgICAgICAgICAgICAgICAgICBvblBsYXk9e3RoaXMuaGFuZGxlUGxheX1cclxuICAgICAgICAgICAgICAgICAgICBvblBhdXNlPXt0aGlzLmhhbmRsZVBhdXNlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUHJvZ3Jlc3M9e3RoaXMuaGFuZGxlUHJvZ3Jlc3N9XHJcbiAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezZ9PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRlbnRcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMjYuOXB0JywgbWFyZ2luVG9wOiAnMTVweCcsbWluSGVpZ2h0OiAnMzgycHgnLG92ZXJmbG93OiAnYXV0byd9fT5cclxuICAgICAgICAgICAgICAgICAgICA8SGlnaGxpZ2h0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodFN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNiZmU0ZjMnIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRDbGFzc05hbWU9XCJtYXRjaFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hXb3Jkcz17aGFzaHRhZ3N9XHJcbiAgICAgICAgICAgICAgICAgICAgICB0ZXh0VG9IaWdobGlnaHQ9e3RoaXMucHJvcHMuZGVzY3JpcHRpb259XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwbGlua1wiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcxMy45cHQnLCBtYXJnaW5Ub3A6ICczNCUnIH19PiAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YT5HZXQgdGhlIEFwcDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9MaW5rPiB0byByZXBseSBhbmQgbWFrZSBnZW51aW4gY29ubmVjdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNvY2lhbGxpbmtcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMTMuOXB0JywgbWFyZ2luVG9wOiAnMyUnLCBkaXJlY3Rpb246ICdydGwnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cIndoYXRzYXBwSWNvblwiPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFXaGF0c2FwcH0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhIGlkPVwiaW5zdGFJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUluc3RhZ3JhbX0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YSBpZD1cInR3aXR0ZXJJY29uXCI+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYVR3aXR0ZXJ9IHN0eWxlPXt7IHdpZHRoOiAnNiUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGEgaWQ9XCJmYWNlYm9va0ljb25cIj48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhRmFjZWJvb2tGfSBzdHlsZT17eyB3aWR0aDogJzQlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZWRpYS1saW5rXCIgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMjlwdCcsIGJvcmRlcjogJzFweCAjMDA5NEQwIHNvbGlkJywgYm9yZGVyUmFkaXVzOiAnOXB4JywgcGFkZGluZzogJzRweCcsIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInVybHR4dFwiIHN0eWxlPXt7IGZvbnRTaXplOiAnMTVwdCcsIGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFdlaWdodDogJ2JvbGQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIG1hcmdpblRvcDogJy0xMHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmxpbmt9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjb3B5dHh0XCIgc3R5bGU9e3sgY29sb3I6ICcjRkYwMDAwJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtQm9sZCcsIHRleHRBbGlnbjogJ3JpZ2h0JywgZm9udFNpemU6ICcxNXB0JywgY3Vyc29yOiAncG9pbnRlcicsICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaycsICdmbG9hdCc6ICdyaWdodCcsICdtYXJnaW5Ub3AnOiAnLTRweCcgfX0gb25DbGljaz17dGhpcy5oYW5kbGVDb3B5fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvcHlUZXh0fVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgICA8Um93PlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17MTJ9PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbGlua1ByZXZpZXcnIHN0eWxlPXt7IG1hcmdpblRvcDogJzdweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgey8qIDxGb250QXdlc29tZUljb24gaWNvbj17ZmFUaW1lc30gc3R5bGU9e3sgd2lkdGg6ICcxJScsIGhlaWdodDogJzYlJywgekluZGV4OiAnOTk5OTk5OTknLHBvc2l0aW9uOiAnZml4ZWQnLHJpZ2h0OiAnMTMlJyB9fSAvPiAqL31cclxuICAgICAgICAgICAgICAgICAgICA8TWljcm9saW5rIHVybD17dGhpcy5wcm9wcy5saW5rfSBzdHlsZT17eyBtYXhXaWR0aDogJzc4M3B4JywgaGVpZ2h0OiAnMTAwcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICdsaWdodGdyZXknIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9Db2w+XHJcbiAgICAgICAgICAgICAgPC9Sb3c+XHJcbiAgICAgICAgICAgIDwvQ29udGFpbmVyPlxyXG4gICAgICAgICAgPC9DYXJkLkJvZHk+XHJcbiAgICAgICAgPC9DYXJkPlxyXG4gICAgICA8L0xheW91dCA+XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheWVyOyJdLCJzb3VyY2VSb290IjoiIn0=