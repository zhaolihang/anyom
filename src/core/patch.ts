import { VNode, NativeElement, VNodeType, PropsType } from "./vnode";
import { PatchTree, Patch, PatchType, PatchAppend, PatchRemove, PatchReplace, PatchReorder, PatchProps, shallowDiffProps, diff } from "./diff";
import { render, findNativeElementByVNode } from "./render";
import { Component } from "./component";
import { eventAttr } from "./shared";

export function applyPatch(patchList) {
    if (Array.isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            patchOp(patchList[i]);
        }
    } else {
        patchOp(patchList);
    }
}


// Maps a virtual om tree onto a om proxy tree in an efficient manner.
// We don't want to read all of the om nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a om node if we know that it contains a child of
// interest.

let noChild = {};


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
        case PatchType.Reorder:
            reorderChildren(vpatch as PatchReorder);
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

function reorderChildren(vpatch: PatchReorder) {
    let { parent, moves } = vpatch;

    let childNodes = [...parent.children];
    let keyMap: { [key: string]: VNode } = {};
    let node: VNode;
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
        childNodes.splice(remove.from, 1);
        removedChildWithArg(node, reorderKeyMap[remove.key])
    }

    for (let j = 0; j < insertsLen; j++) {
        insert = inserts[j];
        node = keyMap[insert.key];
        childNodes.splice(insert.to, 0, node);
        insertChildWithArg(parent, node, insert.to, reorderKeyMap[insert.key]);
    }

}

function removedChildWithArg(origin: VNode, recycle = false) {
    let nativeElm = findNativeElementByVNode(origin);
    (nativeElm.parentNode as NativeElement).removeChild(nativeElm);
}

function insertChildWithArg(parent: VNode, child: VNode, insertTo: number, recycle = false) {
    let parentNode = findNativeElementByVNode(parent);
    let childNodes = parentNode.childNodes
    let index = insertTo;
    let refChild: NativeElement = childNodes[index];
    let childNode;
    if (!recycle) {
        childNode = render(child)
    } else {
        childNode = findNativeElementByVNode(child);
    }
    parentNode.insertBefore(childNode, refChild)
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
            let eventName = eventAttr(propName);
            if (eventName) {
                naviveElm.addEventListener(eventName, propValue);
                let previous = origin.props;
                naviveElm.removeEventListener(eventName, previous || previous[propName]);
                if (propValue) {
                    naviveElm.addEventListener(eventName, propValue);
                }
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
            let eventName = eventAttr(propName);
            if (eventName) {
                naviveElm.addEventListener(eventName, propValue);
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
    if (instance['shouldComponentUpdate']) {
        if (!instance['shouldComponentUpdate'](newProps, instance.state)) {
            instance.setProps(newProps);
            return;
        }
    }
    instance.setProps(newProps);
    let currResult = instance.render();
    let patchTree = diff(instance.$$lastResult, currResult)
    instance.$$lastResult = currResult
}
