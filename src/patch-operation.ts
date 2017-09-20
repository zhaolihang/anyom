
import { VPatch, VPatchType, VNode } from "./vnode";
import { applyProperties } from "./apply-properties";
import { RealNodeProxy } from "./element";
import { RenderOptions } from "./patch";

export function patchOp(vpatch: VPatch, node: RealNodeProxy, renderOptions = RenderOptions) {
    let type = vpatch.type;
    let vNode = vpatch.vNode;
    let patch = vpatch.patch;

    switch (type) {
        case VPatchType.REMOVE:
            return removeNode(node, vNode);
        case VPatchType.INSERT:
            return insertNode(node, patch, renderOptions);
        case VPatchType.REPLACE:
            return vNodePatch(node, vNode, patch, renderOptions);
        case VPatchType.ORDER:
            reorderChildren(node, patch);
            return node;
        case VPatchType.PROPS:
            applyProperties(node, patch, vNode.properties);
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

function insertNode(parentNode: RealNodeProxy, vNode: VNode, renderOptions = RenderOptions) {
    let newNode = renderOptions.render(vNode);

    if (parentNode) {
        parentNode.appendChild(newNode);
    }

    return parentNode;
}

function vNodePatch(node: RealNodeProxy, leftVNode: VNode, vNode: VNode, renderOptions = RenderOptions) {
    let parentNode = node.parentNode;
    let newNode = renderOptions.render(vNode);

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
    let removeKeyMap: { [key: string]: true } = {};
    for (let i = 0; i < moves.removes.length; i++) {
        let remove = moves.removes[i];
        if (remove.key) {
            removeKeyMap[remove.key] = true;
        }
    }

    for (let j = 0; j < moves.inserts.length; j++) {
        let insert = moves.inserts[j];
        if (removeKeyMap[insert.key]) {
            reorderKeyMap[insert.key] = true;
        }
    }

    //
    for (let i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
        }
        if (reorderKeyMap[remove.key]) {
            parentNode.removeChild(node, true);
        } else {
            parentNode.removeChild(node);
        }
    }

    let length = childNodes.length;
    for (let j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        if (reorderKeyMap[insert.key]) {
            parentNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to],true);
        } else {
            parentNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
        }
        
    }

}
