
import { VPatch, VPatchType, VNode } from "./vnode";
import { applyNativeNodeProps, applyRef, applyCommands, applyComponentProps } from "./apply-properties";
import { NodeProxy } from "./element";
import { Component } from "./component";
import { render } from "./create-element";

export function patchOp(vpatch: VPatch, nodeProxy: NodeProxy, context?: Component) {
    let type = vpatch.type;
    let vNode = vpatch.vNode;
    let patch = vpatch.patch;

    switch (type) {
        case VPatchType.INSERT:
            return insertNode(nodeProxy, patch, context);
        case VPatchType.REMOVE:
            return removeNode(nodeProxy, vNode);
        case VPatchType.ORDER:
            reorderChildren(nodeProxy, patch);
            return nodeProxy;
        case VPatchType.ELEMENTPROPS:
            applyNativeNodeProps(nodeProxy, patch, vNode.props);
            return nodeProxy;
        case VPatchType.COMPONENTPROPS:
            applyComponentProps(nodeProxy, patch, vNode.props);
            return nodeProxy;
        case VPatchType.REPLACE:
            return vNodePatch(nodeProxy, vNode, patch, context);
        case VPatchType.REF:
            applyRef(nodeProxy, patch, vNode.ref);
            return nodeProxy;
        case VPatchType.COMMANDS:
            applyCommands(nodeProxy, patch.patch, vNode.commands, patch.newCommands);
            return nodeProxy;
        default:
            return nodeProxy;
    }
}

function removeNode(nodeProxy: NodeProxy, vNode) {
    let parentNode = nodeProxy.parentNode;

    if (parentNode) {
        parentNode.removeChild(nodeProxy);
    }

    return null;
}

function insertNode(parentNodeProxy: NodeProxy, vNode: VNode, context?: Component) {
    let newNode = render(vNode, context);

    if (parentNodeProxy) {
        parentNodeProxy.appendChild(newNode);
    }

    return parentNodeProxy;
}

function vNodePatch(nodeProxy: NodeProxy, leftVNode: VNode, vNode: VNode, context?: Component) {
    let parentNode = nodeProxy.parentNode;
    let newNode = render(vNode, context);

    if (parentNode && newNode !== nodeProxy) {
        parentNode.replaceChild(newNode, nodeProxy);
    }

    return newNode;
}


function reorderChildren(parentNodeProxy: NodeProxy, moves) {

    let childNodes = parentNodeProxy.childNodes;
    let keyMap: { [key: string]: NodeProxy } = {};
    let node: NodeProxy;
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
        parentNodeProxy.removeChild(node, reorderKeyMap[remove.key]);
    }
    let length = childNodes.length;
    for (let j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        parentNodeProxy.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to], reorderKeyMap[insert.key]);
    }

}
