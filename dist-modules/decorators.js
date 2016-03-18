'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.root = root;
exports.branch = branch;

var _higherOrder = require('./higher-order.js');

function root(tree) {
  return function (Component) {
    return (0, _higherOrder.root)(Component, tree);
  };
} /**
   * Baobab-React Decorators
   * ========================
   *
   * ES7 decorators sugar for higher order components.
   */


function branch(specs) {
  return function (Component) {
    return (0, _higherOrder.branch)(Component, specs);
  };
}