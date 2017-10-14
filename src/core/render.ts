import { VNode, VNodeType, Instance, NativeElement, createVoidNode, PropsType, Cmds } from "./vnode";
import { Component } from "./component";
import { shallowDiffProps, PropsPatch, CommandPatch } from "./diff-patch";
import { isEventAttr, isFunction, isNullOrUndef, combineFrom, EMPTY_OBJ } from "./shared";
import { getCommand } from "./command";


export function findNativeElementByVNode(vnode: VNode): NativeElement {
    if (!vnode) {
        return;
    }
    if ((vnode.type & VNodeType.Node) > 0) {
        return vnode.instance as NativeElement
    } else if ((vnode.type & VNodeType.Component) > 0) {
        if ((vnode.type & VNodeType.ComponentFunction) > 0) {
            return findNativeElementByVNode(vnode.lastResult)
        } else if ((vnode.type & VNodeType.ComponentClass) > 0) {
            if (!vnode.instance) {
                return;
            }
            return findNativeElementByVNode((vnode.instance as Component).$$lastResult)
        }
    }
}


export function render(vnode: VNode, parentNode: NativeElement, context: object | null): NativeElement {
    if (!vnode) {
        return;
    }
    if (!context) {
        context = EMPTY_OBJ;
    }

    let newParentNode = createInstanceByVNode(vnode, parentNode, context);// newParentNode 必然是有值的
    if (vnode.cmds) {
        applyCmdInserted(newParentNode, vnode.cmds);
    }

    let children = vnode.children;
    if (children && children.length > 0) {
        let len = children.length
        for (let i = 0; i < len; i++) {
            render(children[i], newParentNode, context);
        }
    }

    return newParentNode;
}


// 生命周期
function createInstanceByVNode(vnode: VNode, parentNode: NativeElement, context): NativeElement {
    if ((vnode.type & VNodeType.Node) > 0) {
        let nativeElmment: NativeElement;
        if ((vnode.type & VNodeType.Element) > 0) {
            nativeElmment = createElement(vnode, parentNode)
        } else if ((vnode.type & VNodeType.Text) > 0) {
            nativeElmment = createText(vnode, parentNode);
        } else if ((vnode.type & VNodeType.Void) > 0) {
            nativeElmment = createVoid(vnode, parentNode, context);
        }
        return nativeElmment;
    } else if ((vnode.type & VNodeType.Component) > 0) {
        if ((vnode.type & VNodeType.ComponentFunction) > 0) {
            return createFunctionComponent(vnode, parentNode, context)
        } else if ((vnode.type & VNodeType.ComponentClass) > 0) {
            return createClassComponent(vnode, parentNode, context)
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


function createVoid(vnode: VNode, parentNode: NativeElement, context): NativeElement {
    vnode.instance = document.createTextNode('');
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

function createFunctionComponent(vnode: VNode, parentNode: NativeElement, context) {
    let doRender = vnode.tag as Function
    vnode.instance = doRender;

    if (vnode.refs && vnode.refs.onComponentWillMount) {
        vnode.refs.onComponentWillMount();
    }

    vnode.lastResult = doRender(vnode.props, context) || createVoidNode();
    let nativeEle = render(vnode.lastResult, parentNode, context);
    if (parentNode && nativeEle) {
        parentNode.appendChild(nativeEle)
    }

    if (vnode.refs && vnode.refs.onComponentDidMount) {
        vnode.refs.onComponentDidMount(nativeEle);
    }

    return nativeEle;
}

function createClassComponent(vnode: VNode, parentNode: NativeElement, context) {
    let instance = new (vnode.tag as typeof Component)(vnode.props);
    vnode.instance = instance;
    instance.$$initContext(context);

    if (!isNullOrUndef(instance.componentWillMount)) {
        instance.componentWillMount();
    }

    if (instance.getChildContext) {
        context = combineFrom(context, instance.getChildContext())
    }
    instance.$$lastResult = instance.render() || createVoidNode();
    let nativeEle = render(instance.$$lastResult, parentNode, context)
    if (parentNode && nativeEle) {
        parentNode.appendChild(nativeEle)
    }

    if (!isNullOrUndef(instance.componentDidMount)) {
        instance.componentDidMount();
    }

    return nativeEle;
}


//  native op
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
    addElementProps(origin, origin.props);
}


function addElementProps(origin: VNode, props: PropsType) {
    let naviveElm = origin.instance as HTMLElement
    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            if (!propValue) {
                naviveElm.style.cssText = '';
            } else if (typeof propValue === 'string') {
                naviveElm.style.cssText = propValue;
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

function removeElementProps(origin, props: PropsType) {
    let naviveElm = origin.instance as HTMLElement
    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            naviveElm.style.cssText = '';
        } else {
            if (isEventAttr(propName)) {
                naviveElm[propName.toLowerCase()] = undefined;
            } else {
                naviveElm[propName] = undefined;
            }
        }
    }
}


function updateElementProps(origin, props: PropsType) {
    let naviveElm = origin.instance as HTMLElement

    for (let propName in props) {
        let propValue = props[propName];
        if (propName === 'style') {
            if (!propValue) {
                naviveElm.style.cssText = '';
            } else {
                if (typeof propValue === 'string') {
                    naviveElm.style.cssText = propValue;
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


// command
export function applyCmdInserted(naviveElm: NativeElement, cmds: Cmds) {
    for (let cmdName in cmds) {
        let cmd = getCommand(cmdName);
        if (cmd && cmd.inserted) {
            cmd.inserted(naviveElm, cmds[cmdName]);
        }
    }
}

export function applyCmdUpdate(naviveElm: NativeElement, cmdPatch: CommandPatch) {
    for (let cmdName in cmdPatch) {
        let cmd = getCommand(cmdName);
        if (cmd && cmd.update) {
            cmd.update(naviveElm, cmdPatch[cmdName].newV, cmdPatch[cmdName].oldV);
        }
    }
}

export function applyCmdRemove(naviveElm: NativeElement, cmds: Cmds) {
    for (let cmdName in cmds) {
        let cmd = getCommand(cmdName);
        if (cmd && cmd.remove) {
            cmd.remove(naviveElm, cmds[cmdName]);
        }
    }
}