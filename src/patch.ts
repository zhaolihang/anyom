import { realNodeIndex } from "./real-node-index";
import { isArray } from "./utils";
import { patchOp } from "./patch-operation";
import { render } from "./create-element";
import { IDiffMap } from "./diff";
import { RealNodeProxy } from "./element";
import { Component } from "./component";


export function patch(rootNode: RealNodeProxy, patches: IDiffMap, context?: Component): RealNodeProxy {
    let resultNode = patchRecursive(rootNode, patches, context);

    if (rootNode !== resultNode) {
        let parentNode = rootNode.parentNode;
        if (parentNode) {
            parentNode.replaceChild(resultNode, rootNode);
        }
    }

    return resultNode;
}

function patchRecursive(rootNode: RealNodeProxy, patches: IDiffMap, context?: Component) {
    let indices = patchIndices(patches);

    if (indices.length === 0) {
        return rootNode;
    }

    let index = realNodeIndex(rootNode, patches.a, indices);

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i];
        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], context);
    }

    return rootNode;
}

function applyPatch(rootNode: RealNodeProxy, childNode: RealNodeProxy, patchList, context?: Component) {
    if (!childNode) {
        return rootNode;
    }

    let newNode;

    if (isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], childNode, context);

            if (childNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        newNode = patchOp(patchList, childNode, context);

        if (childNode === rootNode) {
            rootNode = newNode;
        }
    }

    return rootNode;
}

function patchIndices(patches) {
    let indices: number[] = [];

    for (let key in patches) {
        if (key !== "a") {
            indices.push(Number(key));
        }
    }
    return indices;
}
