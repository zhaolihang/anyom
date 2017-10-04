import { ITagName, VNode, VNodeType, ICmdsType, IRefType } from "./vnode";
import { Component, LifeCycleType, ComponentStateless } from "./component";
import { startsWith, endsWith, getEventNameOfNative, getPrototype } from "./utils";
import { getCommand } from "./commands";
import { applyNativeProps, applyCommands, applyOns } from "./patch";

export enum ProxyType {
    None = 0,
    NATIVE,
    COMPONENT,
}

/**
 * NodeProxy is a NativeElement Proxy
 */
export class NodeProxy {

    parentNode: NodeProxy;
    childNodes: NodeProxy[] = [];

    vNodeType: VNodeType;
    proxyType: ProxyType;
    element: any;
    ref: IRefType;
    cmds: ICmdsType;

    constructor(vNode: VNode) {
        this.vNodeType = vNode.type;
        if (this.vNodeType === VNodeType.Component) {
            this.proxyType = ProxyType.COMPONENT;
            this.element = this.createComponent(vNode);
        } else {
            this.proxyType = ProxyType.NATIVE;
            this.element = this.createNative(vNode);
        }

        // init
        if (this.proxyType === ProxyType.NATIVE) {
            applyNativeProps(this, vNode.props, undefined);
        }
        if (vNode.cmds) {
            applyCommands(this, vNode.cmds, undefined, vNode.cmds);
        }
        if (vNode.ons) {
            applyOns(this, vNode.ons, undefined);
        }
        if (vNode.ref) {
            this.setRef(vNode.ref);
            this.ref(this.element);// 创建的时候传入 element  销毁的时候传入 null
        }

    }

    private createNative(vNode: VNode) {
        if (this.vNodeType === VNodeType.NativeText) {
            return <Text>(document.createTextNode(vNode.props.value));
        } else if (this.vNodeType === VNodeType.NativeNode) {
            return <HTMLElement>(document.createElement(vNode.tag));
        } else if (this.vNodeType === VNodeType.NullNode) {
            return document.createComment('   ');
        }
    }

    private createComponent(vNode: VNode): Component {
        let Ctor = vNode.tag;
        let CtorProto = getPrototype(Ctor);
        let com: Component;
        if (Ctor.prototype && Ctor.prototype.render) {
            com = new Ctor(vNode.props);
        } else {
            com = new ComponentStateless(vNode.props, Ctor);
        }
        com[LifeCycleType.Created] && com[LifeCycleType.Created]();
        return com;
    }

    getNativeNode<T = any>(): T {
        if (this.proxyType === ProxyType.NATIVE) {
            return (<T>this.element);
        } else if (this.proxyType === ProxyType.COMPONENT) {
            return (<Component>this.element).getNodeProxy().getNativeNode();
        }
    }

    appendChild(x: NodeProxy) {
        x.parentNode = this;
        this.childNodes.push(x);

        ///
        if (this.proxyType === ProxyType.NATIVE) {
            (this.element as HTMLElement).appendChild(x.getNativeNode());
        } else if (this.proxyType === ProxyType.COMPONENT) {
            this.getNativeNode().appendChild(x.getNativeNode());
        }

        x.addedHook();
    }

    private addedHook() {
        if (this.proxyType === ProxyType.COMPONENT) {
            let com: Component = this.element;
            com[LifeCycleType.Mounted] && com[LifeCycleType.Mounted]();
        }
    }

    removeChild(x: NodeProxy, recycle = false) {

        if (this.proxyType === ProxyType.NATIVE) {
            (this.element as HTMLElement).removeChild(x.getNativeNode());
        } else if (this.proxyType === ProxyType.COMPONENT) {
            this.getNativeNode().removeChild(x.getNativeNode());
        }

        if (!recycle) {
            x.removedHook();
        }

        ///
        let index = this.childNodes.indexOf(x);
        x.parentNode = undefined;
        this.childNodes.splice(index, 1);

    }

    private removedHook() {
        // 有问题: com 下面的子component的生命周期没有调用 应该先遍历子节点
        let childNodes = this.childNodes;
        let len = childNodes.length;
        for (let i = 0; i < len; i++) {
            childNodes[i].removedHook();
        }

        if (this.proxyType === ProxyType.COMPONENT) {
            let com: Component = this.element;
            com.getNodeProxy().removedHook();
            com[LifeCycleType.Destory]();// 去除依赖
            com[LifeCycleType.UnMounted] && com[LifeCycleType.UnMounted]();
        }
        this.removeCmds();
        this.ref && this.ref(null);
    }

