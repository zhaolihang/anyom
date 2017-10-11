import { VNode, TagName, PropsType, VNodeType } from "./vnode";
import { isObject, isUndefined } from "./shared";
import { findNativeElementByVNode, render } from "./render";
import { NativeElement } from "./vnode";
import { Component } from "./component";
import { isEventAttr, isArray } from "./shared";
//
enum PatchType {
    None = 0,
    Append,
    Remove,
    Replace,
    Reorder,
    Props,
}

interface Patch {
    type: PatchType;
}

class PatchRemove implements Patch {
    type = PatchType.Remove;
    constructor(public origin: VNode) {
    }
}

class PatchProps implements Patch {
    type = PatchType.Props;
    constructor(public origin: VNode, public newNode: VNode, public props: PropsType) {
    }
}
class PatchReplace implements Patch {
    type = PatchType.Replace;
    constructor(public origin: VNode, public newNode: VNode) {
    }
}

class PatchAppend implements Patch {
    type = PatchType.Append;
    constructor(public parent: VNode, public newNode: VNode) {
    }
}


export function diff(a: VNode, b?: VNode) {
    walk(a, b, null);
};

function walk(a: VNode, b: VNode, parent: VNode) {
    if (a === b) {
        return;
    }

    if (b == null) {
        patchOp(new PatchRemove(a))
    } else {
        if (a.tag === b.tag && a.key === b.key) {
            b.instance = a.instance;
            b.lastResult = a.lastResult;
            if (a.type & VNodeType.Component) {
                if (!shallowEqual(a.props, b.props)) {
                    patchOp(new PatchProps(a, b, b.props))
                }
            } else {
                let propsPatch = shallowDiffProps(a.props, b.props);
                if (propsPatch) {
                    patchOp(new PatchProps(a, b, propsPatch))
                }
            }
            diffChildren(a, b);
        } else {
            patchOp(new PatchReplace(a, b))
        }
    }

}

const noPorps = {};
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
                if (!shallowEqual(aValue, bValue)) {
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



function shallowEqual(a, b) {
    a = a || noPorps;
    b = b || noPorps;
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


function allKeyed(children: VNode[]) {
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
    if (a.children.length === 0 || !allKeyed(a.children)) {
        // nokey
        diffNoKeyedChildren(a, b);
    } else {
        if (b.children.length === 0 || !allKeyed(b.children)) {
            // nokey
            diffNoKeyedChildren(a, b);
        } else {
            //keyed
            diffKeyedChildren(a, b);
        }
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
    let aNode: VNode;
    let bNode: VNode;
    let nextNode: VNode;
    let nextPos: number;
    let node: VNode;
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
    } else if (bStart > bEnd) {// b 中的所有key都匹配了所以 a都是应该删除的
        while (aStart <= aEnd) {
            patchOp(new PatchRemove(a[aStart++]))
        }
    } else {
        // 没有一方是完全遍历完成的
        //  a b c  e f g  c b a
        //  a b c  g f e  c b a
        // 如果中间区域 数量小 直接用for 遍历  不使用算法  如果中间的比较大 则使用算法

        const aLeft = aEnd - aStart + 1;
        const bLeft = bEnd - bStart + 1;
        const sources = new Array(bLeft);// 记录下b剩余的key 在a中的位置

        // Mark all nodes as inserted.
        for (i = 0; i < bLeft; i++) {
            sources[i] = -1;
        }
        let moved = false;
        let pos = 0;
        let patched = 0;// 匹配到的数量

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
        if (aLeft === aLength && patched === 0) {//没有发生匹配 为了性能优化// dom.textContent = ""; 高效的移除节点
            removeAllChildren(aParent)
            while (bStart < bLeft) {
                node = b[bStart];
                bStart++;
                patchOp(new PatchAppend(aParent, node));
            }
        } else {
            i = aLeft - patched;
            while (i > 0) {// 删除 没有匹配到的
                aNode = a[aStart++];
                if (aNode) {
                    patchOp(new PatchRemove(aNode));
                    i--;
                }
            }

            if (moved) {
                const seq = lis_algorithm(sources);
                j = seq.length - 1;
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {//新插入
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        insertOrAppend(aParent, node, nextPos < bLength ? b[nextPos] : null);
                    } else {
                        if (j < 0 || i !== seq[j]) {//位置被移动了
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            insertOrAppendWithMoved(aParent, node, nextPos < bLength ? b[nextPos] : null);
                        } else {
                            j--;
                        }
                    }
                }
            } else if (patched !== bLeft) {
                // when patched count doesn't match b length we need to insert those new ones
                // loop backwards so we can use insertBefore
                for (i = bLeft - 1; i >= 0; i--) {//新插入
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
                patchOp(new PatchAppend(a, rightNode))
            }
        } else {
            walk(leftNode, rightNode, a);
        }
    }

}


////////////
function patchOp(vpatch: Patch) {
    let { type } = vpatch
    switch (type) {
        case PatchType.Append:
            appendNode(vpatch as PatchAppend);
            break;
        case PatchType.Remove:
            removedChild(vpatch as PatchRemove)
            break;
        case PatchType.Replace:
            replaceNode(vpatch as PatchReplace)
            break;
        case PatchType.Props:
            updateProps(vpatch as PatchProps);
            break;
        default: {
            console.warn('没有实现的patch类型:', type);
        }
    }
}


function appendNode(vpatch: PatchAppend) {
    let { parent, newNode } = vpatch
    render(newNode, findNativeElementByVNode(parent))
}

function removedChild(vpatch: PatchRemove) {
    let nativeElm = findNativeElementByVNode(vpatch.origin)
    nativeElm.parentNode.removeChild(nativeElm);
}

function replaceNode(vpatch: PatchReplace) {
    let originElm = findNativeElementByVNode(vpatch.origin)
    let parent = originElm.parentNode as NativeElement;
    let newNode = render(vpatch.newNode);
    if (parent) {
        if (newNode) {
            parent.replaceChild(newNode, originElm);
        } else {
            parent.removeChild(originElm);
        }
    }
}


function updateProps(vpatch: PatchProps) {
    let { origin, props, newNode } = vpatch;
    if (origin.type & VNodeType.Node) {
        if (origin.type & VNodeType.Element) {
            updateElementProps(origin, props);
        } else if (origin.type & VNodeType.Text) {
            updateTextProps(origin, props);
        }
    } else if (origin.type & VNodeType.Component) {
        if (origin.type & VNodeType.ComponentFunction) {
            updateFunctionComponentProps(origin, newNode, props);
        } else if (origin.type & VNodeType.ComponentClass) {
            updateClassComponentProps(origin, props);
        }
    }
}

function updateElementProps(origin: VNode, propsPatch: PropsType) {
    let naviveElm = origin.instance as HTMLElement
    for (let propName in propsPatch) {
        let propValue = propsPatch[propName];
        if (propName === 'style') {
            if (propValue === undefined) {//remove
                naviveElm.style.cssText = '';
            } else {// update
                if (typeof propValue === 'string') {
                    naviveElm.style.cssText = propValue || '';
                } else if (typeof propValue === 'object') {
                    let previous = origin.props;
                    let stylePatch = shallowDiffProps(previous || previous['style'], propValue);
                    for (let styleName in stylePatch) {
                        naviveElm.style[styleName] = stylePatch[styleName];
                    }
                }
            }
        } else {
            if (isEventAttr(propName)) {
                let eventName = propName.toLowerCase()
                naviveElm[eventName] = propValue;
            } else {
                naviveElm[propName] = propValue;
            }
        }
    }
}

export function initElementProps(origin: VNode) {
    let naviveElm = origin.instance as HTMLElement
    let props = origin.props;
    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            if (typeof propValue === 'string') {
                naviveElm.style.cssText = propValue || '';
            } else if (typeof propValue === 'object') {
                let style = naviveElm.style
                for (let styleName in propValue) {
                    style[styleName] = propValue[styleName];
                }
            }
        } else {
            if (isEventAttr(propName)) {
                let eventName = propName.toLowerCase()
                naviveElm[eventName] = propValue;
            } else {
                naviveElm[propName] = propValue;
            }
        }
    }
}

