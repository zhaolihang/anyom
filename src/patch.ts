import { isObject, getPrototype, ascending, indexInRange } from "./utils";
import { VNode, IPropType, ICommandsType } from "./vnode";
import { IDiffMap, VPatch, VPatchType } from "./diff";
import { Component } from "./component";
import { NodeProxy } from "./node-proxy";
import { render } from "./create-element";


export function patch(nodeProxy: NodeProxy, patches: IDiffMap, context?: Component): NodeProxy {
    let resultNode = patchEach(nodeProxy, patches, context);

    if (nodeProxy !== resultNode) {
        let parentNode = nodeProxy.parentNode;
        if (parentNode) {
            parentNode.replaceChild(resultNode, nodeProxy);
        }
    }

    return resultNode;
}

function patchEach(nodeProxy: NodeProxy, patches: IDiffMap, context?: Component) {
    let indices = patchIndices(patches);

    if (indices.length === 0) {
        return nodeProxy;
    }

    let nodeProxyMap = nodeProxyIndex(nodeProxy, patches.vNode, indices);

    for (let i = 0; i < indices.length; i++) {
        let nodeIndex = indices[i];
        nodeProxy = applyPatch(nodeProxy, nodeProxyMap[nodeIndex], patches[nodeIndex], context);
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

function patchIndices(patches: IDiffMap) {
    let indices: number[] = [];

    for (let key in patches) {
        indices.push(Number(key));
    }
    return indices;
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
export function patchOp(vpatch: VPatch, nodeProxy: NodeProxy, context?: Component) {
    let type = vpatch.type;
    let vNode = vpatch.vNode;
    let patch = vpatch.patch;

    switch (type) {
        case VPatchType.INSERT:
            return insertNode(nodeProxy, patch, context);
        case VPatchType.REMOVE:
            return removeNode(nodeProxy, vNode);
        case VPatchType.ORDER:
            reorderChildren(nodeProxy, patch);
            return nodeProxy;
        case VPatchType.ELEMENTPROPS:
            applyNativeNodeProps(nodeProxy, patch, vNode.props);
            return nodeProxy;
        case VPatchType.COMPONENTPROPS:
            applyComponentProps(nodeProxy, patch, vNode.props);
            return nodeProxy;
        case VPatchType.REPLACE:
            return vNodePatch(nodeProxy, vNode, patch, context);
        case VPatchType.REF:
            applyRef(nodeProxy, patch, vNode.ref);
            return nodeProxy;
        case VPatchType.COMMANDS:
            applyCommands(nodeProxy, patch.patch, vNode.commands, patch.newCommands);
            return nodeProxy;
        default:
            return nodeProxy;
    }
}

function removeNode(nodeProxy: NodeProxy, vNode) {
    let parentNode = nodeProxy.parentNode;

    if (parentNode) {
        parentNode.removeChild(nodeProxy);
    }

    return null;
}

function insertNode(parentNodeProxy: NodeProxy, vNode: VNode, context?: Component) {
    let newNode = render(vNode, context);

    if (parentNodeProxy) {
        parentNodeProxy.appendChild(newNode);
    }

    return parentNodeProxy;
}

function vNodePatch(nodeProxy: NodeProxy, leftVNode: VNode, vNode: VNode, context?: Component) {
    let parentNode = nodeProxy.parentNode;
    let newNode = render(vNode, context);

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

    let reorderKeyMap: { [key: string]: true } = {};
    let insertKeyMap: { [key: string]: true } = {};
    for (let j = 0; j < moves.inserts.length; j++) {
        let insert = moves.inserts[j];
        insertKeyMap[insert.key] = true;
    }

    //
    for (let i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
            insertKeyMap[remove.key] && (reorderKeyMap[remove.key] = true);
        }
        parentNodeProxy.removeChild(node, reorderKeyMap[remove.key]);
    }
    let length = childNodes.length;
    for (let j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        parentNodeProxy.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to], reorderKeyMap[insert.key]);
    }

}

//

export function applyNativeNodeProps(proxy: NodeProxy, props: IPropType, previous?: IPropType) {

    for (let propName in props) {
        let propValue = props[propName];

        if (propValue === undefined) {
            if (previous) {
                proxy.removeNativeNodeAttribute(propName, previous);
            }
        } else {
            if (isObject(propValue)) {
                patchNativeNodeObject(proxy, props, previous, propName, propValue);
            } else {
                proxy.setNativeNodeAttribute(propName, propValue, previous);
            }
        }
    }

}


function patchNativeNodeObject(proxy: NodeProxy, props, previous, propName, propValue) {
    let previousValue = previous ? previous[propName] : undefined;

    if (previousValue && isObject(previousValue)
        && getPrototype(previousValue) !== getPrototype(propValue)) {
        proxy.setNativeNodeAttribute(propName, propValue, previousValue);
        return;
    }

    if (!isObject(proxy.getNativeNodeAttribute(propName))) {
        proxy.setNativeNodeAttribute(propName, {}, undefined);
    }

    proxy.setNativeNodeObjectAttribute(propName, propValue, previousValue);
}


export function applyRef(proxy: NodeProxy, newRef: string, previousRef?: string) {
    proxy.setRef(newRef, previousRef);
}


export function applyCommands(proxy: NodeProxy, cmdPatch: ICommandsType, previousCmds: ICommandsType, newCommands: ICommandsType) {
    for (let cmdName in cmdPatch) {
        let cmdValue = cmdPatch[cmdName];
        if (cmdValue === undefined) {
            if (previousCmds && (cmdName in previousCmds)) {
                proxy.removeCommand(cmdName, previousCmds[cmdName]);
            }
        } else {
            if (previousCmds && (cmdName in previousCmds)) {
                proxy.updateCommand(cmdName, cmdValue, previousCmds[cmdName])
            } else {
                proxy.addCommand(cmdName, cmdValue);
            }
        }
    }
    proxy.setCommands(newCommands);
}


export function applyComponentProps(proxy: NodeProxy, props, previousProps?) {
    proxy.setComponentProps(props, previousProps);
}
