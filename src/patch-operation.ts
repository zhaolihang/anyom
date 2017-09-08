
import { VPatch, VPatchType, RNode } from "./vnode";
import { applyProperties } from "./apply-properties";

export function patchOp(vpatch: VPatch, xomNode: RNode, renderOptions) {
    let type = vpatch.type
    let vNode = vpatch.vNode
    let patch = vpatch.patch

    switch (type) {
        case VPatchType.REMOVE:
            return removeNode(xomNode, vNode)
        case VPatchType.INSERT:
            return insertNode(xomNode, patch, renderOptions)
        case VPatchType.VNODE:
            return vNodePatch(xomNode, vNode, patch, renderOptions)
        case VPatchType.ORDER:
            reorderChildren(xomNode, patch)
            return xomNode
        case VPatchType.PROPS:
            applyProperties(xomNode, patch, vNode.properties)
            return xomNode
        default:
            return xomNode
    }
}

function removeNode(xomNode: RNode, vNode) {
    let parentNode = xomNode.parentNode

    if (parentNode) {
        parentNode.removeChild(xomNode)
    }

    return null
}

function insertNode(parentNode: RNode, vNode, renderOptions) {
    let newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function vNodePatch(xomNode: RNode, leftVNode, vNode, renderOptions) {
    let parentNode = xomNode.parentNode
    let newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== xomNode) {
        parentNode.replaceChild(newNode, xomNode)
    }

    return newNode
}


function reorderChildren(xomNode: RNode, moves) {
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
        // this is the weirdest bug i've ever seen in webkit
        xomNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}
