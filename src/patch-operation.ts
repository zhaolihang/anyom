
import { VPatch, VPatchType } from "./vnode";
import { applyProperties } from "./apply-properties";
import { RNodeProxy } from "./element";
import { RenderOptions } from "./patch";
import { Component } from "./component";

export function patchOp(vpatch: VPatch, node: RNodeProxy, context?: Component, renderOptions = RenderOptions) {
    let type = vpatch.type;
    let vNode = vpatch.vNode;
    let patch = vpatch.patch;

    switch (type) {
        case VPatchType.REMOVE:
            return removeNode(node, vNode, context);
        case VPatchType.INSERT:
            return insertNode(node, patch, context, renderOptions);
        case VPatchType.REPLACE:
            return vNodePatch(node, vNode, patch, context, renderOptions);
        case VPatchType.ORDER:
            reorderChildren(node, patch, context);
            return node;
        case VPatchType.PROPS:
            applyProperties(node, patch, vNode.properties, context);
            return node;
        default:
            return node;
    }
}

function removeNode(node: RNodeProxy, vNode, context?: Component) {
    let parentNode = node.parentNode;

    if (parentNode) {
        parentNode.removeChild(node, context);
    }

    return null;
}

function insertNode(parentNode: RNodeProxy, vNode, context?: Component, renderOptions = RenderOptions) {
    let newNode = renderOptions.render(vNode, context);

    if (parentNode) {
        parentNode.appendChild(newNode, context);
    }

    return parentNode;
}

function vNodePatch(node: RNodeProxy, leftVNode, vNode, context?: Component, renderOptions = RenderOptions) {
    let parentNode = node.parentNode;
    let newNode = renderOptions.render(vNode, context);

    if (parentNode && newNode !== node) {
        parentNode.replaceChild(newNode, node, context);
    }

    return newNode;
}


function reorderChildren(parentNode: RNodeProxy, moves, context?: Component) {

    let childNodes = parentNode.childNodes;
    let keyMap = {};
    let node;
    let remove;
    let insert;

    for (let i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
        }
        parentNode.removeChild(node, context);
    }

    let length = childNodes.length;
    for (let j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        parentNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to], context);
    }

}
