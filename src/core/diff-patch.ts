import { VNode, TagName, PropsType, VNodeType } from "./vnode";
import { isObject, isUndefined } from "./shared";
import { findNativeNodeByVNode, render, removeSelf, replaceSelf, insertBeforeSelf, insertBeforeMoved, handleEvent, appendMoved, applyElementPropsPatch, updateTextProps, applyCmdUpdate, applyCmdRemove, applyCmdInserted } from "./render";
import { NativeNode, createVoidNode, Cmds } from "./vnode";
import { Component } from "./component";
import { isEventAttr, isArray, isFunction, isNullOrUndef, EMPTY_OBJ } from "./shared";

export function diff(a: VNode, b: VNode, context) {
    if (!context) {
        context = EMPTY_OBJ;
    }
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

            if ((a.type & VNodeType.Component) > 0) {

                if (!shallowEqual(a.props, b.props)) {
                    updateComponentProps(a, b, b.props, context);
                } else {
                    if ((a.type & VNodeType.ComponentFunction) > 0) {
                        b.lastResult = a.lastResult;//ComponentFunction sync lastResult
                    }
                }

                let cmdsPatch = diffCommand(a.cmds, b.cmds);
                if (cmdsPatch) {
                    // 当 updateComponentProps 的时候可能发生了节点替换
                    // 如果发生了节点替换  aNativeNode!==bNativeNode  必然调用 jointParentCmd(origin, newChild);
                    //   bNativeNode 应用了 老的cmd 此时进行纠正 
                    // 所以 无论那种情况 都应该传入 bNativeNode
                    applyCmdUpdate(findNativeNodeByVNode(b), cmdsPatch);
                }

                return;// 组件无需比较children
            } else if ((a.type & VNodeType.NotVoidNode) > 0) {

                let propsPatch = shallowDiffProps(a.props, b.props);
                if (propsPatch) {
                    updateNodeProps(a, b, propsPatch, context);
                }

                if ((a.type & VNodeType.Element) > 0) {
                    diffChildren(a, b, context);
                }//else  {  // VNodeType.Text 无需比较children  }

                let cmdsPatch = diffCommand(a.cmds, b.cmds);
                if (cmdsPatch) {
                    applyCmdUpdate(b.instance as NativeNode, cmdsPatch);
                }
            }//else { // VNodeType.Void 无需比较 }
        } else {
            replaceNode(a, b, context);
        }
    }

}


export type PropsPatch = {
    removed?: PropsType,
    update?: PropsType,
    added?: PropsType,
}

const noneObj = {};
if (Object.freeze) {
    Object.freeze(noneObj)
}

export function shallowDiffProps(a: PropsType, b: PropsType): PropsPatch {
    a = a || noneObj;
    b = b || noneObj;
    let removed: PropsType;
    let update: PropsType;
    let added: PropsType;
    for (let aKey in a) {
        if (!(aKey in b)) {
            removed = removed || {};
            removed[aKey] = true;
        }
        let aValue = a[aKey];
        let bValue = b[aKey];

        if (aValue === bValue) {
            continue;
        } else if (isObject(aValue) && isObject(bValue)) {
            if (aValue.__proto__ !== aValue.__proto__) {
                update = update || {};
                update[aKey] = bValue;
            } else {
                if (!shallowEqual(aValue, bValue)) {
                    update = update || {};
                    update[aKey] = bValue;
                }
            }
        } else {
            update = update || {};
            update[aKey] = bValue;
        }
    }

    for (let bKey in b) {
        if (!(bKey in a)) {
            added = added || {};
            added[bKey] = b[bKey];
        }
    }

    if (removed || update || added) {
        return {
            removed,
            update,
            added,
        };
    }
}

export type CommandPatch = {
    [cmdName: string]: {
        oldV: any,
        newV: any
    }
}
function diffCommand(aCmds: Cmds, bCmds: Cmds): CommandPatch {

    if (aCmds === bCmds) {
        return;
    }
    aCmds = aCmds || noneObj;
    bCmds = bCmds || noneObj;
    let diff;
    for (let aKey in aCmds) {
        if ((aKey in bCmds)) {
            if (aCmds[aKey] !== bCmds[aKey]) {
                if (!diff) {
                    diff = {};
                }
                diff[aKey] = { oldV: aCmds[aKey], newV: bCmds[aKey] }
            }
        }
    }
    return diff;
}


