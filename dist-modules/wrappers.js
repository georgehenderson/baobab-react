'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Branch = exports.Root = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _baobab = require('baobab');

var _baobab2 = _interopRequireDefault(_baobab);

var _propTypes = require('./utils/prop-types.js');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _helpers = require('./utils/helpers.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Baobab-React Wrapper Component
                                                                                                                                                                                                                              * ===============================
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * ES6 wrapper component.
                                                                                                                                                                                                                              */


var makeError = _baobab2.default.helpers.makeError;

/**
 * Helpers
 */
function rootPass(props) {
  var children = props.children;
  var tree = props.tree;

  var otherProps = _objectWithoutProperties(props, ['children', 'tree']);

  return _extends({}, otherProps);
}

function branchPass(props, suppl, state) {
  var actions = props.actions;
  var children = props.children;
  var cursors = props.cursors;

  var otherProps = _objectWithoutProperties(props, ['actions', 'children', 'cursors']);

  return _extends({}, otherProps, suppl, state);
}

function renderChildren(children, props) {
  if (!children) return null;

  if (!Array.isArray(children)) {
    return _react2.default.cloneElement(children, props);
  } else {
    var group = _react2.default.Children.map(children, function (child) {
      return _react2.default.cloneElement(child, props);
    });

    return _react2.default.createElement(
      'span',
      null,
      group
    );
  }
}

/**
 * Root wrapper
 */

var Root = exports.Root = function (_React$Component) {
  _inherits(Root, _React$Component);

  function Root() {
    _classCallCheck(this, Root);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Root).apply(this, arguments));
  }

  _createClass(Root, [{
    key: 'getChildContext',


    // Handling child context
    value: function getChildContext() {
      return {
        tree: this.props.tree
      };
    }

    // Rendering children

  }, {
    key: 'render',
    value: function render() {
      return renderChildren(this.props.children, rootPass(this.props));
    }
  }]);

  return Root;
}(_react2.default.Component);

/**
 * Branch wrapper
 */


Root.propTypes = {
  tree: _propTypes2.default.baobab
};
Root.childContextTypes = {
  tree: _propTypes2.default.baobab
};

var Branch = exports.Branch = function (_React$Component2) {
  _inherits(Branch, _React$Component2);

  _createClass(Branch, [{
    key: 'getChildContext',


    // Passing the component's cursors through context
    value: function getChildContext() {
      return this.cursors ? {
        cursors: this.cursors
      } : {};
    }

    // Building initial state

  }]);

  function Branch(props, context) {
    _classCallCheck(this, Branch);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Branch).call(this, props, context));

    if (props.cursors) {
      var solvedMapping = (0, _helpers.solveMapping)(props.cursors, props, context);

      if (!solvedMapping) throw makeError('baobab-react:wrappers.branch: given mapping is invalid.', { mapping: solvedMapping });

      // Creating the watcher
      _this2.watcher = _this2.context.tree.watch(solvedMapping);
      _this2.cursors = _this2.watcher.getCursors();
      _this2.state = _this2.watcher.get();
    }
    return _this2;
  }

  // On component mount


  _createClass(Branch, [{
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
          actions = this.props.actions,
          suppl = {};

      // Binding actions if any
      if (actions) {
        suppl.actions = {};

        Object.keys(actions).forEach(function (k) {
          suppl.actions[k] = actions[k].bind(tree, tree);
        });
      }

      return renderChildren(this.props.children, branchPass(this.props, suppl, this.state));
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
      if (!this.watcher) return;

      var solvedMapping = (0, _helpers.solveMapping)(props.cursors, props, this.context);

      if (!solvedMapping) throw makeError('baobab-react:wrappers.branch: given mapping is invalid.', { mapping: solvedMapping });

      // Refreshing the watcher
      this.watcher.refresh(solvedMapping);
      this.cursors = this.watcher.getCursors();
      this.setState(this.watcher.get());
    }
  }]);

  return Branch;
}(_react2.default.Component);

Branch.contextTypes = {
  tree: _propTypes2.default.baobab
};
Branch.childContextTypes = {
  cursors: _propTypes2.default.cursors
};