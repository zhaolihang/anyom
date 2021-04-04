import { VNode, NativeNode, PropsType, } from "./vnode";
import { shallowDiffProps, PropsPatch } from "./diff-patch";
import { isEventAttr, isFunction, isNullOrUndef } from "./shared";

//  native op
export function createElement(vnode: VNode, parentNode: NativeNode): NativeNode {
    vnode.instance = document.createElement(vnode.tag as string);
    initElementProps(vnode);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

export function createText(vnode: VNode, parentNode: NativeNode): NativeNode {
    vnode.instance = document.createTextNode(vnode.props.value);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

export function createVoid(vnode: VNode, parentNode: NativeNode, context): NativeNode {
    vnode.instance = document.createTextNode('');
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

export function appendChild(parentNode: NativeNode, childNode: NativeNode) {
    parentNode.appendChild(childNode)
}

export function removeSelf(oriNode: NativeNode) {
    oriNode.parentNode.removeChild(oriNode);
}

export function replaceSelf(oriNode: NativeNode, newNode: NativeNode) {
    (oriNode.parentNode as NativeNode).replaceChild(newNode, oriNode);
}

export function insertBeforeSelf(oriNode: NativeNode, newNode: NativeNode) {
    (oriNode.parentNode as NativeNode).insertBefore(newNode, oriNode);
}

export function insertBeforeMoved(movedNode: NativeNode, refNode: NativeNode) {
    // dom api : insertBefore  appendChild 如果插入或者添加的节点有父节点,浏览器内部会自行处理
    (movedNode.parentNode as NativeNode).insertBefore(movedNode, refNode);
}

export function appendMoved(movedNode: NativeNode) {
    // dom api : insertBefore  appendChild 如果插入或者添加的节点有父节点,浏览器内部会自行处理
    (movedNode.parentNode as NativeNode).appendChild(movedNode);
}

export function initElementProps(origin: VNode) {
    addElementProps(origin, origin.props);
}

export function addElementProps(origin: VNode, props: PropsType) {
    let naviveNode = origin.instance as HTMLElement
    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            if (!propValue) {
                naviveNode.style.cssText = '';
            } else if (typeof propValue === 'string') {
                naviveNode.style.cssText = propValue;
            } else if (typeof propValue === 'object') {
                let style = naviveNode.style
                for (let styleName in propValue) {
                    style[styleName] = propValue[styleName];
                }
            }
        } else {
            if (isEventAttr(propName)) {
                handleEvent(naviveNode, propName, propValue)
            } else {
                naviveNode[propName] = propValue;
            }
        }
    }
}

function removeElementProps(origin: VNode, props: PropsType) {
    let naviveNode = origin.instance as HTMLElement
    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            naviveNode.style.cssText = '';
        } else {
            if (isEventAttr(propName)) {
                naviveNode[propName.toLowerCase()] = undefined;
            } else {
                naviveNode[propName] = undefined;
            }
        }
    }
}


function updateElementProps(origin: VNode, props: PropsType) {
    let naviveNode = origin.instance as HTMLElement

    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            if (!propValue) {
                naviveNode.style.cssText = '';
            } else {
                if (typeof propValue === 'string') {
                    naviveNode.style.cssText = propValue;
                } else if (typeof propValue === 'object') {
                    let previous = origin.props;
                    let stylePatch = shallowDiffProps(previous && previous['style'], propValue);
                    if (stylePatch.added) {
                        var styles = stylePatch.added;
                        for (let styleName in styles) {
                            naviveNode.style[styleName] = styles[styleName];
                        }
                    }
                    if (stylePatch.removed) {
                        var styles = stylePatch.removed;
                        for (let styleName in styles) {
                            delete naviveNode.style[styleName];
                        }
                    }
                    if (stylePatch.update) {
                        var styles = stylePatch.update;
                        for (let styleName in styles) {
                            naviveNode.style[styleName] = styles[styleName];
                        }
                    }
                }
            }
        } else {
            if (isEventAttr(propName)) {
                handleEvent(naviveNode, propName, propValue)
            } else {
                naviveNode[propName] = propValue;
            }
        }
    }
}

export function applyElementPropsPatch(origin: VNode, propsPatch: PropsPatch) {
    if (propsPatch.added) {
        addElementProps(origin, propsPatch.added);
    }
    if (propsPatch.removed) {
        removeElementProps(origin, propsPatch.removed);
    }
    if (propsPatch.update) {
        updateElementProps(origin, propsPatch.update);
    }
}

export function updateTextProps(origin: VNode, propsPatch: PropsPatch) {
    if (propsPatch.update) {
        (origin.instance as Text).nodeValue = propsPatch.update.value as string;
    }
}


export function handleEvent(naviveNode: NativeNode, eventName, eventValue) {
    eventName = eventName.toLowerCase();
    if (!isFunction(eventValue) && !isNullOrUndef(eventValue)) {
        const linkEvent = eventValue.event;
        if (linkEvent && isFunction(linkEvent)) {
            naviveNode[eventName] = function (e) {
                linkEvent(eventValue.data, e);
            };
        }
    } else {
        naviveNode[eventName] = eventValue;
    }
}