import { xomIndex } from "./xom-index";
import { isArray } from "./utils";
import { patchOp } from "./patch-operation";
import { createElement, render } from "./create-element";
import { IDiffMap } from "./diff";
import { IRNode } from "./element";

export function patch(rootNode: IRNode, patches: IDiffMap, renderOptions?): IRNode {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !==
        patch ? renderOptions.patch : patchRecursive;
    renderOptions.render = renderOptions.render || render;
    let resultNode = renderOptions.patch(rootNode, patches, renderOptions);
    if (rootNode !== resultNode) {
        if (rootNode.parentNode) {
            let parentNode = rootNode.parentNode;
            parentNode.replaceChild(resultNode, rootNode);
        }
    }
    return resultNode;
}

function patchRecursive(rootNode: IRNode, patches: IDiffMap, renderOptions: { render: (...any) => any }) {
    let indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    let index = xomIndex(rootNode, patches.a, indices)

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i]
        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions);
    }

    return rootNode
}

function applyPatch(rootNode: IRNode, xomNode: IRNode, patchList, renderOptions) {
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
    let indices: number[] = [];

    for (let key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }
    return indices
}
