
import { VPatch, VPatchType, VNode } from "./vnode";
import { applyElementProps, applyRef, applyCommands, applyComponentProps } from "./apply-properties";
import { RealNodeProxy } from "./element";
import { Component } from "./component";
import { render } from "./create-element";

export function patchOp(vpatch: VPatch, node: RealNodeProxy, context?: Component) {
    let type = vpatch.type;
    let vNode = vpatch.vNode;
    let patch = vpatch.patch;

    switch (type) {
        case VPatchType.REMOVE:
            return removeNode(node, vNode);
        case VPatchType.INSERT:
            return insertNode(node, patch, context);
        case VPatchType.REPLACE:
            return vNodePatch(node, vNode, patch, context);
        case VPatchType.ORDER:
            reorderChildren(node, patch);
            return node;
        case VPatchType.ELEMENTPROPS:
            applyElementProps(node, patch, vNode.properties);
            return node;
        case VPatchType.REF:
            applyRef(node, patch, vNode.ref);
            return node;
        case VPatchType.COMMANDS:
            applyCommands(node, patch, vNode.commands);
            return node;
        case VPatchType.COMPONENTPROPS:
            applyComponentProps(node, patch, vNode.properties);
            return node;
        default:
            return node;
    }
}

function removeNode(node: RealNodeProxy, vNode) {
    let parentNode = node.parentNode;

    if (parentNode) {
        parentNode.removeChild(node);
    }

    return null;
}

function insertNode(parentNode: RealNodeProxy, vNode: VNode, context?: Component) {
    let newNode = render(vNode, context);

    if (parentNode) {
        parentNode.appendChild(newNode);
    }

    return parentNode;
}

function vNodePatch(node: RealNodeProxy, leftVNode: VNode, vNode: VNode, context?: Component) {
    let parentNode = node.parentNode;
    let newNode = render(vNode, context);

    if (parentNode && newNode !== node) {
        parentNode.replaceChild(newNode, node);
    }

    return newNode;
}


function reorderChildren(parentNode: RealNodeProxy, moves) {

    let childNodes = parentNode.childNodes;
    let keyMap: { [key: string]: RealNodeProxy } = {};
    let node: RealNodeProxy;
    let remove: { from: number, key?: string };
    let insert: { to: number, key: string };

    let reorderKeyMap: { [key: string]: true } = {};
    let insertKeyMap: { [key: string]: true } = {};
    for (let j = 0; j < moves.inserts.length; j++) {
        let insert = moves.inserts[j];
        insertKeyMap[insert.key] = true;
    }

    //
    for (let i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
            insertKeyMap[remove.key] && (reorderKeyMap[remove.key] = true);
        }
        parentNode.removeChild(node, reorderKeyMap[remove.key]);
    }
    let length = childNodes.length;
    for (let j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        parentNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to], reorderKeyMap[insert.key]);
    }

}