function updateTextProps(origin: VNode, propsPatch: PropsType) {
    (origin.instance as Text).nodeValue = propsPatch.value as string;
}


function updateFunctionComponentProps(origin: VNode, newNode: VNode, newProps: PropsType) {
    let currResult = (origin.instance as Function)(newProps);
    let patchTree = diff(origin.lastResult, currResult)
    newNode.lastResult = currResult
}


function updateClassComponentProps(origin: VNode, newProps: PropsType) {
    let instance = origin.instance as Component;
    if (instance.shouldComponentUpdate) {
        if (!instance.shouldComponentUpdate(newProps, instance.state)) {
            instance.setProps(newProps);
            return;
        }
    }
    instance.setProps(newProps);
    let currResult = instance.render();
    let patchTree = diff(instance.$$lastResult, currResult)
    instance.$$lastResult = currResult
}

function insertOrAppend(parent: VNode, newNode: VNode, refNode: VNode | null) {
    if (refNode) {
        let newChild = render(newNode);
        let refChild = findNativeElementByVNode(refNode);
        let parentNode = refChild.parentNode;
        parentNode.insertBefore(newChild, refChild)
    } else {
        patchOp(new PatchAppend(parent, newNode));
    }
}

function insertOrAppendWithMoved(parent: VNode, movedNode: VNode, refNode: VNode | null) {
    let movedChild = findNativeElementByVNode(movedNode);
    let parentNode = movedChild.parentNode as NativeElement;
    if (refNode) {
        let refChild = findNativeElementByVNode(refNode);
        // dom api : insertBefore  appendChild 如果插入或者添加的节点有父节点,浏览器内部会自行处理
        parentNode.insertBefore(movedChild, refChild)// movedChild
    } else {
        parentNode.appendChild(movedChild)
    }
}


function removeAllChildren(parent: VNode) {
    // for (let vnode of parent.children) {
    //     patchOp(new PatchRemove(vnode))
    // }
    let parentNode = <HTMLElement>findNativeElementByVNode(parent);
    parentNode.textContent = "";
}
