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







var _jsxFileName = "F:\\genuine\\pages\\player.js";
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
      copy_to_clipboard__WEBPACK_IMPORTED_MODULE_13___default()(_this.props.videoUrl);

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
        title: "Genuine",
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
          height: '45rem',
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
          color: '#FFFFFF',
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
        style: {
          width: '5%',
          color: 'white',
          right: '72%',
          zIndex: '999999',
          position: 'absolute',
          top: '93%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83,
          columnNumber: 19
        }
      }, this.props.noOfConversation, "replies"), __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
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
          lineNumber: 84,
          columnNumber: 19
        }
      }), __jsx("span", {
        style: {
          width: '5%',
          color: 'white',
          right: '44%',
          zIndex: '999999',
          position: 'absolute',
          top: '93%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 85,
          columnNumber: 19
        }
      }, this.props.noOfViews, "views"), __jsx(react_player__WEBPACK_IMPORTED_MODULE_11___default.a, {
        className: "react-player fixed-bottom",
        url: this.props.videoUrl,
        playing: this.state.playing,
        width: "350px",
        height: "528px",
        style: {
          marginTop: '4%',
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
          lineNumber: 86,
          columnNumber: 19
        }
      })), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 6,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 103,
          columnNumber: 17
        }
      }, __jsx("div", {
        className: "content",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '26.9pt',
          marginTop: '15px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 104,
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
          lineNumber: 105,
          columnNumber: 21
        }
      })), __jsx("div", {
        className: "applink",
        style: {
          fontFamily: 'AvenirNext-DemiBold',
          fontSize: '13.9pt',
          marginTop: '69%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 112,
          columnNumber: 19
        }
      }, "        ", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 112,
          columnNumber: 136
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 113,
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
          lineNumber: 115,
          columnNumber: 19
        }
      }, __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 116,
          columnNumber: 21
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 117,
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
          lineNumber: 117,
          columnNumber: 26
        }
      }))), "\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 119,
          columnNumber: 33
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 120,
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
          lineNumber: 120,
          columnNumber: 26
        }
      }))), "\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 122,
          columnNumber: 37
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 123,
          columnNumber: 23
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__["faTwitter"],
        style: {
          width: '5%',
          height: '5%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 123,
          columnNumber: 26
        }
      }))), "\xA0\xA0\xA0", __jsx(next_link__WEBPACK_IMPORTED_MODULE_15___default.a, {
        href: "/",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 125,
          columnNumber: 37
        }
      }, __jsx("a", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 126,
          columnNumber: 23
        }
      }, __jsx(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_17__["FontAwesomeIcon"], {
        icon: _fortawesome_free_brands_svg_icons__WEBPACK_IMPORTED_MODULE_20__["faFacebook"],
        style: {
          width: '5%',
          height: '5%'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 126,
          columnNumber: 26
        }
      }))), "\xA0\xA0"), __jsx("div", {
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
          lineNumber: 129,
          columnNumber: 19
        }
      }, __jsx("span", {
        className: "urltxt",
        style: {
          fontSize: '7pt',
          fontFamily: 'AvenirNext-DemiBold',
          fontWeight: 'bold',
          cursor: 'default'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 130,
          columnNumber: 21
        }
      }, this.props.link), "\xA0\xA0", __jsx("span", {
        style: {
          color: '#FF0000',
          fontFamily: 'AvenirNext-Bold',
          textAlign: 'right',
          fontSize: '23pt',
          cursor: 'pointer',
          'display': 'inline-block',
          'float': 'right',
          'marginTop': '-39px'
        },
        onClick: this.handleCopy,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 133,
          columnNumber: 23
        }
      }, this.state.copyText)))), __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Row"], {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 139,
          columnNumber: 15
        }
      }, __jsx(react_grid_system__WEBPACK_IMPORTED_MODULE_8__["Col"], {
        md: 12,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 140,
          columnNumber: 17
        }
      }, __jsx("div", {
        className: "linkPreview",
        style: {
          marginTop: '18px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 141,
          columnNumber: 19
        }
      }, __jsx(_microlink_react__WEBPACK_IMPORTED_MODULE_16__["default"], {
        url: this.props.videoUrl,
        style: {
          maxWidth: '783px',
          backgroundColor: 'lightgrey',
          height: '158px'
        },
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 143,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJ2aWRlb1VybCIsInNldFN0YXRlIiwiY29weVRleHQiLCJjb25zb2xlIiwibG9nIiwicGxheWluZyIsImJ1dHRvblZpc2libGUiLCJzZWVraW5nIiwicGxheWVkU2Vjb25kcyIsImxvYWRlZCIsInVuZGVmaW5lZCIsImhhc2h0YWdzIiwiZGVzY3JpcHRpb24iLCJtYXRjaCIsImN1cnJlbnRVcmwiLCJwcm9jZXNzIiwiYXNQYXRoIiwidmlkZW9UaHVtYm5haWwiLCJ3aWR0aCIsImhlaWdodCIsImJvcmRlclJhZGl1cyIsInBvc2l0aW9uIiwidG9wIiwibGVmdCIsInpJbmRleCIsImZvbnRGYW1pbHkiLCJjb2xvciIsImZvbnRTaXplIiwidG9GaXhlZCIsImZhUGF1c2UiLCJmYVBsYXkiLCJoYW5kbGVQbGF5UGF1c2UiLCJjdXJzb3IiLCJyaWdodCIsImRpc3BsYXkiLCJmYUNvbW1lbnREb3RzIiwibm9PZkNvbnZlcnNhdGlvbiIsImZhRXllIiwibm9PZlZpZXdzIiwibWFyZ2luVG9wIiwib3ZlcmZsb3ciLCJoYW5kbGVQbGF5IiwiaGFuZGxlUGF1c2UiLCJoYW5kbGVQcm9ncmVzcyIsImJhY2tncm91bmRDb2xvciIsImRpcmVjdGlvbiIsImZhV2hhdHNhcHAiLCJmYUluc3RhZ3JhbSIsImZhVHdpdHRlciIsImZhRmFjZWJvb2siLCJib3JkZXIiLCJwYWRkaW5nIiwiZm9udFdlaWdodCIsImxpbmsiLCJ0ZXh0QWxpZ24iLCJoYW5kbGVDb3B5IiwibWF4V2lkdGgiLCJSZWFjdCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QURGLENBREY7QUFtRkQ7Ozs7RUFySWtCc0MsNENBQUssQ0FBQ0MsUzs7QUF3SVo5RCxxRUFBZiIsImZpbGUiOiJzdGF0aWMvd2VicGFjay9zdGF0aWNcXGRldmVsb3BtZW50XFxwYWdlc1xcdmlkZW9cXFtpZF0uanMuYTkxYWQ2MjJkYzVlM2JiMjY5MzAuaG90LXVwZGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcclxuLy8gaW1wb3J0IFJlYWN0UGxheWVyIGZyb20gJ3JlYWN0LXBsYXllcidcclxuaW1wb3J0IHsgQ29udGFpbmVyLCBSb3csIENvbCB9IGZyb20gJ3JlYWN0LWdyaWQtc3lzdGVtJztcclxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gJ3JlYWN0LWJvb3RzdHJhcCc7XHJcbmltcG9ydCBMYXlvdXQgZnJvbSBcIi4uL2NvbXBvbmVudHMvTGF5b3V0XCI7XHJcbmltcG9ydCBSZWFjdFBsYXllciBmcm9tICdyZWFjdC1wbGF5ZXInO1xyXG5pbXBvcnQgcm91dGVyIGZyb20gJ25leHQvcm91dGVyJztcclxuaW1wb3J0IGNvcHkgZnJvbSAnY29weS10by1jbGlwYm9hcmQnO1xyXG5pbXBvcnQgSGlnaGxpZ2h0ZXIgZnJvbSBcInJlYWN0LWhpZ2hsaWdodC13b3Jkc1wiO1xyXG5pbXBvcnQgTGluayBmcm9tICduZXh0L2xpbmsnO1xyXG5pbXBvcnQgTWljcm9saW5rIGZyb20gJ0BtaWNyb2xpbmsvcmVhY3QnO1xyXG5pbXBvcnQgeyBGb250QXdlc29tZUljb24gfSBmcm9tIFwiQGZvcnRhd2Vzb21lL3JlYWN0LWZvbnRhd2Vzb21lXCI7XHJcbmltcG9ydCB7IGxpYnJhcnkgfSBmcm9tICdAZm9ydGF3ZXNvbWUvZm9udGF3ZXNvbWUtc3ZnLWNvcmUnXHJcbmltcG9ydCB7IGZhVGltZXMsIGZhUGxheSwgZmFQYXVzZSwgZmFDb21tZW50RG90cywgZmFFeWUsIGZhRXllRHJvcHBlciB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnNcIjtcclxuaW1wb3J0IHsgZmFGYWNlYm9vaywgZmFJbnN0YWdyYW0sIGZhV2hhdHNhcHAsIGZhVHdpdHRlciB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvZnJlZS1icmFuZHMtc3ZnLWljb25zXCI7XHJcbmltcG9ydCBFcnJvciBmcm9tICduZXh0L2Vycm9yJztcclxuaW1wb3J0IGN1c3RvbSBmcm9tICcuL2N1c3RvbS5zY3NzJztcclxuXHJcbmNsYXNzIFBsYXllciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzKTtcclxuICAgIHRoaXMuc3RhdGUgPSB7XHJcbiAgICAgIGNvcHlUZXh0OiAnY29weScsXHJcbiAgICAgIHBsYXllZFNlY29uZHM6IDAsXHJcbiAgICAgIGxvYWRlZDogMCxcclxuICAgICAgcGxheWluZzogZmFsc2UsXHJcbiAgICAgIGJ1dHRvblZpc2libGU6ICdibG9jaydcclxuICAgIH07XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZ2xvYmFsLndpbmRvdyA9IHt9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoYW5kbGVDb3B5ID0gc3RhdGUgPT4ge1xyXG4gICAgY29weSh0aGlzLnByb3BzLnZpZGVvVXJsKTtcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBjb3B5VGV4dDogXCJDb3BpZWQhXCIgfSk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVQbGF5ID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUGxheScpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogdHJ1ZSB9KVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGJ1dHRvblZpc2libGU6ICdub25lJyB9KVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlUGF1c2UgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25QYXVzZScpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogZmFsc2UgfSlcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBidXR0b25WaXNpYmxlOiAnYmxvY2snIH0pXHJcbiAgfVxyXG5cclxuICBoYW5kbGVQcm9ncmVzcyA9IHN0YXRlID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblByb2dyZXNzJywgc3RhdGUpXHJcbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gdXBkYXRlIHRpbWUgc2xpZGVyIGlmIHdlIGFyZSBub3QgY3VycmVudGx5IHNlZWtpbmdcclxuICAgIGlmICghdGhpcy5zdGF0ZS5zZWVraW5nKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpXHJcbiAgICB9XHJcbiAgfVxyXG4gIGhhbmRsZVBsYXlQYXVzZSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUucGxheWluZylcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBwbGF5aW5nOiAhdGhpcy5zdGF0ZS5wbGF5aW5nIH0pXHJcbiAgfVxyXG5cclxuXHJcbiAgcmVuZGVyKCkge1xyXG4gICAgaWYgKHRoaXMucHJvcHMudmlkZW9VcmwgPT0gdW5kZWZpbmVkIHx8IHRoaXMucHJvcHMudmlkZW9VcmwgPT0gbnVsbCB8fCB0aGlzLnByb3BzLnZpZGVvVXJsID09ICcnKSByZXR1cm4gPEVycm9yIHN0YXR1c0NvZGU9XCI0MDRcIiAvPjtcclxuICAgIGNvbnN0IGhhc2h0YWdzID0gdGhpcy5wcm9wcy5kZXNjcmlwdGlvbi5tYXRjaCgvI1xcdysvZykgfHwgW107XHJcbiAgICBjb25zdCBjdXJyZW50VXJsPXByb2Nlc3MuZW52Lmhvc3RuYW1lK3RoaXMucHJvcHMuYXNQYXRoO1xyXG4gICAgLy8gY29uc29sZS5sb2coXCJwYXRoXCIsY3VycmVudFVybCk7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8TGF5b3V0IHRpdGxlPVwiR2VudWluZVwiIGNvbnRlbnQ9e3RoaXMucHJvcHMudmlkZW9UaHVtYm5haWx9IGRlc2NyaXB0aW9uPXt0aGlzLnByb3BzLmRlc2NyaXB0aW9ufSBjdXJyZW50VXJsPXtjdXJyZW50VXJsfSBrZXl3b3JkPSdnZW51aW5lJz5cclxuICAgICAgICA8Q2FyZCBzdHlsZT17eyB3aWR0aDogJzUwcmVtJywgaGVpZ2h0OiAnNDVyZW0nLCBib3JkZXJSYWRpdXM6ICcxMHB4JyB9fT5cclxuICAgICAgICAgIDxDYXJkLkJvZHkgPlxyXG4gICAgICAgICAgICA8Q29udGFpbmVyIGZsdWlkPVwibWRcIj5cclxuICAgICAgICAgICAgICA8Um93PlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17Nn0+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzQlJywgbGVmdDogJzIwJScsIHpJbmRleDogJzEnLCBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjRkZGRkZGJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzIwcHQnXHJcbiAgICAgICAgICAgICAgICAgIH19Pnt0aGlzLnN0YXRlLnBsYXllZFNlY29uZHMudG9GaXhlZCgwKX0gU2VjPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8Rm9udEF3ZXNvbWVJY29uIGljb249e3RoaXMuc3RhdGUucGxheWluZyA/IGZhUGF1c2UgOiBmYVBsYXl9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlUGxheVBhdXNlfSBzdHlsZT17eyB3aWR0aDogJzE0JScsIGN1cnNvcjogJ3BvaW50ZXInLCByaWdodDogJzQ0JScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICczOSUnLCBkaXNwbGF5OiB0aGlzLnN0YXRlLmJ1dHRvblZpc2libGUgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUNvbW1lbnREb3RzfSBzdHlsZT17eyB3aWR0aDogJzUlJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNzglJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzk0JScgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzcyJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5MyUnIH19Pnt0aGlzLnByb3BzLm5vT2ZDb252ZXJzYXRpb259cmVwbGllczwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUV5ZX0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzUwJScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc0NCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTMlJyB9fT57dGhpcy5wcm9wcy5ub09mVmlld3N9dmlld3M8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxSZWFjdFBsYXllclxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ncmVhY3QtcGxheWVyIGZpeGVkLWJvdHRvbSdcclxuICAgICAgICAgICAgICAgICAgICB1cmw9e3RoaXMucHJvcHMudmlkZW9Vcmx9XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWluZz17dGhpcy5zdGF0ZS5wbGF5aW5nfVxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPSczNTBweCdcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9JzUyOHB4J1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICc0JScsIGJvcmRlclJhZGl1czogJzIycHgnLCBvdmVyZmxvdzogJ2hpZGRlbicsIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICBjb250cm9scz17ZmFsc2V9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGlnaHQ9e3RydWV9XHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVQbGF5UGF1c2V9XHJcbiAgICAgICAgICAgICAgICAgICAgb25QbGF5PXt0aGlzLmhhbmRsZVBsYXl9XHJcbiAgICAgICAgICAgICAgICAgICAgb25QYXVzZT17dGhpcy5oYW5kbGVQYXVzZX1cclxuICAgICAgICAgICAgICAgICAgICBvblByb2dyZXNzPXt0aGlzLmhhbmRsZVByb2dyZXNzfVxyXG4gICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPC9Db2w+XHJcbiAgICAgICAgICAgICAgICA8Q29sIG1kPXs2fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb250ZW50XCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzI2LjlwdCcsIG1hcmdpblRvcDogJzE1cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxIaWdobGlnaHRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0U3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAnI2JmZTRmMycgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodENsYXNzTmFtZT1cIm1hdGNoXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFdvcmRzPXtoYXNodGFnc31cclxuICAgICAgICAgICAgICAgICAgICAgIHRleHRUb0hpZ2hsaWdodD17dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn1cclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBsaW5rXCIgc3R5bGU9e3sgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250U2l6ZTogJzEzLjlwdCcsIG1hcmdpblRvcDogJzY5JScgfX0+ICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhPkdldCB0aGUgQXBwPC9hPlxyXG4gICAgICAgICAgICAgICAgICA8L0xpbms+IHRvIHJlcGx5IGFuZCBtYWtlIGdlbnVpbiBjb25uZWN0aW9uPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic29jaWFsbGlua1wiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcxMy45cHQnLCBtYXJnaW5Ub3A6ICczJScsIGRpcmVjdGlvbjogJ3J0bCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFXaGF0c2FwcH0gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFJbnN0YWdyYW19IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGE+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYVR3aXR0ZXJ9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGluayBocmVmPVwiL1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGE+PEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYUZhY2Vib29rfSBzdHlsZT17eyB3aWR0aDogJzUlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtZWRpYS1saW5rXCIgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMjlwdCcsIGJvcmRlcjogJzFweCAjMDA5NEQwIHNvbGlkJywgYm9yZGVyUmFkaXVzOiAnOXB4JywgcGFkZGluZzogJzRweCcsIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInVybHR4dFwiIHN0eWxlPXt7IGZvbnRTaXplOiAnN3B0JywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLCBmb250V2VpZ2h0OiAnYm9sZCcsIGN1cnNvcjogJ2RlZmF1bHQnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge3RoaXMucHJvcHMubGlua31cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyNGRjAwMDAnLCBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1Cb2xkJywgdGV4dEFsaWduOiAncmlnaHQnLCBmb250U2l6ZTogJzIzcHQnLCBjdXJzb3I6ICdwb2ludGVyJywnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snLCdmbG9hdCc6ICdyaWdodCcsJ21hcmdpblRvcCc6ICctMzlweCcgfX0gb25DbGljaz17dGhpcy5oYW5kbGVDb3B5fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmNvcHlUZXh0fVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgICA8Um93PlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17MTJ9PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbGlua1ByZXZpZXcnIHN0eWxlPXt7IG1hcmdpblRvcDogJzE4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiA8Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhVGltZXN9IHN0eWxlPXt7IHdpZHRoOiAnMSUnLCBoZWlnaHQ6ICc2JScsIHpJbmRleDogJzk5OTk5OTk5Jyxwb3NpdGlvbjogJ2ZpeGVkJyxyaWdodDogJzEzJScgfX0gLz4gKi99XHJcbiAgICAgICAgICAgICAgICAgICAgPE1pY3JvbGluayB1cmw9e3RoaXMucHJvcHMudmlkZW9Vcmx9IHN0eWxlPXt7IG1heFdpZHRoOiAnNzgzcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICdsaWdodGdyZXknLCBoZWlnaHQ6ICcxNThweCcgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgPC9Db250YWluZXI+XHJcbiAgICAgICAgICA8L0NhcmQuQm9keT5cclxuICAgICAgICA8L0NhcmQ+XHJcbiAgICAgIDwvTGF5b3V0ID5cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7Il0sInNvdXJjZVJvb3QiOiIifQ==