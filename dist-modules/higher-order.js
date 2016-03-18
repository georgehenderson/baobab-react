'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.root = root;
exports.branch = branch;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _baobab = require('baobab');

var _baobab2 = _interopRequireDefault(_baobab);

var _helpers = require('./utils/helpers.js');

var _propTypes = require('./utils/prop-types.js');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Baobab-React Higher Order Component
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * ====================================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * ES6 higher order component to enchance one's component.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var makeError = _baobab2.default.helpers.makeError;

/**
 * Root component
 */
function root(Component, tree) {
  var _class, _temp;

  if (!(tree instanceof _baobab2.default)) throw makeError('baobab-react:higher-order.root: given tree is not a Baobab.', { target: tree });

  var componentDisplayName = Component.name || Component.displayName || 'Component';

  var ComposedComponent = (_temp = _class = function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'getChildContext',


      // Handling child context
      value: function getChildContext() {
        return {
          tree: tree
        };
      }

      // Render shim

    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(Component, this.props);
      }
    }]);

    return _class;
  }(_react2.default.Component), _class.displayName = 'Rooted' + componentDisplayName, _class.childContextTypes = {
    tree: _propTypes2.default.baobab
  }, _temp);

  return ComposedComponent;
}

/**
 * Branch component
 */
function branch(Component) {
  var _class2, _temp2;

  var mapping = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var componentDisplayName = Component.name || Component.displayName || 'Component';

  var ComposedComponent = (_temp2 = _class2 = function (_React$Component2) {
    _inherits(_class2, _React$Component2);

    _createClass(_class2, [{
      key: 'getChildContext',


      // Passing the component's cursors through context
      value: function getChildContext() {
        return this.cursors ? {
          cursors: this.cursors
        } : {};
      }

      // Building initial state

    }]);

    function _class2(props, context) {
      _classCallCheck(this, _class2);

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(_class2).call(this, props, context));

      if (mapping.cursors) {
        var solvedMapping = (0, _helpers.solveMapping)(mapping.cursors, props, context);

        if (!solvedMapping) throw makeError('baobab-react:higher-order.branch: given cursors mapping is invalid (check the "' + displayName + '" component).', { mapping: solvedMapping });

        // Creating the watcher
        _this2.watcher = _this2.context.tree.watch(solvedMapping);
        _this2.cursors = _this2.watcher.getCursors();
        _this2.state = _this2.watcher.get();
      }
      return _this2;
    }

    // On component mount


    _createClass(_class2, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        if (!this.watcher) return;

        var handler = function () {
          if (this.watcher) this.setState(this.watcher.get());
        }.bind(this);

        this.watcher.on('update', handler);
      }

      // Render shim

    }, {
      key: 'render',
      value: function render() {
        var tree = this.context.tree,
            suppl = {};

        // Binding actions if any
        if (mapping.actions) {
          suppl.actions = {};

          Object.keys(mapping.actions).forEach(function (k) {
            suppl.actions[k] = mapping.actions[k].bind(tree, tree);
          });
        }

        return _react2.default.createElement(Component, _extends({}, this.props, suppl, this.state));
      }

      // On component unmount

    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        if (!this.watcher) return;

        // Releasing watcher
        this.watcher.release();
        this.watcher = null;
      }

      // On new props

    }, {
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(props) {
        if (!this.watcher || !mapping.cursors) return;

        var solvedMapping = (0, _helpers.solveMapping)(mapping.cursors, props, this.context);

        if (!solvedMapping) throw makeError('baobab-react:higher-order.branch: given mapping is invalid (check the "' + displayName + '" component).', { mapping: solvedMapping });

        // Refreshing the watcher
        this.watcher.refresh(solvedMapping);
        this.cursors = this.watcher.getCursors();
        this.setState(this.watcher.get());
      }
    }]);

    return _class2;
  }(_react2.default.Component), _class2.displayName = 'Branched' + componentDisplayName, _class2.contextTypes = {
    tree: _propTypes2.default.baobab
  }, _class2.childContextTypes = {
    cursors: _propTypes2.default.cursors
  }, _temp2);

  return ComposedComponent;
}