import { VNode, TagName, PropsType, VNodeType } from "./vnode";
import { getPrototype, deepEqual } from "./utils";
import { isObject, isUndefined, isNull } from "./shared";
import { applyPatch } from "./patch";
import { findNativeElementByVNode, render } from "./render";
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
    constructor(public origin: VNode, public newNode: VNode, public props: PropsType) {
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
    walk(a, b, null);
};

function walk(a: VNode, b: VNode, parent: VNode) {
    if (a === b) {
        return;
    }

    if (b == null) {
        applyPatch(new PatchRemove(a))
    } else {
        if (a.tag === b.tag && a.key === b.key) {
            b.instance = a.instance;
            b.lastResult = a.lastResult;
            if (a.type & VNodeType.Component) {
                if (!shallowEqualObject(a.props, b.props)) {
                    applyPatch(new PatchProps(a, b, b.props))
                }
            } else {
                let propsPatch = shallowDiffProps(a.props, b.props);
                if (propsPatch) {
                    applyPatch(new PatchProps(a, b, propsPatch))
                }
            }
            diffChildren(a, b);
        } else {
            applyPatch(new PatchReplace(a, b))
        }
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


function isAllKeyed(children: VNode[]) {
    let length = children.length;
    let child;
    for (let i = 0; i < length; i++) {
        child = children[i];
        if (!child.key) {
            return false;
        }
    }
    return true;
}

function diffChildren(a: VNode, b: VNode) {
    if (a.children.length === 0 || !isAllKeyed(a.children)) {
        // nokey
        diffNoKeyedChildren(a, b);
    } else {
        if (b.children.length === 0 || !isAllKeyed(b.children)) {
            // nokey
            diffNoKeyedChildren(a, b);
        } else {
            //keyed
            diffKeyedChildren(a, b);
        }
    }
}


function insertOrAppend(parent: VNode, newNode: VNode, refNode: VNode | null) {
    if (refNode) {
        let newChild = findNativeElementByVNode(newNode);
        if (!newChild) {
            newChild = render(newNode);
        }
        let refChild = findNativeElementByVNode(refNode);
        let parentNode = findNativeElementByVNode(parent);
        parentNode.insertBefore(newChild, refChild)
    } else {
        applyPatch(new PatchAppend(parent, newNode));
    }
}

function removeAllChildren(parent: VNode) {
    for (let vnode of parent.children) {
        applyPatch(new PatchRemove(vnode))
    }
}

function diffKeyedChildren(aParent: VNode, bParent: VNode) {
    let a = aParent.children;
    let b = bParent.children;
    let aLength = a.length;
    let bLength = b.length;
    let aEnd = aLength - 1;
    let bEnd = bLength - 1;
    let aStart = 0;
    let bStart = 0;
    let i;
    let j;
    let aNode;
    let bNode;
    let nextNode;
    let nextPos;
    let node;
    let aStartNode = a[aStart];
    let bStartNode = b[bStart];
    let aEndNode = a[aEnd];
    let bEndNode = b[bEnd];

    // Step 1
    outer: {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            walk(aStartNode, bStartNode, aParent);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }

        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            walk(aEndNode, bEndNode, aParent);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }
    }

    if (aStart > aEnd) {// a 中的所有key都匹配了所以 b都是应该插入的
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < bLength ? b[nextPos] : null;
            while (bStart <= bEnd) {
                node = b[bStart];
                bStart++;
                insertOrAppend(aParent, node, nextNode);
            }
        }
    } else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            applyPatch(new PatchRemove(a[aStart++]))
        }
    } else {
        const aLeft = aEnd - aStart + 1;
        const bLeft = bEnd - bStart + 1;
        const sources = new Array(bLeft);

        // Mark all nodes as inserted.
        for (i = 0; i < bLeft; i++) {
            sources[i] = -1;
        }
        let moved = false;
        let pos = 0;
        let patched = 0;

        // When sizes are small, just loop them through
        if (bLeft <= 4 || aLeft * bLeft <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLeft) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;

                            if (pos > j) {
                                moved = true;
                            } else {
                                pos = j;
                            }
                            walk(aNode, bNode, aParent);
                            patched++;
                            a[i] = null as any;
                            break;
                        }
                    }
                }
            }
        } else {
            const keyIndex = new Map();

            // Map keys by their index in array
            for (i = bStart; i <= bEnd; i++) {
                keyIndex.set(b[i].key, i);
            }

            // Try to patch same keys
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];

                if (patched < bLeft) {
                    j = keyIndex.get(aNode.key);

                    if (!isUndefined(j)) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        } else {
                            pos = j;
                        }
                        walk(aNode, bNode, aParent);
                        patched++;
                        a[i] = null as any;
                    }
                }
            }
        }
        // fast-path: if nothing patched remove all old and add all new
        if (aLeft === aLength && patched === 0) {
            removeAllChildren(aParent)
            while (bStart < bLeft) {
                node = b[bStart];
                bStart++;
                applyPatch(new PatchAppend(aParent, node));
            }
        } else {
            i = aLeft - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (aNode) {
                    applyPatch(new PatchRemove(aNode));
                    i--;
                }
            }
            if (moved) {
                const seq = lis_algorithm(sources);
                j = seq.length - 1;
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        insertOrAppend(aParent, node, nextPos < bLength ? b[nextPos] : null);
                    } else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            insertOrAppend(aParent, node, nextPos < bLength ? b[nextPos] : null);
                        } else {
                            j--;
                        }
                    }
                }
            } else if (patched !== bLeft) {
                // when patched count doesn't match b length we need to insert those new ones
                // loop backwards so we can use insertBefore
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        insertOrAppend(aParent, node, nextPos < bLength ? b[nextPos] : null);
                    }
                }
            }
        }
    }
}

// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(arr: number[]): number[] {
    const p = arr.slice(0);
    const result: number[] = [0];
    let i;
    let j;
    let u;
    let v;
    let c;
    const len = arr.length;

    for (i = 0; i < len; i++) {
        const arrI = arr[i];

        if (arrI !== -1) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }

            u = 0;
            v = result.length - 1;

            while (u < v) {
                c = ((u + v) / 2) | 0;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }

            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }

    u = result.length;
    v = result[u - 1];

    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }

    return result;
}





function diffNoKeyedChildren(a: VNode, b: VNode) {
    let aChildren = a.children;
    let bChildren = b.children;

    let aLen = aChildren.length;
    let bLen = bChildren.length;
    let len = aLen > bLen ? aLen : bLen;

    for (let i = 0; i < len; i++) {
        let leftNode = aChildren[i];
        let rightNode = bChildren[i];

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                applyPatch(new PatchAppend(a, rightNode))
            }
        } else {
            walk(leftNode, rightNode, a);
        }
    }

}


