import { VNode, TagName, PropsType, VNodeType } from "./vnode";
import { isObject, isUndefined } from "./shared";
import { findNativeElementByVNode, render, removeSelf, replaceSelf, insertBeforeSelf, insertBeforeMoved, hanleEvent, appendMoved, updateElementProps, updateTextProps } from "./render";
import { NativeElement, createVoidNode } from "./vnode";
import { Component } from "./component";
import { isEventAttr, isArray, isFunction, isNullOrUndef } from "./shared";

export function diff(a: VNode, b: VNode, context) {
    walk(a, b, null, context);
};

function walk(a: VNode, b: VNode, parent: VNode, context) {
    if (a === b) {
        return;
    }

    if (!b) {
        removeChild(a);
    } else {
        if (a.tag === b.tag && a.key === b.key) {
            b.instance = a.instance;

            if (a.type & VNodeType.Component) {
                if (!shallowEqual(a.props, b.props)) {
                    updateProps(a, b, b.props, context);
                } else {
                    b.lastResult = a.lastResult;// sync lastResult
                }
                return;// 组件无需比较children
            } else if (a.type & VNodeType.Void && a.type === b.type) {// Void 无需比较
                return;
            } else {
                let propsPatch = shallowDiffProps(a.props, b.props);
                if (propsPatch) {
                    updateProps(a, b, propsPatch, context);
                }
            }

            diffChildren(a, b, context);
        } else {
            replaceNode(a, b, context);
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

function diffChildren(a: VNode, b: VNode, context) {
    if (a.children.length === 0 || !allKeyed(a.children)) {
        // nokey
        diffNoKeyedChildren(a, b, context);
    } else {
        if (b.children.length === 0 || !allKeyed(b.children)) {
            // nokey
            diffNoKeyedChildren(a, b, context);
        } else {
            //keyed
            diffKeyedChildren(a, b, context);
        }
    }
}

function diffKeyedChildren(aParent: VNode, bParent: VNode, context) {
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
            walk(aStartNode, bStartNode, aParent, context);
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
            walk(aEndNode, bEndNode, aParent, context);
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
                insertOrAppend(aParent, node, nextNode, context);
            }
        }
    } else if (bStart > bEnd) {// b 中的所有key都匹配了所以 a都是应该删除的
        while (aStart <= aEnd) {
            removeChild(a[aStart++]);
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
                            walk(aNode, bNode, aParent, context);
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
                        walk(aNode, bNode, aParent, context);
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
                appendNode(aParent, node, context)
            }
        } else {
            i = aLeft - patched;
            while (i > 0) {// 删除 没有匹配到的
                aNode = a[aStart++];
                if (aNode) {
                    removeChild(aNode);
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
                        insertOrAppend(aParent, node, nextPos < bLength ? b[nextPos] : null, context);
                    } else {
                        if (j < 0 || i !== seq[j]) {//位置被移动了
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            // 此时 应该先移除 node 在把它放在 b[nextPos] 之前  原位置在sources[i]保存
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
                        insertOrAppend(aParent, node, nextPos < bLength ? b[nextPos] : null, context);
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


function diffNoKeyedChildren(a: VNode, b: VNode, context) {
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
                appendNode(a, rightNode, context);
            }
        } else {
            walk(leftNode, rightNode, a, context);
        }
    }

}


// patch op
function appendNode(parent: VNode, newNode: VNode, context) {
    render(newNode, findNativeElementByVNode(parent), context)
}

function removeChild(origin: VNode) {
    removeSelf(findNativeElementByVNode(origin));
}

function replaceNode(origin: VNode, newNode: VNode, context) {
    let newChild = render(newNode, null, context);
    replaceSelf(findNativeElementByVNode(origin), newChild);
}

function insertOrAppend(parent: VNode, newNode: VNode, refNode: VNode | null, context) {
    if (refNode) {
        let newChild = render(newNode, null, context);
        let refChild = findNativeElementByVNode(refNode);
        insertBeforeSelf(refChild, newChild)
    } else {
        render(newNode, findNativeElementByVNode(parent), context)
    }
}

function insertOrAppendWithMoved(parent: VNode, movedNode: VNode, refNode: VNode | null) {
    let movedChild = findNativeElementByVNode(movedNode);
    if (refNode) {
        let refChild = findNativeElementByVNode(refNode);
        insertBeforeMoved(movedChild, refChild)
    } else {
        appendMoved(movedChild)
    }
}


function removeAllChildren(parent: VNode) {
    for (let vnode of parent.children) {
        removeSelf(findNativeElementByVNode(vnode));
    }
    // let parentNode = <HTMLElement>findNativeElementByVNode(parent);
    // parentNode.textContent = "";
}




function updateProps(origin: VNode, newNode: VNode, propsPatch: PropsType, context) {
    if (origin.type & VNodeType.Node) {
        if (origin.type & VNodeType.Element) {
            updateElementProps(origin, propsPatch);
        } else if (origin.type & VNodeType.Text) {
            updateTextProps(origin, propsPatch);
        }
    } else if (origin.type & VNodeType.Component) {
        if (origin.type & VNodeType.ComponentFunction) {
            updateFunctionComponentProps(origin, newNode, propsPatch, context);
        } else if (origin.type & VNodeType.ComponentClass) {
            updateClassComponentProps(origin, propsPatch, context);
        }
    }
}


function updateFunctionComponentProps(origin: VNode, newNode: VNode, newProps: PropsType, context) {
    if (newNode.refs && newNode.refs.onComponentShouldUpdate) {// 应用新节点的 hook
        if (!newNode.refs.onComponentShouldUpdate(origin.props, newProps)) {
            newNode.lastResult = origin.lastResult;// sync lastResult
            return;
        }
    }
    let currResult: VNode = (origin.instance as Function)(newProps, context) || createVoidNode();
    diff(origin.lastResult, currResult, context)
    newNode.lastResult = currResult
}


function updateClassComponentProps(origin: VNode, newProps: PropsType, context) {
    let instance = origin.instance as Component;
    if (instance.shouldComponentUpdate) {
        if (!instance.shouldComponentUpdate(newProps, instance.state)) {
            instance.$$setProps(newProps);
            return;
        }
    }
    instance.$$setProps(newProps);
    instance.$$updateComponent(null);
}

