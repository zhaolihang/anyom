import { h } from "../h";
import { createElement } from "../createElement";
import { diff } from "../diff";
import { patch } from "../patch";

let log = console.log;

var childVNode = h("img");
var rootVNode = h("div", childVNode);
var rootNode = createElement(rootVNode)

var inputVNode = h("input");
var otherVNode = h("div", inputVNode);
var otherVNode2 = h("div");

// Update the DOM with the results of a diff
var patches = diff(rootVNode, otherVNode2)
log(patches);
log(rootNode);
let newRootNode = patch(rootNode, patches);
log(newRootNode);
log(newRootNode === rootNode);
