import { isObject, getPrototype, ascending, indexInRange } from "./utils";
import { VNode, IPropType, ICmdsType, IOnsType } from "./vnode";
import { IDiffMap, VPatch, VPatchType } from "./diff";
import { Component } from "./component";
import { NodeProxy } from "./node-proxy";
import { render } from "./create-element";


export function patch(nodeProxy: NodeProxy, patches: IDiffMap): NodeProxy {
    let resultNode = patchEach(nodeProxy, patches);

    if (nodeProxy !== resultNode) {
        let parentNode = nodeProxy.parentNode;
        if (parentNode) {
            parentNode.replaceChild(resultNode, nodeProxy);
        }
    }

    return resultNode;
}

function patchEach(nodeProxy: NodeProxy, patches: IDiffMap) {
    let indices: number[] = [];
    for (let key in patches) {
        indices.push(Number(key));
    }

    if (indices.length === 0) {
        return nodeProxy;
    }

    let nodeProxyMap = nodeProxyIndex(nodeProxy, patches.vNode, indices);

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i];
        nodeProxy = applyPatch(nodeProxy, nodeProxyMap[nodeIndex], patches[nodeIndex]);
    }

    return nodeProxy;
}

function applyPatch(rootNodeProxy: NodeProxy, childNodeProxy: NodeProxy, patchList) {
    if (!childNodeProxy) {
        return rootNodeProxy;
    }

    let newNodeProxy;

    if (Array.isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            newNodeProxy = patchOp(childNodeProxy, patchList[i]);

            if (childNodeProxy === rootNodeProxy) {
                rootNodeProxy = newNodeProxy;
            }
        }
    } else {
        newNodeProxy = patchOp(childNodeProxy, patchList);

        if (childNodeProxy === rootNodeProxy) {
            rootNodeProxy = newNodeProxy;
        }
    }

    return rootNodeProxy;
}


// Maps a virtual om tree onto a om proxy tree in an efficient manner.
// We don't want to read all of the om nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a om node if we know that it contains a child of
// interest.

let noChild = {};

export function nodeProxyIndex(nodeProxy: NodeProxy, tree: VNode, indices: number[]): { [index: number]: NodeProxy } {
    if (!indices || indices.length === 0) {
        return {};
    } else {
        indices.sort(ascending);
        return recurse(nodeProxy, tree, indices, undefined, 0);
    }
}

function recurse(nodeProxy: NodeProxy, tree, indices: number[], nodes: { [index: number]: NodeProxy }, rootIndex: number) {
    nodes = nodes || {};

    if (nodeProxy) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = nodeProxy;
        }

        let vChildren = tree.children;

        if (vChildren) {

            let childNodes = nodeProxy.childNodes;

            for (let i = 0; i < tree.children.length; i++) {
                rootIndex += 1;

                let vChild = vChildren[i] || noChild;
                let nextIndex = rootIndex + (vChild.count || 0);

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex);
                }

                rootIndex = nextIndex;
            }
        }
    }

    return nodes;
}



////////////
function patchOp(nodeProxy: NodeProxy, vpatch: VPatch) {
    let type = vpatch.type;
    let vNode = vpatch.vNode;
    let patch = vpatch.patch;

    switch (type) {
        case VPatchType.INSERT:
            return insertNode(nodeProxy, patch);
        case VPatchType.REMOVE:
            nodeProxy.parentNode && nodeProxy.parentNode.removeChild(nodeProxy);
            return null;
        case VPatchType.ORDER:
            reorderChildren(nodeProxy, patch);
            return nodeProxy;
        case VPatchType.NATIVEPROPS:
            applyNativeProps(nodeProxy, patch, vNode.props);
            return nodeProxy;
        case VPatchType.COMPONENTPROPS:
            nodeProxy.setComponentProps(patch, vNode.props);
            return nodeProxy;
        case VPatchType.REPLACE:
            return replaceNode(nodeProxy, vNode, patch);
        case VPatchType.REF:
            nodeProxy.setRef(patch);
            return nodeProxy;
        case VPatchType.COMMANDS:
            applyCommands(nodeProxy, patch.patch, vNode.cmds, patch.newCommands);
            return nodeProxy;
        case VPatchType.ONS:
            applyOns(nodeProxy, patch, vNode.ons);
            return nodeProxy;
        default:
            return nodeProxy;
    }
}

