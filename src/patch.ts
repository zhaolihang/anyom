import { xomIndex } from "./xom-index";
import { isArray } from "./utils";
import { patchOp } from "./patch-operation";
import { createElement, render } from "./create-element";
import { IDiffMap } from "./diff";
import { RNodeProxy } from "./element";
import { Component } from "./component";

export const RenderOptions = { patch: patchRecursive, render };
export function patch(rootNode: RNodeProxy, patches: IDiffMap, context?: Component, renderOptions = RenderOptions): RNodeProxy {
    let resultNode = renderOptions.patch(rootNode, patches, context, renderOptions);
    if (rootNode !== resultNode) {
        let parentNode = rootNode.parentNode;
        if (parentNode) {
            parentNode.replaceChild(resultNode, rootNode);
        }
    }
    return resultNode;
}

function patchRecursive(rootNode: RNodeProxy, patches: IDiffMap, context?: Component, renderOptions = RenderOptions) {
    let indices = patchIndices(patches);

    if (indices.length === 0) {
        return rootNode;
    }

    let index = xomIndex(rootNode, patches.a, indices);

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i];
        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], context, renderOptions);
    }

    return rootNode;
}

function applyPatch(rootNode: RNodeProxy, xomNode: RNodeProxy, patchList, context?: Component, renderOptions = RenderOptions) {
    if (!xomNode) {
        return rootNode;
    }

    let newNode;

    if (isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], xomNode, context, renderOptions);

            if (xomNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        newNode = patchOp(patchList, xomNode, context, renderOptions);

        if (xomNode === rootNode) {
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
