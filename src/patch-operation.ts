
import { VPatch, VPatchType, RNode } from "./vnode";
import { applyProperties } from "./apply-properties";

export function patchOp(vpatch: VPatch, xomNode: RNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

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
    var parentNode = xomNode.parentNode

    if (parentNode) {
        parentNode.removeChild(xomNode)
    }

    return null
}

function insertNode(parentNode: RNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function vNodePatch(xomNode: RNode, leftVNode, vNode, renderOptions) {
    var parentNode = xomNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== xomNode) {
        parentNode.replaceChild(newNode, xomNode)
    }

    return newNode
}


function reorderChildren(xomNode: RNode, moves) {
    var childNodes = xomNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        xomNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        xomNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}
