import { nodeProxyIndex } from "./node-proxy-index";
import { patchOp } from "./patch-operation";
import { render } from "./create-element";
import { IDiffMap } from "./diff";
import { NodeProxy } from "./element";
import { Component } from "./component";


export function patch(nodeProxy: NodeProxy, patches: IDiffMap, context?: Component): NodeProxy {
    let resultNode = patchRecursive(nodeProxy, patches, context);

    if (nodeProxy !== resultNode) {
        let parentNode = nodeProxy.parentNode;
        if (parentNode) {
            parentNode.replaceChild(resultNode, nodeProxy);
        }
    }

    return resultNode;
}

function patchRecursive(nodeProxy: NodeProxy, patches: IDiffMap, context?: Component) {
    let indices = patchIndices(patches);

    if (indices.length === 0) {
        return nodeProxy;
    }

    let index = nodeProxyIndex(nodeProxy, patches.a, indices);

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i];
        nodeProxy = applyPatch(nodeProxy, index[nodeIndex], patches[nodeIndex], context);
    }

    return nodeProxy;
}

function applyPatch(rootNodeProxy: NodeProxy, childNodeProxy: NodeProxy, patchList, context?: Component) {
    if (!childNodeProxy) {
        return rootNodeProxy;
    }

    let newNodeProxy;

    if (Array.isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            newNodeProxy = patchOp(patchList[i], childNodeProxy, context);

            if (childNodeProxy === rootNodeProxy) {
                rootNodeProxy = newNodeProxy;
            }
        }
    } else {
        newNodeProxy = patchOp(patchList, childNodeProxy, context);

        if (childNodeProxy === rootNodeProxy) {
            rootNodeProxy = newNodeProxy;
        }
    }

    return rootNodeProxy;
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
