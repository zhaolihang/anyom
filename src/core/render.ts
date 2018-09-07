import { VNode, VNodeType, Instance, NativeNode, createVoidNode, PropsType, Cmds } from "./vnode";
import { Component } from "./component";
import { shallowDiffProps, PropsPatch, CommandPatch } from "./diff-patch";
import { isEventAttr, isFunction, isNullOrUndef, combineFrom, EMPTY_OBJ } from "./shared";
import { getCommand } from "./command";


export function findNativeNodeByVNode(vnode: VNode): NativeNode {
    if (!vnode) {
        return;
    }
    if ((vnode.type & VNodeType.Node) > 0) {
        return vnode.instance as NativeNode
    } else if ((vnode.type & VNodeType.Component) > 0) {
        if ((vnode.type & VNodeType.ComponentFunction) > 0) {
            return findNativeNodeByVNode(vnode.lastResult)
        } else if ((vnode.type & VNodeType.ComponentClass) > 0) {
            if (!vnode.instance) {
                return;
            }
            return findNativeNodeByVNode((vnode.instance as Component).$$lastResult)
        }
    }
}


export function render(vnode: VNode, parentNode: NativeNode, context?: object | null): NativeNode {
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
function createInstanceByVNode(vnode: VNode, parentNode: NativeNode, context): NativeNode {
    if ((vnode.type & VNodeType.Node) > 0) {
        let nativeNode: NativeNode;
        if ((vnode.type & VNodeType.Element) > 0) {
            nativeNode = createElement(vnode, parentNode)
        } else if ((vnode.type & VNodeType.Text) > 0) {
            nativeNode = createText(vnode, parentNode);
        } else if ((vnode.type & VNodeType.Void) > 0) {
            nativeNode = createVoid(vnode, parentNode, context);
        }
        return nativeNode;
    } else if ((vnode.type & VNodeType.Component) > 0) {
        if ((vnode.type & VNodeType.ComponentFunction) > 0) {
            return createFunctionComponent(vnode, parentNode, context)
        } else if ((vnode.type & VNodeType.ComponentClass) > 0) {
            return createClassComponent(vnode, parentNode, context)
        }
    }
}


function createElement(vnode: VNode, parentNode: NativeNode): NativeNode {
    vnode.instance = document.createElement(vnode.tag as string);
    initElementProps(vnode);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}


function createText(vnode: VNode, parentNode: NativeNode): NativeNode {
    vnode.instance = document.createTextNode(vnode.props.value);
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}


function createVoid(vnode: VNode, parentNode: NativeNode, context): NativeNode {
    vnode.instance = document.createTextNode('');
    if (parentNode) {
        parentNode.appendChild(vnode.instance)
    }
    return vnode.instance
}

function createFunctionComponent(vnode: VNode, parentNode: NativeNode, context) {
    let doRender = vnode.tag as Function
    vnode.instance = doRender;
    let hooks = vnode.hooks;
    if (hooks && hooks.onWillMount) {
        hooks.onWillMount();
    }

    vnode.lastResult = doRender(vnode.props, context) || createVoidNode();
    let nativeNode = render(vnode.lastResult, parentNode, context);
    if (parentNode && nativeNode) {
        parentNode.appendChild(nativeNode)
    }

    if (hooks && hooks.onDidMount) {
        hooks.onDidMount(nativeNode);
    }

    return nativeNode;
}

function createClassComponent(vnode: VNode, parentNode: NativeNode, context) {
    let instance = new (vnode.tag as typeof Component)(vnode.props);
    vnode.instance = instance;
    instance.$$initContext(context);

    if (instance.componentWillMount) {
        instance.componentWillMount();
    }

    if (instance.getChildContext) {
        context = combineFrom(context, instance.getChildContext())
    }
    instance.$$lastResult = instance.render() || createVoidNode();
    let nativeNode = render(instance.$$lastResult, parentNode, context)
    if (parentNode && nativeNode) {
        parentNode.appendChild(nativeNode)
    }

    if (instance.componentDidMount) {
        instance.componentDidMount();
    }

    return nativeNode;
}


//  native op
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


function addElementProps(origin: VNode, props: PropsType) {
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
                hanleEvent(naviveNode, propName, propValue)
            } else {
                naviveNode[propName] = propValue;
            }
        }
    }
}

function removeElementProps(origin, props: PropsType) {
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


function updateElementProps(origin, props: PropsType) {
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
                    let stylePatch = shallowDiffProps(previous || previous['style'], propValue);
                    for (let styleName in stylePatch) {
                        naviveNode.style[styleName] = stylePatch[styleName];
                    }
                }
            }
        } else {
            if (isEventAttr(propName)) {
                hanleEvent(naviveNode, propName, propValue)
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


export function hanleEvent(naviveNode: NativeNode, eventName, eventValue) {
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


// command
export function applyCmdInserted(nativeNode: NativeNode, cmds: Cmds) {
    for (let cmdName in cmds) {
        let cmd = getCommand(cmdName);
        if (cmd && cmd.inserted) {
            cmd.inserted(nativeNode, cmds[cmdName]);
        }
    }
}

export function applyCmdUpdate(nativeNode: NativeNode, cmdPatch: CommandPatch) {
    for (let cmdName in cmdPatch) {
        let cmd = getCommand(cmdName);
        if (cmd && cmd.update) {
            cmd.update(nativeNode, cmdPatch[cmdName].newV, cmdPatch[cmdName].oldV);
        }
    }
}

export function applyCmdRemove(nativeNode: NativeNode, cmds: Cmds) {
    for (let cmdName in cmds) {
        let cmd = getCommand(cmdName);
        if (cmd && cmd.remove) {
            cmd.remove(nativeNode, cmds[cmdName]);
        }
    }
}