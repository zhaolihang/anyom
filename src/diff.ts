import { VNode, VPatch, VPatchType, isVNode, ITagType, IPropType } from "./vnode";
import { isObject, isArray, getPrototype } from "./utils";

function diffProps(a: IPropType, b: IPropType) {
    let diff;
    for (let aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }
        let aValue = a[aKey]
        let bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else {
                let objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (let bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff;
}


type VPatchResultType = VPatch | VPatch[];

export interface IDiffMap {
    a: VNode;
    [index: number]: VPatchResultType;
}

export function diff(a: VNode, b?: VNode) {
    let patch: IDiffMap = { a: a };
    walk(a, b, patch, 0);
    return patch;
}

function walk(a: VNode, b: VNode, patch: IDiffMap, index: number) {
    if (a === b) {
        return;
    }

    let apply = patch[index];

    if (b == null) {
        apply = appendPatch(apply, new VPatch(VPatchType.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName && a.key === b.key) {
                let propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply, new VPatch(VPatchType.PROPS, a, propsPatch));
                }
                apply = diffChildren(a, b, patch, apply, index);
            } else {
                apply = appendPatch(apply, new VPatch(VPatchType.REPLACE, a, b));
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatchType.REPLACE, a, b));
        }
    }

    if (apply) {
        patch[index] = apply
    }
}

function diffChildren(a: VNode, b: VNode, patch: IDiffMap, apply: VPatchResultType, index: number) {
    let aChildren = a.children
    let orderedSet = reorder(aChildren, b.children)
    let bChildren = orderedSet.children

    let aLen = aChildren.length
    let bLen = bChildren.length
    let len = aLen > bLen ? aLen : bLen

    for (let i = 0; i < len; i++) {
        let leftNode = aChildren[i]
        let rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new VPatch(VPatchType.INSERT, null, rightNode));
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatchType.ORDER, a, orderedSet.moves));
    }

    return apply
}

// List diff, naive left to right reordering
function reorder(aChildren: VNode[], bChildren: VNode[]) {
    // O(M) time, O(M) memory
    let bChildIndex = keyIndex(bChildren)
    let bKeys = bChildIndex.keys
    let bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    let aChildIndex = keyIndex(aChildren)
    let aKeys = aChildIndex.keys
    let aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    let newChildren = []

    let freeIndex = 0
    let freeCount = bFree.length
    let deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (let i = 0; i < aChildren.length; i++) {
        let aItem = aChildren[i]
        let itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    let lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (let j = 0; j < bChildren.length; j++) {
        let newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    let simulate = newChildren.slice()
    let simulateIndex = 0
    let removes = []
    let inserts = []
    let simulateItem

    for (let k = 0; k < bChildren.length;) {
        let wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({ key: wantedItem.key, to: k })
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({ key: wantedItem.key, to: k })
                    }
                }
                else {
                    inserts.push({ key: wantedItem.key, to: k })
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr: any[], index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children: VNode[]) {
    let keys = {}
    let free = []
    let length = children.length

    for (let i = 0; i < length; i++) {
        let child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply: VPatchResultType, patch: VPatch): VPatchResultType {
    if (apply) {
        if (isArray(apply)) {
            (<VPatch[]>apply).push(patch)
        } else {
            apply = (<VPatch[]>[apply, patch]);
        }
        return apply
    } else {
        return patch
    }
}
