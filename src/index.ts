import { h } from "./h";
import { createElement, render } from "./create-element";
import { diff } from "./diff";
import { patch } from "./patch";
import { setRNodeConstrutor, getRNodeConstrutor } from "./vnode";

export {
    h,
    createElement,
    render,
    diff,
    patch,
    getRNodeConstrutor,
    setRNodeConstrutor,
}