    replaceChild(newNode: NodeProxy, oldNode: NodeProxy) {

        if (this.proxyType === ProxyType.NATIVE) {
            (this.element as HTMLElement).replaceChild(newNode.getNativeNode(), oldNode.getNativeNode());
        } else if (this.proxyType === ProxyType.COMPONENT) {
            this.getNativeNode().replaceChild(newNode.getNativeNode(), oldNode.getNativeNode());
        }

        ///
        oldNode.removedHook();
        let index = this.childNodes.indexOf(oldNode);
        oldNode.parentNode = undefined;
        newNode.parentNode = this;
        this.childNodes[index] = newNode;
        newNode.addedHook();
    }

    insertBefore(newNode: NodeProxy, insertTo: NodeProxy | null, recycle = false) {

        if (insertTo) {
            let index = this.childNodes.indexOf(insertTo);
            newNode.parentNode = this;
            this.childNodes.splice(index, 0, newNode);
        } else {
            newNode.parentNode = this;
            this.childNodes.push(newNode);
        }

        ///
        if (this.proxyType === ProxyType.NATIVE) {
            (this.element as HTMLElement).insertBefore(newNode.getNativeNode(), insertTo && insertTo.getNativeNode());
        } else if (this.proxyType === ProxyType.COMPONENT) {
            this.getNativeNode().replaceChild(newNode.getNativeNode(), insertTo && insertTo.getNativeNode());
        }

        if (!recycle) {
            newNode.addedHook();
        }

    }

    getAttrOfNative(propName: string): any {
        let element: HTMLElement = this.element;
        if (element.hasAttribute(propName)) {
            return element.getAttribute(propName);
        } else {
            return element[propName];
        }
    }

    setAttrOfNative(propName: string, propValue: any, previous?: any) {
        let element: HTMLElement = this.element;

        let event = getEventNameOfNative(propName);
        if (event) {
            if (previous && previous[propName]) {
                element.removeEventListener(event.name, previous[propName]);
            }
            element.addEventListener(event.name, propValue);
            return;
        }

        if (this.vNodeType === VNodeType.NativeNode) {
            // ref: https://javascript.info/dom-attributes-and-properties
            if (element.hasAttribute(propName)) {
                element.setAttribute(propName, propValue);
            } else {
                if (propName === 'style' && typeof propValue === 'string') {
                    element.style.cssText = propValue;
                } else {
                    element[propName] = propValue;
                }
            }

        } else if (this.vNodeType === VNodeType.NativeText) {
            if ((element as any).nodeValue != propValue) {// element is Text
                (element as any).nodeValue = propValue;
            }
        }
    }

    setComponentProps(props, previous?: any) {
        (this.element as Component).setProps(props);
    }

    setObjAttrOfNative(propName: string, propValue: any, previous?: any) {
        let element = (this.element as HTMLElement);
        for (let k in propValue) {
            let value = propValue[k];
            element[propName][k] = value;
        }
    }

    removeAttrOfNative(propName: string, previous?: any) {
        let element: HTMLElement = this.element;

        let event = getEventNameOfNative(propName);
        if (event) {
            if (previous && previous[propName]) {
                element.removeEventListener(event.name, previous[propName]);
            }
        } else {
            if (element.hasAttribute(propName)) {
                element.removeAttribute(propName);
            } else {
                element[propName] = undefined;
            }
        }
    }

    // ref
    setRef(newRef: IRefType) {
        this.ref = newRef;
    }

    // commands
    setCmds(newCmds: ICmdsType) {
        this.cmds = newCmds;
    }

    private removeCmds() {
        if (this.cmds) {
            for (let cmdName in this.cmds) {
                let cmdValue = this.cmds[cmdName];
                const cmd = getCommand(cmdName);
                if (cmd && cmd.bind) {
                    cmd.unbind(this.getNativeNode(), cmdValue);
                }
            }
        }
    }

    addCmd(cmdName: string, cmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.bind) {
            cmd.bind(this.getNativeNode(), cmdValue);
        }
    }

    removeCmd(cmdName: string, previousCmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.unbind) {
            cmd.unbind(this.getNativeNode(), previousCmdValue);
        }
    }

    updateCmd(cmdName: string, cmdValue: any, previousCmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.update) {
            cmd.update(this.getNativeNode(), cmdValue, previousCmdValue);
        }
    }

    // ons
    addOn(onName: string, onValue: any) {
        if (this.proxyType === ProxyType.NATIVE) {
            (this.element as HTMLElement).addEventListener(onName, onValue);
        } else {
            (this.element as Component).on(onName, onValue);
        }
    }

    removeOn(onName: string, previousOnValue: any) {
        if (this.proxyType === ProxyType.NATIVE) {
            (this.element as HTMLElement).removeEventListener(onName, previousOnValue[onName]);
        } else {
            (this.element as Component).off(onName, previousOnValue[onName]);
        }
    }

    updateOn(onName: string, onValue: any, previousOnValue: any) {
        this.removeOn(onName, previousOnValue);
        this.addOn(onName, onValue);
    }

}

export function createNodeProxy(vnode: VNode): NodeProxy {
    return new NodeProxy(vnode);
}
