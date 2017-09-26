import { ITagName, VNode, VNodeType, ICommandsType } from "./vnode";
import { Component, LifeCycleType } from "./component";
import { startsWith, endsWith } from "./utils";
import { getCommand } from "./commands";

export enum NodeProxyType {
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
    proxyType: NodeProxyType;
    element: any;
    ref: string;
    commands: ICommandsType;

    constructor(vNode: VNode, public context?: Component) {
        this.vNodeType = vNode.type;
        if (this.vNodeType === VNodeType.Component) {
            this.proxyType = NodeProxyType.COMPONENT;
            this.element = this.createComponent(vNode);
        } else {
            this.proxyType = NodeProxyType.NATIVE;
            this.element = this.createNativeNode(vNode);
        }
    }

    private createNativeNode(vNode: VNode) {
        if (this.vNodeType === VNodeType.NativeText) {
            return <Text>(document.createTextNode(vNode.props.value));
        } else if (this.vNodeType === VNodeType.NativeNode) {
            let nativeNode = <HTMLElement>(document.createElement(vNode.tagName));
            return nativeNode;
        }
    }

    private createComponent(vNode: VNode): Component {
        let Consr: typeof Component = vNode.tagName;
        let com: Component = new Consr(vNode.props);
        com[LifeCycleType.Created] && com[LifeCycleType.Created]();
        return com;
    }

    getNativeNode<T = HTMLElement>(): T {
        if (this.proxyType === NodeProxyType.NATIVE) {
            return (<T>this.element);
        } else if (this.proxyType === NodeProxyType.COMPONENT) {
            return (<Component>this.element).getNodeProxy().getNativeNode();
        }
    }

    appendChild(x: NodeProxy) {
        x.parentNode = this;
        this.childNodes.push(x);

        ///
        if (this.proxyType === NodeProxyType.NATIVE) {
            (this.element as HTMLElement).appendChild(x.getNativeNode());
        } else if (this.proxyType === NodeProxyType.COMPONENT) {
            this.getNativeNode().appendChild(x.getNativeNode());
        }

        //
        if (x.proxyType === NodeProxyType.COMPONENT) {
            let com: Component = x.element;
            com[LifeCycleType.Mounted] && com[LifeCycleType.Mounted]();
        }
    }

    removeChild(x: NodeProxy, recycle = false) {

        if (!recycle) {
            x.removeCommands();
            x.setRef(undefined, x.ref);
        }

        if (this.proxyType === NodeProxyType.NATIVE) {
            (this.element as HTMLElement).removeChild(x.getNativeNode());
        } else if (this.proxyType === NodeProxyType.COMPONENT) {
            this.getNativeNode().removeChild(x.getNativeNode());
        }

        ///
        let index = this.childNodes.indexOf(x);
        x.parentNode = undefined;
        this.childNodes.splice(index, 1);

        if (!recycle) {
            //
            if (x.proxyType === NodeProxyType.COMPONENT) {
                let com: Component = x.element;
                com[LifeCycleType.UnMounted] && com[LifeCycleType.UnMounted]();
            }
        }

    }

