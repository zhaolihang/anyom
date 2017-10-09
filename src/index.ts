import { h, VNode } from "./vnode";
import { Component } from "./component";
import { createElement, render } from "./create-element";
import { diff, Patch } from "./diff";
import { patch } from "./patch";
import { setCommand, getCommand } from "./commands";
import { nextTick } from "./scheduler";
import { NodeProxy } from "./node-proxy";
import { TagName, PropsType, VNodeType, cloneVNode } from "./vnode";

export {
    h,
    createElement,
    render,
    diff,
    patch,
    Component,
    setCommand,
    getCommand,
    nextTick,
    cloneVNode,
}


export default {
    h,
    createElement,
    render,
    diff,
    patch,
    Component,
    setCommand,
    getCommand,
    nextTick,
    cloneVNode,
}; 
