
import { VPatch, VPatchType, RNode } from "./vnode";
import { applyProperties } from "./apply-properties";

export function patchOp(vpatch: VPatch, domNode: RNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatchType.REMOVE:
            return removeNode(domNode, vNode)
        case VPatchType.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatchType.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatchType.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatchType.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        default:
            return domNode
    }
}

function removeNode(domNode: RNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
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

function vNodePatch(domNode: RNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}


function reorderChildren(domNode: RNode, moves) {
    var childNodes = domNode.childNodes
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
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}