    replaceChild(newNode: NodeProxy, oldNode: NodeProxy) {

        oldNode.setRef(undefined, oldNode.ref);
        oldNode.removeCommands();

        if (this.proxyType === NodeProxyType.NATIVE) {
            (this.element as HTMLElement).replaceChild(newNode.getNativeNode(), oldNode.getNativeNode());
        } else if (this.proxyType === NodeProxyType.COMPONENT) {
            this.getNativeNode().replaceChild(newNode.getNativeNode(), oldNode.getNativeNode());
        }

        ///
        let index = this.childNodes.indexOf(oldNode);
        oldNode.parentNode = undefined;
        newNode.parentNode = this;
        this.childNodes.splice(index, 1, newNode);

        //
        if (newNode.proxyType === NodeProxyType.COMPONENT) {
            let com: Component = newNode.element;
            com[LifeCycleType.Mounted] && com[LifeCycleType.Mounted]();
        }

        if (oldNode.proxyType === NodeProxyType.COMPONENT) {
            let com: Component = oldNode.element;
            com[LifeCycleType.UnMounted] && com[LifeCycleType.UnMounted]();
        }
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
        if (this.proxyType === NodeProxyType.NATIVE) {
            (this.element as HTMLElement).insertBefore(newNode.getNativeNode(), insertTo && insertTo.getNativeNode());
        } else if (this.proxyType === NodeProxyType.COMPONENT) {
            this.getNativeNode().replaceChild(newNode.getNativeNode(), insertTo && insertTo.getNativeNode());
        }

        if (!recycle) {
            if (newNode.proxyType === NodeProxyType.COMPONENT) {
                let com: Component = newNode.element;
                com[LifeCycleType.Mounted] && com[LifeCycleType.Mounted]();
            }
        }

    }

    getNativeNodeAttribute(propName: string): any {
        let element: HTMLElement = this.element;
        if (element.hasAttribute(propName)) {
            return element.getAttribute(propName);
        } else {
            return element[propName];
        }
    }

    setNativeNodeAttribute(propName: string, propValue: any, previous?: any) {
        let element: HTMLElement = this.element;

        let event = this.getNativeNodeEventName(propName);
        if (event) {
            if (previous && previous[propName]) {
                element.removeEventListener(event.name, previous[propName], event.capture);
            }
            element.addEventListener(event.name, propValue, event.capture);
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

    setNativeNodeObjectAttribute(propName: string, propValue: any, previous?: any) {
        let element = (this.element as HTMLElement);
        for (let k in propValue) {
            let value = propValue[k];
            element[propName][k] = value;
        }
    }

    removeNativeNodeAttribute(propName: string, previous?: any) {
        let element: HTMLElement = this.element;

        let event = this.getNativeNodeEventName(propName);
        if (event) {
            if (previous && previous[propName]) {
                element.removeEventListener(event.name, previous[propName], event.capture);
            }
        } else {
            if (element.hasAttribute(propName)) {
                element.removeAttribute(propName);
            } else {
                element[propName] = undefined;
            }
        }
    }

    setRef(newRef: string, previousRef?: string) {
        if (this.context) {
            if (previousRef) {
                if (this.context.refs[previousRef] === this.element) {
                    delete this.context.refs[previousRef];
                }
            }
            if (newRef) {
                this.context.refs[newRef] = this.element;
            }
        }
        this.ref = newRef;
    }

    removeCommands() {
        if (this.commands) {
            for (let cmdName in this.commands) {
                let cmdValue = this.commands[cmdName];
                const cmd = getCommand(cmdName);
                if (cmd && cmd.bind) {
                    cmd.unbind(this.getNativeNode(), cmdValue);
                }
            }
        }
    }

    setCommands(newCommands: ICommandsType) {
        this.commands = newCommands;
    }

    addCommand(cmdName: string, cmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.bind) {
            cmd.bind(this.getNativeNode(), cmdValue);
        }
    }

    removeCommand(cmdName: string, previousCmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.unbind) {
            cmd.unbind(this.getNativeNode(), previousCmdValue);
        }
    }

    updateCommand(cmdName: string, cmdValue: any, previousCmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.update) {
            cmd.update(this.getNativeNode(), cmdValue, previousCmdValue);
        }
    }

    private getNativeNodeEventName(propName: string) {
        //propName eg: 'on-click-capture'
        if (startsWith(propName, 'on-')) {
            if (endsWith(propName, '-capture')) {
                return { name: propName.substring(3, propName.length - 9), capture: true };
            } else {
                return { name: propName.substring(3), capture: false };
            }
        }
    }

}

export function createNodeProxy(vnode: VNode, context: Component): NodeProxy {
    return new NodeProxy(vnode, context);
}
