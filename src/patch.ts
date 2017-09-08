import { xomIndex } from "./xom-index";
import { isArray } from "./utils";
import { patchOp } from "./patch-operation";
import { createElement, render } from "./create-element";
import { RNode } from "./vnode";

export function patch(rootNode: RNode, patches, renderOptions?) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    let indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    let index = xomIndex(rootNode, patches.a, indices)

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, xomNode, patchList, renderOptions) {
    if (!xomNode) {
        return rootNode
    }

    let newNode

    if (isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], xomNode, renderOptions)

            if (xomNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, xomNode, renderOptions)

        if (xomNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    let indices = []

    for (let key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }
    return indices
}
