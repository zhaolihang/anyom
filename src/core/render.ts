// render.ts
import { VNode, VNodeType, NativeNode, createVoidNode, Cmds } from "./vnode";
import { Component } from "./component";
import { CommandPatch } from "./diff-patch";
import { combineFrom, EMPTY_OBJ } from "./shared";
import { getCommand } from "./command";
import { appendChild, createElement, createText, createVoid } from "./driver";


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
        appendChild(parentNode, nativeNode)
    }

    if (instance.componentDidMount) {
        instance.componentDidMount();
    }

    return nativeNode;
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