import _VNodeFlags from "./vnode-flags";
import { NO_OP, warning } from "./shared";
import {
  normalize as internal_normalize
} from "./core/normalization";
import { options } from "./core/options";
import {
  cloneVNode,
  createVNode,
} from "./core/VNodes";
import { isUnitlessNumber as internal_isUnitlessNumber } from "./native/DOM/constants";
import { linkEvent } from "./native/DOM/events/linkEvent";
import { patch as internal_patch } from "./native/DOM/patching";
import {
  componentToDOMNodeMap as internal_DOMNodeMap,
  createRenderer,
  findDOMNode,
  render
} from "./native/DOM/rendering";

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
  NO_OP, // used to shared common items between Inferno libs
  cloneVNode, // cloning
  createRenderer,
  createVNode, // core shapes
  findDOMNode,
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
  NO_OP,
  cloneVNode,
  createRenderer,
  createVNode,
  findDOMNode,
  internal_DOMNodeMap,
  internal_isUnitlessNumber,
  internal_normalize,
  internal_patch,
  linkEvent,
  options,
  render,
  version
};
