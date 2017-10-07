import _VNodeFlags from "./vnode-flags";
import { NO_OP, warning } from "./shared";
import {
  getFlagsForElementVnode,
  normalize as internal_normalize
} from "./core/normalization";
import { options } from "./core/options";
import {
  cloneVNode,
  createVNode,
} from "./core/VNodes";
import { isUnitlessNumber as internal_isUnitlessNumber } from "./DOM/constants";
import { linkEvent } from "./DOM/events/linkEvent";
import { patch as internal_patch } from "./DOM/patching";
import {
  componentToDOMNodeMap as internal_DOMNodeMap,
  createRenderer,
  findDOMNode,
  render
} from "./DOM/rendering";
import { EMPTY_OBJ } from "./DOM/utils";

if (process.env.NODE_ENV !== "production") {
  /* tslint:disable-next-line:no-empty */
  const testFunc = function testFn() { };
  if (
    ((testFunc as Function).name || testFunc.toString()).indexOf("testFn") ===
    -1
  ) {
    warning(
      "It looks like you're using a minified copy of the development build " +
      "of Inferno. When deploying Inferno apps to production, make sure to use " +
      "the production build which skips development warnings and is faster. " +
      "See http://infernojs.org for more details."
    );
  }
}

const version = process.env.INFERNO_VERSION;

// we duplicate it so it plays nicely with different module loading systems
export default {
  EMPTY_OBJ, // used to shared common items between Inferno libs
  NO_OP, // used to shared common items between Inferno libs
  cloneVNode, // cloning
  createRenderer,
  createVNode, // core shapes
  findDOMNode,
  getFlagsForElementVnode,
  internal_DOMNodeMap,
  internal_isUnitlessNumber,
  internal_normalize,
  internal_patch,
  linkEvent,
  options,
  render,
  version
};

export {
  EMPTY_OBJ,
  NO_OP,
  cloneVNode,
  createRenderer,
  createVNode,
  findDOMNode,
  getFlagsForElementVnode,
  internal_DOMNodeMap,
  internal_isUnitlessNumber,
  internal_normalize,
  internal_patch,
  linkEvent,
  options,
  render,
  version
};
