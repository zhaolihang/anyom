
import { VPatch, VPatchType } from "./vnode";
import { applyProperties } from "./apply-properties";
import { IRNode } from "./element";
import { RenderOptions } from "./patch";
import { Component } from "./component";

export function patchOp(vpatch: VPatch, xomNode: IRNode, context?: Component, renderOptions = RenderOptions) {
    let type = vpatch.type
    let vNode = vpatch.vNode
    let patch = vpatch.patch

    switch (type) {
        case VPatchType.REMOVE:
            return removeNode(xomNode, vNode, context)
        case VPatchType.INSERT:
            return insertNode(xomNode, patch, context, renderOptions)
        case VPatchType.REPLACE:
            return vNodePatch(xomNode, vNode, patch, context, renderOptions)
        case VPatchType.ORDER:
            reorderChildren(xomNode, patch, context)
            return xomNode
        case VPatchType.PROPS:
            applyProperties(xomNode, patch, vNode.properties, context)
            return xomNode
        default:
            return xomNode
    }
}

function removeNode(xomNode: IRNode, vNode, context?: Component) {
    let parentNode = xomNode.parentNode

    if (parentNode) {
        parentNode.removeChild(xomNode)
    }

    return null
}

function insertNode(parentNode: IRNode, vNode, context?: Component, renderOptions = RenderOptions) {
    let newNode = renderOptions.render(vNode)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function vNodePatch(xomNode: IRNode, leftVNode, vNode, context?: Component, renderOptions = RenderOptions) {
    let parentNode = xomNode.parentNode
    let newNode = renderOptions.render(vNode)

    if (parentNode && newNode !== xomNode) {
        parentNode.replaceChild(newNode, xomNode)
    }

    return newNode
}


function reorderChildren(xomNode: IRNode, moves, context?: Component) {
    let childNodes = xomNode.childNodes
    let keyMap = {}
    let node
    let remove
    let insert

    for (let i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        xomNode.removeChild(node)
    }

    let length = childNodes.length
    for (let j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        xomNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}
