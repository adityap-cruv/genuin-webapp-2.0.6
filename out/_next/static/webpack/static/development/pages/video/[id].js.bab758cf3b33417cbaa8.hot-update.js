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
        url: this.props.link,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9wYWdlcy9wbGF5ZXIuanMiXSwibmFtZXMiOlsiUGxheWVyIiwicHJvcHMiLCJzdGF0ZSIsImNvcHkiLCJsaW5rIiwic2V0U3RhdGUiLCJjb3B5VGV4dCIsImNvbnNvbGUiLCJsb2ciLCJwbGF5aW5nIiwiYnV0dG9uVmlzaWJsZSIsInNlZWtpbmciLCJwbGF5ZWRTZWNvbmRzIiwibG9hZGVkIiwidmlkZW9VcmwiLCJ1bmRlZmluZWQiLCJoYXNodGFncyIsImRlc2NyaXB0aW9uIiwibWF0Y2giLCJjdXJyZW50VXJsIiwicHJvY2VzcyIsImFzUGF0aCIsInZpZGVvVGh1bWJuYWlsIiwid2lkdGgiLCJoZWlnaHQiLCJib3JkZXJSYWRpdXMiLCJwb3NpdGlvbiIsInRvcCIsImxlZnQiLCJ6SW5kZXgiLCJmb250RmFtaWx5IiwiY29sb3IiLCJmb250U2l6ZSIsInRvRml4ZWQiLCJmYVBhdXNlIiwiZmFQbGF5IiwiaGFuZGxlUGxheVBhdXNlIiwiY3Vyc29yIiwicmlnaHQiLCJkaXNwbGF5IiwiZmFDb21tZW50RG90cyIsIm5vT2ZDb252ZXJzYXRpb24iLCJmYUV5ZSIsIm5vT2ZWaWV3cyIsIm1hcmdpblRvcCIsIm92ZXJmbG93IiwiaGFuZGxlUGxheSIsImhhbmRsZVBhdXNlIiwiaGFuZGxlUHJvZ3Jlc3MiLCJiYWNrZ3JvdW5kQ29sb3IiLCJkaXJlY3Rpb24iLCJmYVdoYXRzYXBwIiwiZmFJbnN0YWdyYW0iLCJmYVR3aXR0ZXIiLCJmYUZhY2Vib29rIiwiYm9yZGVyIiwicGFkZGluZyIsImZvbnRXZWlnaHQiLCJ0ZXh0QWxpZ24iLCJoYW5kbGVDb3B5IiwibWF4V2lkdGgiLCJSZWFjdCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LENBREYsQ0FERjtBQW1GRDs7OztFQXJJa0JxQyw0Q0FBSyxDQUFDQyxTOztBQXdJWjlELHFFQUFmIiwiZmlsZSI6InN0YXRpYy93ZWJwYWNrL3N0YXRpY1xcZGV2ZWxvcG1lbnRcXHBhZ2VzXFx2aWRlb1xcW2lkXS5qcy5iYWI3NThjZjNiMzM0MTdjYmFhOC5ob3QtdXBkYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xyXG4vLyBpbXBvcnQgUmVhY3RQbGF5ZXIgZnJvbSAncmVhY3QtcGxheWVyJ1xyXG5pbXBvcnQgeyBDb250YWluZXIsIFJvdywgQ29sIH0gZnJvbSAncmVhY3QtZ3JpZC1zeXN0ZW0nO1xyXG5pbXBvcnQgeyBDYXJkIH0gZnJvbSAncmVhY3QtYm9vdHN0cmFwJztcclxuaW1wb3J0IExheW91dCBmcm9tIFwiLi4vY29tcG9uZW50cy9MYXlvdXRcIjtcclxuaW1wb3J0IFJlYWN0UGxheWVyIGZyb20gJ3JlYWN0LXBsYXllcic7XHJcbmltcG9ydCByb3V0ZXIgZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG5pbXBvcnQgY29weSBmcm9tICdjb3B5LXRvLWNsaXBib2FyZCc7XHJcbmltcG9ydCBIaWdobGlnaHRlciBmcm9tIFwicmVhY3QtaGlnaGxpZ2h0LXdvcmRzXCI7XHJcbmltcG9ydCBMaW5rIGZyb20gJ25leHQvbGluayc7XHJcbmltcG9ydCBNaWNyb2xpbmsgZnJvbSAnQG1pY3JvbGluay9yZWFjdCc7XHJcbmltcG9ydCB7IEZvbnRBd2Vzb21lSWNvbiB9IGZyb20gXCJAZm9ydGF3ZXNvbWUvcmVhY3QtZm9udGF3ZXNvbWVcIjtcclxuaW1wb3J0IHsgbGlicmFyeSB9IGZyb20gJ0Bmb3J0YXdlc29tZS9mb250YXdlc29tZS1zdmctY29yZSdcclxuaW1wb3J0IHsgZmFUaW1lcywgZmFQbGF5LCBmYVBhdXNlLCBmYUNvbW1lbnREb3RzLCBmYUV5ZSwgZmFFeWVEcm9wcGVyIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9mcmVlLXNvbGlkLXN2Zy1pY29uc1wiO1xyXG5pbXBvcnQgeyBmYUZhY2Vib29rLCBmYUluc3RhZ3JhbSwgZmFXaGF0c2FwcCwgZmFUd2l0dGVyIH0gZnJvbSBcIkBmb3J0YXdlc29tZS9mcmVlLWJyYW5kcy1zdmctaWNvbnNcIjtcclxuaW1wb3J0IEVycm9yIGZyb20gJ25leHQvZXJyb3InO1xyXG5pbXBvcnQgY3VzdG9tIGZyb20gJy4vY3VzdG9tLnNjc3MnO1xyXG5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgY29weVRleHQ6ICdjb3B5JyxcclxuICAgICAgcGxheWVkU2Vjb25kczogMCxcclxuICAgICAgbG9hZGVkOiAwLFxyXG4gICAgICBwbGF5aW5nOiBmYWxzZSxcclxuICAgICAgYnV0dG9uVmlzaWJsZTogJ2Jsb2NrJ1xyXG4gICAgfTtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICBnbG9iYWwud2luZG93ID0ge31cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhhbmRsZUNvcHkgPSBzdGF0ZSA9PiB7XHJcbiAgICBjb3B5KHRoaXMucHJvcHMubGluayk7XHJcbiAgICB0aGlzLnNldFN0YXRlKHsgY29weVRleHQ6IFwiQ29waWVkIVwiIH0pO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlUGxheSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKCdvblBsYXknKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IHRydWUgfSlcclxuICAgIHRoaXMuc2V0U3RhdGUoeyBidXR0b25WaXNpYmxlOiAnbm9uZScgfSlcclxuICB9XHJcblxyXG4gIGhhbmRsZVBhdXNlID0gKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ29uUGF1c2UnKVxyXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXlpbmc6IGZhbHNlIH0pXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgYnV0dG9uVmlzaWJsZTogJ2Jsb2NrJyB9KVxyXG4gIH1cclxuXHJcbiAgaGFuZGxlUHJvZ3Jlc3MgPSBzdGF0ZSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnb25Qcm9ncmVzcycsIHN0YXRlKVxyXG4gICAgLy8gV2Ugb25seSB3YW50IHRvIHVwZGF0ZSB0aW1lIHNsaWRlciBpZiB3ZSBhcmUgbm90IGN1cnJlbnRseSBzZWVraW5nXHJcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2Vla2luZykge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHN0YXRlKVxyXG4gICAgfVxyXG4gIH1cclxuICBoYW5kbGVQbGF5UGF1c2UgPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLnBsYXlpbmcpXHJcbiAgICB0aGlzLnNldFN0YXRlKHsgcGxheWluZzogIXRoaXMuc3RhdGUucGxheWluZyB9KVxyXG4gIH1cclxuXHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIGlmICh0aGlzLnByb3BzLnZpZGVvVXJsID09IHVuZGVmaW5lZCB8fCB0aGlzLnByb3BzLnZpZGVvVXJsID09IG51bGwgfHwgdGhpcy5wcm9wcy52aWRlb1VybCA9PSAnJykgcmV0dXJuIDxFcnJvciBzdGF0dXNDb2RlPVwiNDA0XCIgLz47XHJcbiAgICBjb25zdCBoYXNodGFncyA9IHRoaXMucHJvcHMuZGVzY3JpcHRpb24ubWF0Y2goLyNcXHcrL2cpIHx8IFtdO1xyXG4gICAgY29uc3QgY3VycmVudFVybD1wcm9jZXNzLmVudi5ob3N0bmFtZSt0aGlzLnByb3BzLmFzUGF0aDtcclxuICAgIC8vIGNvbnNvbGUubG9nKFwicGF0aFwiLGN1cnJlbnRVcmwpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgPExheW91dCB0aXRsZT1cIkdlbnVpbmVcIiBjb250ZW50PXt0aGlzLnByb3BzLnZpZGVvVGh1bWJuYWlsfSBkZXNjcmlwdGlvbj17dGhpcy5wcm9wcy5kZXNjcmlwdGlvbn0gY3VycmVudFVybD17Y3VycmVudFVybH0ga2V5d29yZD0nZ2VudWluZSc+XHJcbiAgICAgICAgPENhcmQgc3R5bGU9e3sgd2lkdGg6ICc1MHJlbScsIGhlaWdodDogJzQ1cmVtJywgYm9yZGVyUmFkaXVzOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICA8Q2FyZC5Cb2R5ID5cclxuICAgICAgICAgICAgPENvbnRhaW5lciBmbHVpZD1cIm1kXCI+XHJcbiAgICAgICAgICAgICAgPFJvdz5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezZ9PlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc0JScsIGxlZnQ6ICcyMCUnLCB6SW5kZXg6ICcxJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtRGVtaUJvbGQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcyMHB0J1xyXG4gICAgICAgICAgICAgICAgICB9fT57dGhpcy5zdGF0ZS5wbGF5ZWRTZWNvbmRzLnRvRml4ZWQoMCl9IFNlYzwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPEZvbnRBd2Vzb21lSWNvbiBpY29uPXt0aGlzLnN0YXRlLnBsYXlpbmcgPyBmYVBhdXNlIDogZmFQbGF5fSBvbkNsaWNrPXt0aGlzLmhhbmRsZVBsYXlQYXVzZX0gc3R5bGU9e3sgd2lkdGg6ICcxNCUnLCBjdXJzb3I6ICdwb2ludGVyJywgcmlnaHQ6ICc0NCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnMzklJywgZGlzcGxheTogdGhpcy5zdGF0ZS5idXR0b25WaXNpYmxlIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxGb250QXdlc29tZUljb24gaWNvbj17ZmFDb21tZW50RG90c30gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGNvbG9yOiAnd2hpdGUnLCByaWdodDogJzc4JScsIHpJbmRleDogJzk5OTk5OScsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICc5NCUnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc3MiUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTMlJyB9fT57dGhpcy5wcm9wcy5ub09mQ29udmVyc2F0aW9ufXJlcGxpZXM8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDxGb250QXdlc29tZUljb24gaWNvbj17ZmFFeWV9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBjb2xvcjogJ3doaXRlJywgcmlnaHQ6ICc1MCUnLCB6SW5kZXg6ICc5OTk5OTknLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnOTQlJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyB3aWR0aDogJzUlJywgY29sb3I6ICd3aGl0ZScsIHJpZ2h0OiAnNDQlJywgekluZGV4OiAnOTk5OTk5JywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzkzJScgfX0+e3RoaXMucHJvcHMubm9PZlZpZXdzfXZpZXdzPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICA8UmVhY3RQbGF5ZXJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J3JlYWN0LXBsYXllciBmaXhlZC1ib3R0b20nXHJcbiAgICAgICAgICAgICAgICAgICAgdXJsPXt0aGlzLnByb3BzLnZpZGVvVXJsfVxyXG4gICAgICAgICAgICAgICAgICAgIHBsYXlpbmc9e3RoaXMuc3RhdGUucGxheWluZ31cclxuICAgICAgICAgICAgICAgICAgICB3aWR0aD0nMzUwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PSc1MjhweCdcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnNCUnLCBib3JkZXJSYWRpdXM6ICcyMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbHM9e2ZhbHNlfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxpZ2h0PXt0cnVlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUGxheVBhdXNlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUGxheT17dGhpcy5oYW5kbGVQbGF5fVxyXG4gICAgICAgICAgICAgICAgICAgIG9uUGF1c2U9e3RoaXMuaGFuZGxlUGF1c2V9XHJcbiAgICAgICAgICAgICAgICAgICAgb25Qcm9ncmVzcz17dGhpcy5oYW5kbGVQcm9ncmVzc31cclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgIDwvQ29sPlxyXG4gICAgICAgICAgICAgICAgPENvbCBtZD17Nn0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGVudFwiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcyNi45cHQnLCBtYXJnaW5Ub3A6ICcxNXB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8SGlnaGxpZ2h0ZXJcclxuICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodFN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNiZmU0ZjMnIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBoaWdobGlnaHRDbGFzc05hbWU9XCJtYXRjaFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hXb3Jkcz17aGFzaHRhZ3N9XHJcbiAgICAgICAgICAgICAgICAgICAgICB0ZXh0VG9IaWdobGlnaHQ9e3RoaXMucHJvcHMuZGVzY3JpcHRpb259XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwbGlua1wiIHN0eWxlPXt7IGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFNpemU6ICcxMy45cHQnLCBtYXJnaW5Ub3A6ICc2OSUnIH19PiAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YT5HZXQgdGhlIEFwcDwvYT5cclxuICAgICAgICAgICAgICAgICAgPC9MaW5rPiB0byByZXBseSBhbmQgbWFrZSBnZW51aW4gY29ubmVjdGlvbjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNvY2lhbGxpbmtcIiBzdHlsZT17eyBmb250RmFtaWx5OiAnQXZlbmlyTmV4dC1EZW1pQm9sZCcsIGZvbnRTaXplOiAnMTMuOXB0JywgbWFyZ2luVG9wOiAnMyUnLCBkaXJlY3Rpb246ICdydGwnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YT48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhV2hhdHNhcHB9IHN0eWxlPXt7IHdpZHRoOiAnNSUnLCBoZWlnaHQ6ICc1JScgfX0gLz48L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPiZuYnNwOyZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8YT48Rm9udEF3ZXNvbWVJY29uIGljb249e2ZhSW5zdGFncmFtfSBzdHlsZT17eyB3aWR0aDogJzUlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFUd2l0dGVyfSBzdHlsZT17eyB3aWR0aDogJzUlJywgaGVpZ2h0OiAnNSUnIH19IC8+PC9hPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvTGluaz4mbmJzcDsmbmJzcDsmbmJzcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxhPjxGb250QXdlc29tZUljb24gaWNvbj17ZmFGYWNlYm9va30gc3R5bGU9e3sgd2lkdGg6ICc1JScsIGhlaWdodDogJzUlJyB9fSAvPjwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L0xpbms+Jm5ic3A7Jm5ic3A7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWVkaWEtbGlua1wiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzI5cHQnLCBib3JkZXI6ICcxcHggIzAwOTREMCBzb2xpZCcsIGJvcmRlclJhZGl1czogJzlweCcsIHBhZGRpbmc6ICc0cHgnLCB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ1cmx0eHRcIiBzdHlsZT17eyBmb250U2l6ZTogJzdwdCcsIGZvbnRGYW1pbHk6ICdBdmVuaXJOZXh0LURlbWlCb2xkJywgZm9udFdlaWdodDogJ2JvbGQnLCBjdXJzb3I6ICdkZWZhdWx0JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmxpbmt9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPiZuYnNwOyZuYnNwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjRkYwMDAwJywgZm9udEZhbWlseTogJ0F2ZW5pck5leHQtQm9sZCcsIHRleHRBbGlnbjogJ3JpZ2h0JywgZm9udFNpemU6ICcyM3B0JywgY3Vyc29yOiAncG9pbnRlcicsJ2Rpc3BsYXknOiAnaW5saW5lLWJsb2NrJywnZmxvYXQnOiAncmlnaHQnLCdtYXJnaW5Ub3AnOiAnLTM5cHgnIH19IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ29weX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5jb3B5VGV4dH1cclxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9Db2w+XHJcbiAgICAgICAgICAgICAgPC9Sb3c+XHJcbiAgICAgICAgICAgICAgPFJvdz5cclxuICAgICAgICAgICAgICAgIDxDb2wgbWQ9ezEyfT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J2xpbmtQcmV2aWV3JyBzdHlsZT17eyBtYXJnaW5Ub3A6ICcxOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7LyogPEZvbnRBd2Vzb21lSWNvbiBpY29uPXtmYVRpbWVzfSBzdHlsZT17eyB3aWR0aDogJzElJywgaGVpZ2h0OiAnNiUnLCB6SW5kZXg6ICc5OTk5OTk5OScscG9zaXRpb246ICdmaXhlZCcscmlnaHQ6ICcxMyUnIH19IC8+ICovfVxyXG4gICAgICAgICAgICAgICAgICAgIDxNaWNyb2xpbmsgdXJsPXt0aGlzLnByb3BzLmxpbmt9IHN0eWxlPXt7IG1heFdpZHRoOiAnNzgzcHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICdsaWdodGdyZXknLCBoZWlnaHQ6ICcxNThweCcgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L0NvbD5cclxuICAgICAgICAgICAgICA8L1Jvdz5cclxuICAgICAgICAgICAgPC9Db250YWluZXI+XHJcbiAgICAgICAgICA8L0NhcmQuQm9keT5cclxuICAgICAgICA8L0NhcmQ+XHJcbiAgICAgIDwvTGF5b3V0ID5cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7Il0sInNvdXJjZVJvb3QiOiIifQ==