function shallowEqual(a, b) {
    a = a || noneObj;
    b = b || noneObj;
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

function diffChildren(a: VNode, b: VNode, context) {
    if (a.children.length === 0 || !isAllKeyed(a.children)) {
        // nokey
        diffNoKeyedChildren(a, b, context);
    } else {
        if (b.children.length === 0 || !isAllKeyed(b.children)) {
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
    render(newNode, findNativeNodeByVNode(parent), context)
}

function removeChild(origin: VNode) {
    removeCmdHooks(origin, true);
    unmountHooks(origin);
    removeSelf(findNativeNodeByVNode(origin));
}

function removeCmdHooks(origin: VNode, starter: boolean) {
    // fist   remove children cmd
    if ((origin.type & VNodeType.Node) > 0) {
        let children = origin.children;
        if (children && children.length > 0) {
            let len = children.length;
            for (let i = 0; i < len; i++) {
                removeCmdHooks(children[i], false);
            }
        }
    } else {// Component
        if ((origin.type & VNodeType.ComponentFunction) > 0) {
            removeCmdHooks(origin.lastResult, false);
        } else if ((origin.type & VNodeType.ComponentClass) > 0) {
            let instance = origin.instance as Component;
            removeCmdHooks(instance.$$lastResult, false);
        }
    }

    // second remove self cmd
    let nativeNode = findNativeNodeByVNode(origin);
    if (origin.cmds) {
        applyCmdRemove(nativeNode, origin.cmds);
    }

    // third  remove parent Component cmd if necessary
    if (starter) {
        // loop up
        let parent: VNode = origin;
        while (parent = parent.parentVNode) {
            if (parent.cmds) {
                applyCmdRemove(nativeNode, parent.cmds);
            }
        }
    }

}

function jointParentCmd(newNode: VNode, newChild: NativeNode) {
    let parent: VNode = newNode;
    while (parent = parent.parentVNode) {
        if (parent.cmds) {
            // op
            applyCmdInserted(newChild, parent.cmds);
        }
    }
}

function replaceNode(origin: VNode, newNode: VNode, context) {
    removeCmdHooks(origin, true);
    unmountHooks(origin);
    let newChild = render(newNode, null, context);
    replaceSelf(findNativeNodeByVNode(origin), newChild);
    // joint parentComponent cmds
    // at the time newNode certainly have not parentVNode chain  so we use oldVNode`s cmds first
    jointParentCmd(origin, newChild);
}

function insertOrAppend(parent: VNode, newNode: VNode, refNode: VNode | null, context) {
    if (refNode) {
        let newChild = render(newNode, null, context);
        let refChild = findNativeNodeByVNode(refNode);
        insertBeforeSelf(refChild, newChild)
    } else {
        render(newNode, findNativeNodeByVNode(parent), context)
    }
}

function insertOrAppendWithMoved(parent: VNode, movedNode: VNode, refNode: VNode | null) {
    let movedChild = findNativeNodeByVNode(movedNode);
    if (refNode) {
        let refChild = findNativeNodeByVNode(refNode);
        insertBeforeMoved(movedChild, refChild)
    } else {
        appendMoved(movedChild)
    }
}


function removeAllChildren(parent: VNode) {
    for (let vnode of parent.children) {
        removeChild(vnode)
    }
}


function updateNodeProps(origin: VNode, newNode: VNode, propsPatch: PropsPatch, context) {
    if ((origin.type & VNodeType.Element) > 0) {
        applyElementPropsPatch(origin, propsPatch);
    } else if ((origin.type & VNodeType.Text) > 0) {
        updateTextProps(origin, propsPatch);
    }
}


function updateComponentProps(origin: VNode, newNode: VNode, propsPatch: PropsType, context) {
    if ((origin.type & VNodeType.ComponentFunction) > 0) {
        updateFunctionComponentProps(origin, newNode, propsPatch, context);
    } else if ((origin.type & VNodeType.ComponentClass) > 0) {
        updateClassComponentProps(origin, propsPatch, context);
    }
}


function updateFunctionComponentProps(origin: VNode, newNode: VNode, newProps: PropsType, context) {
    let hooks = newNode.hooks;
    if (hooks && hooks.onShouldUpdate) {// 应用新节点的 hook
        if (!hooks.onShouldUpdate(origin.props, newProps)) {
            newNode.lastResult = origin.lastResult;// sync lastResult
            return;
        }
    }

    if (hooks && hooks.onWillUpdate) {// 应用新节点的 hook
        hooks.onWillUpdate(origin.props, newProps);
    }

    let currResult: VNode = (origin.instance as Function)(newProps, context) || createVoidNode();
    diff(origin.lastResult, currResult, context)
    newNode.lastResult = currResult;

    if (hooks && hooks.onDidUpdate) {// 应用新节点的 hook
        hooks.onDidUpdate(origin.props, newProps);
    }

}


function updateClassComponentProps(origin: VNode, newProps: PropsType, context) {
    let instance = origin.instance as Component;
    if (instance.shouldComponentUpdate) {
        if (!instance.shouldComponentUpdate(newProps, instance.state, context)) {
            instance.$$setPropsAndContext(newProps, context);
            return;
        }
    }
    instance.$$setPropsAndContext(newProps, context);
    instance.$$updateComponent(null);
}



function unmountHooks(vnode: VNode) {
    if ((vnode.type & VNodeType.Node) > 0) {
        // first hook children
        let children = vnode.children;
        if (children && children.length > 0) {
            let len = children.length;
            for (let i = 0; i < len; i++) {
                unmountHooks(children[i]);
            }
        }
        //second self
        if (vnode.ref) {
            vnode.ref(null);
        }
    } else {
        if ((vnode.type & VNodeType.ComponentFunction) > 0) {
            // first hook children
            unmountHooks(vnode.lastResult);
            //second self
            if (vnode.hooks && vnode.hooks.onWillUnmount) {
                vnode.hooks.onWillUnmount(findNativeNodeByVNode(vnode));
            }
        } else if ((vnode.type & VNodeType.ComponentClass) > 0) {
            let instance = vnode.instance as Component;

            // first hook children
            unmountHooks(instance.$$lastResult);
            //second self
            if (vnode.ref) {
                vnode.ref(null);
            }
            if (instance.componentWillUnmount) {
                instance.componentWillUnmount();
            }
        }
    }
}