function insertNode(parentNodeProxy: NodeProxy, vNode: VNode) {
    let newNode = render(vNode);

    if (parentNodeProxy) {
        parentNodeProxy.appendChild(newNode);
    }

    return parentNodeProxy;
}

function replaceNode(nodeProxy: NodeProxy, leftVNode: VNode, vNode: VNode) {
    let parentNode = nodeProxy.parentNode;
    let newNode = render(vNode);

    if (parentNode && newNode !== nodeProxy) {
        parentNode.replaceChild(newNode, nodeProxy);
    }

    return newNode;
}


function reorderChildren(parentNodeProxy: NodeProxy, moves) {

    let childNodes = parentNodeProxy.childNodes;
    let keyMap: { [key: string]: NodeProxy } = {};
    let node: NodeProxy;
    let remove: { from: number, key?: string };
    let insert: { to: number, key: string };

    let inserts = moves.inserts;
    let insertsLen = inserts.length
    let removes = moves.removes;
    let removesLen = removes.length;

    let reorderKeyMap: { [key: string]: true } = {};
    let insertKeyMap: { [key: string]: true } = {};
    for (let j = 0; j < insertsLen; j++) {
        insertKeyMap[inserts[j].key] = true;
    }

    //
    for (let i = 0; i < removesLen; i++) {
        remove = removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
            insertKeyMap[remove.key] && (reorderKeyMap[remove.key] = true);
        }
        parentNodeProxy.removeChild(node, reorderKeyMap[remove.key]);
    }

    let length = childNodes.length;
    for (let j = 0; j < insertsLen; j++) {
        insert = inserts[j];
        node = keyMap[insert.key];
        parentNodeProxy.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to], reorderKeyMap[insert.key]);
    }

}

//

export function applyNativeProps(proxy: NodeProxy, props: IPropType, previous?: IPropType) {

    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            if (previous) {
                proxy.removeAttrOfNative(propName, previous);
            }
        } else {
            if (isObject(propValue)) {
                patchNativeNodeObject(proxy, props, previous, propName, propValue);
            } else {
                proxy.setAttrOfNative(propName, propValue, previous);
            }
        }
    }

}


function patchNativeNodeObject(proxy: NodeProxy, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        proxy.setAttrOfNative(propName, propValue, previousValue);
        return;
    }

    if (!isObject(proxy.getAttrOfNative(propName))) {
        proxy.setAttrOfNative(propName, {}, undefined);
    }

    proxy.setObjAttrOfNative(propName, propValue, previousValue);
}


export function applyCommands(proxy: NodeProxy, cmdPatch: ICmdsType, previousCmds: ICmdsType, newCommands: ICmdsType) {
    for (let cmdName in cmdPatch) {
        let cmdValue = cmdPatch[cmdName];
        if (cmdValue === undefined) {
            if (previousCmds && (cmdName in previousCmds)) {
                proxy.removeCmd(cmdName, previousCmds[cmdName]);
            }
        } else {
            if (previousCmds && (cmdName in previousCmds)) {
                proxy.updateCmd(cmdName, cmdValue, previousCmds[cmdName])
            } else {
                proxy.addCmd(cmdName, cmdValue);
            }
        }
    }
    proxy.setCmds(newCommands);
}


export function applyOns(proxy: NodeProxy, onPatch: IOnsType, previousOns: IOnsType) {
    for (let onName in onPatch) {
        let cmdValue = onPatch[onName];
        if (cmdValue === undefined) {
            if (previousOns && (onName in previousOns)) {
                proxy.removeOn(onName, previousOns[onName]);
            }
        } else {
            if (previousOns && (onName in previousOns)) {
                proxy.updateOn(onName, cmdValue, previousOns[onName])
            } else {
                proxy.addOn(onName, cmdValue);
            }
        }
    }
}