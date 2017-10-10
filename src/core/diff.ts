import { VNode, TagName, PropsType, VNodeType } from "./vnode";
import { getPrototype, deepEqual } from "./utils";
import { isObject } from "./shared";
//
export enum PatchType {
    None = 0,
    Append,
    Remove,
    Replace,
    Reorder,
    Props,
}

export interface Patch {
    type: PatchType;
}

export class PatchRemove implements Patch {
    type = PatchType.Remove;
    constructor(public origin: VNode) {
    }
}

export class PatchProps implements Patch {
    type = PatchType.Props;
    constructor(public origin: VNode, public props: PropsType) {
    }
}
export class PatchReplace implements Patch {
    type = PatchType.Replace;
    constructor(public origin: VNode, public newNode: VNode) {
    }
}

export class PatchAppend implements Patch {
    type = PatchType.Append;
    constructor(public parent: VNode, public newNode: VNode) {
    }
}

type Moves = {
    removes: { from: number; key: string }[];
    inserts: { to: number; key: string }[];
}

export class PatchReorder implements Patch {
    type = PatchType.Reorder;
    constructor(public parent: VNode, public moves: Moves) {
    }
}


export type PatchResult = Patch | Patch[];

export type PatchTree = {
    root: VNode;
    [index: number]: PatchResult;
}

export function diff(a: VNode, b?: VNode) {
    let patch: PatchTree = {} as any;
    Object.defineProperty(patch, 'root', {
        value: a,
        writable: true,
        configurable: true,
        enumerable: false
    });
    walk(a, b, patch, 0, null);
    return patch;
};

function walk(a: VNode, b: VNode, patch: PatchTree, index: number, parent: VNode) {
    if (a === b) {
        return;
    }

    if (a && b) {
        b.instance = a.instance;
        b.lastResult = a.lastResult;
    }

    let apply = patch[index];

    if (b == null) {
        apply = appendPatch(apply, new PatchRemove(a));
    } else {
        if (a.tag === b.tag && a.key === b.key) {

            if (a.type & VNodeType.Component) {
                if (!shallowEqualObject(a.props, b.props)) {
                    apply = appendPatch(apply, new PatchProps(a, b.props));
                }
            } else {
                let propsPatch = shallowDiffProps(a.props, b.props);
                if (propsPatch) {
                    apply = appendPatch(apply, new PatchProps(a, propsPatch));
                }
            }
            apply = diffChildren(a, b, patch, apply, index);
        } else {
            apply = appendPatch(apply, new PatchReplace(a, b));
        }
    }

    if (apply) {
        patch[index] = apply;
    }
}


let noPorps = {};
export function shallowDiffProps(a: PropsType, b: PropsType) {
    a = a || noPorps;
    b = b || noPorps;
    let diff;
    for (let aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {};
            diff[aKey] = undefined;
        }
        let aValue = a[aKey];
        let bValue = b[aKey];

        if (aValue === bValue) {
            continue;
        } else if (isObject(aValue) && isObject(bValue)) {
            if (aValue.__proto__ !== aValue.__proto__) {
                diff = diff || {};
                diff[aKey] = bValue;
            } else {
                if (!shallowEqualObject(aValue, bValue)) {
                    diff = diff || {};
                    diff[aKey] = bValue;
                }
            }
        } else {
            diff = diff || {};
            diff[aKey] = bValue;
        }
    }

    for (let bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {};
            diff[bKey] = b[bKey];
        }
    }

    return diff;
}



function shallowEqualObject(a = noPorps, b = noPorps) {
    for (let aKey in a) {
        if (!(aKey in b)) {
            return false
        }
        if (a[aKey] === b[aKey]) {
            continue;
        } else {
            return false
        }
    }

    for (let bKey in b) {
        if (!(bKey in a)) {
            return false
        }
    }

    return true;
}

function diffChildren(a: VNode, b: VNode, patch: PatchTree, apply: PatchResult, index: number) {
    let aChildren = a.children;
    let orderedSet = reorder(aChildren, b.children);
    let bChildren = orderedSet.children;

    let aLen = aChildren.length;
    let bLen = bChildren.length;
    let len = aLen > bLen ? aLen : bLen;

    for (let i = 0; i < len; i++) {
        let leftNode = aChildren[i];
        let rightNode = bChildren[i];

        index += 1;

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new PatchAppend(a, rightNode));
            }
        } else {
            walk(leftNode, rightNode, patch, index, a);
        }

        if (leftNode && leftNode.count) {
            index += leftNode.count;
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new PatchReorder(a, orderedSet.moves));
    }

    return apply;
}

// List diff, naive left to right reordering
function reorder(aChildren: VNode[], bChildren: VNode[]) {
    // O(M) time, O(M) memory
    let bChildIndex = keyIndex(bChildren);
    let bKeys = bChildIndex.keys;
    let bFree = bChildIndex.free;

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        };
    }

    // O(N) time, O(N) memory
    let aChildIndex = keyIndex(aChildren);
    let aKeys = aChildIndex.keys;
    let aFree = aChildIndex.free;

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        };
    }

    // O(MAX(N, M)) memory
    let newChildren = [];

    let freeIndex = 0;
    let freeCount = bFree.length;
    let deletedItems = 0;

    // Iterate through a and match a node in b
    // O(N) time,
    for (let i = 0; i < aChildren.length; i++) {
        let aItem = aChildren[i];
        let itemIndex;

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key];
                newChildren.push(bChildren[itemIndex]);

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++;
                newChildren.push(null);
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++];
                newChildren.push(bChildren[itemIndex]);
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++;
                newChildren.push(null);
            }
        }
    }

    let lastFreeIndex = freeIndex >= bFree.length ? bChildren.length : bFree[freeIndex];

    // Iterate through b and append any new keys
    // O(M) time
    for (let j = 0; j < bChildren.length; j++) {
        let newItem = bChildren[j];

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem);
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem);
        }
    }

    let simulate = newChildren.slice();
    let simulateIndex = 0;
    let removes: { from: number; key: string }[] = [];
    let inserts: { to: number; key: string }[] = [];
    let simulateItem;

    for (let k = 0; k < bChildren.length;) {
        let wantedItem = bChildren[k];
        simulateItem = simulate[simulateIndex];

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null));
            simulateItem = simulate[simulateIndex];
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key));
                        simulateItem = simulate[simulateIndex];
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({ key: wantedItem.key, to: k });
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++;
                        }
                    }
                    else {
                        inserts.push({ key: wantedItem.key, to: k });
                    }
                }
                else {
                    inserts.push({ key: wantedItem.key, to: k });
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key));
            }
        }
        else {
            simulateIndex++;
            k++;
        }
    }

    // remove all the remaining nodes from simulate
    while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex];
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        };
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    };
}

function remove(arr: any[], index, key) {
    arr.splice(index, 1);

    return {
        from: index,
        key: key
    };
}

function keyIndex(children: VNode[]) {
    let keys = {};
    let free = [];
    let length = children.length;

    for (let i = 0; i < length; i++) {
        let child = children[i];

        if (child.key) {
            keys[child.key] = i;
        } else {
            free.push(i);
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    };
}

function appendPatch(apply: PatchResult, patch: Patch): PatchResult {

    if (apply) {
        if (Array.isArray(apply)) {
            (<Patch[]>apply).push(patch);
        } else {
            apply = (<Patch[]>[apply, patch]);
        }
        return apply;
    } else {
        return patch;
    }

}
