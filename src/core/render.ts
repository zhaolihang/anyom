import { VNode, VNodeType, Instance, NativeElement, createVoidNode, PropsType } from "./vnode";
import { Component } from "./component";
import { shallowDiffProps } from "./diff-patch";
import { isEventAttr, isFunction, isNullOrUndef } from "./shared";


export function findNativeElementByVNode(vnode: VNode): NativeElement {
    if (!vnode) {
        return;
    }
    if (vnode.type & VNodeType.Node) {
        return vnode.instance as NativeElement
    } else if (vnode.type & VNodeType.Component) {
        if (vnode.type & VNodeType.ComponentFunction) {
            return findNativeElementByVNode(vnode.lastResult)
        } else if (vnode.type & VNodeType.ComponentClass) {
            if (!vnode.instance) {
                return;
            }
            return findNativeElementByVNode((vnode.instance as Component).$$lastResult)
        }
    }
}


export function render(vnode: VNode, parentNode?: NativeElement): NativeElement {
    if (!vnode) {
        return;
    }
    let newParentNode = createInstanceByVNode(vnode, parentNode);
    let children = vnode.children;
    if (children) {
        let len = children.length
        for (let i = 0; i < len; i++) {
            render(children[i], newParentNode || parentNode);
        }
    }

    return newParentNode;
}


// 生命周期
function createInstanceByVNode(vnode: VNode, parentNode: NativeElement): NativeElement {
    if (vnode.type & VNodeType.Node) {
        if (vnode.type & VNodeType.Element) {
            return createElement(vnode, parentNode)
        } else if (vnode.type & VNodeType.Text) {
            return createText(vnode, parentNode);
        } else if (vnode.type & VNodeType.Void) {
            return createVoid(vnode, parentNode);
        }
    } else if (vnode.type & VNodeType.Component) {
        if (vnode.type & VNodeType.ComponentFunction) {
            return createFunctionComponent(vnode, parentNode)
        } else if (vnode.type & VNodeType.ComponentClass) {
            return createClassComponent(vnode, parentNode)
        }
    }
}


function createElement(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createElement(vnode.tag as string);
    initElementProps(vnode);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}


function createText(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createTextNode(vnode.props.value);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}


function createVoid(vnode: VNode, parentNode: NativeElement): NativeElement {
    vnode.instance = document.createTextNode('');
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

function createFunctionComponent(vnode: VNode, parentNode: NativeElement) {
    let doRender = vnode.tag as Function
    vnode.instance = doRender;
    vnode.lastResult = doRender(vnode.props) || createVoidNode();
    let nativeEle = render(vnode.lastResult, parentNode);
    if (parentNode && nativeEle) {
        parentNode.appendChild(nativeEle)
    }
    return nativeEle;
}

function createClassComponent(vnode: VNode, parentNode: NativeElement) {
    let instance = new (vnode.tag as typeof Component)(vnode.props);
    vnode.instance = instance;
    instance.$$lastResult = instance.render() || createVoidNode();
    let nativeEle = render(instance.$$lastResult, parentNode)
    if (parentNode && nativeEle) {
        parentNode.appendChild(nativeEle)
    }
    return nativeEle;
}



export function removeSelf(oriNode: NativeElement) {
    oriNode.parentNode.removeChild(oriNode);
}

export function replaceSelf(oriNode: NativeElement, newNode: NativeElement) {
    (oriNode.parentNode as NativeElement).replaceChild(newNode, oriNode);
}

export function insertBeforeSelf(oriNode: NativeElement, newNode: NativeElement) {
    (oriNode.parentNode as NativeElement).insertBefore(newNode, oriNode);
}

export function insertBeforeMoved(movedNode: NativeElement, refNode: NativeElement) {
    // dom api : insertBefore  appendChild 如果插入或者添加的节点有父节点,浏览器内部会自行处理
    (movedNode.parentNode as NativeElement).insertBefore(movedNode, refNode);
}

export function appendMoved(movedNode: NativeElement) {
    // dom api : insertBefore  appendChild 如果插入或者添加的节点有父节点,浏览器内部会自行处理
    (movedNode.parentNode as NativeElement).appendChild(movedNode);
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
                hanleEvent(naviveElm, propName, propValue)
            } else {
                naviveElm[propName] = propValue;
            }
        }
    }
}



export function updateElementProps(origin: VNode, propsPatch: PropsType) {

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
                hanleEvent(naviveElm, propName, propValue)
            } else {
                naviveElm[propName] = propValue;
            }
        }
    }
}

export function updateTextProps(origin: VNode, propsPatch: PropsType) {
    (origin.instance as Text).nodeValue = propsPatch.value as string;
}



export function hanleEvent(naviveElm: NativeElement, eventName, eventValue) {
    eventName = eventName.toLowerCase();
    if (!isFunction(eventValue) && !isNullOrUndef(eventValue)) {
        const linkEvent = eventValue.event;
        if (linkEvent && isFunction(linkEvent)) {
            naviveElm[eventName] = function (e) {
                linkEvent(eventValue.data, e);
            };
        }
    } else {
        naviveElm[eventName] = eventValue;
    }
}



