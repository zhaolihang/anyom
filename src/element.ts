import { ITagType, VNode, VNodeType, ICommandsType } from "./vnode";
import { Component } from "./component";
import { startsWith, endsWith } from "./utils";
import { LifeCycleType } from "./lifecycle";
import { getCommand } from "./commands";

export enum RealNodeType {
    NATIVE = 'NATIVE',
    COMPONENT = 'COMPONENT',
}

/**
 * RealNodeProxy is a Proxy
 */
export class RealNodeProxy {

    parentNode: RealNodeProxy = null;
    childNodes: RealNodeProxy[] = [];

    vNodeType: VNodeType = VNodeType.None;
    realNodeType: RealNodeType;
    element: any;
    ref: string;
    commands: ICommandsType;

    constructor(vNode: VNode, public context?: Component) {
        this.vNodeType = vNode.type;
        this.createElement(vNode)
    }

    private createElement(vNode: VNode) {
        if (this.vNodeType === VNodeType.Component) {
            this.realNodeType = RealNodeType.COMPONENT;
            this.element = this.createComponent(vNode);
        } else {
            this.realNodeType = RealNodeType.NATIVE;
            this.element = this.createNativeNode(vNode);
        }
    }

    private createNativeNode(vNode: VNode) {
        if (this.vNodeType === VNodeType.Text) {
            return <Text>(document.createTextNode(vNode.properties.value));
        } else if (this.vNodeType === VNodeType.Node) {
            let realNode = <HTMLElement>(document.createElement(vNode.tagName));
            return realNode;
        } else {
            throw new Error('类型错误');
        }
    }

    private createComponent(vNode: VNode): Component {
        let Consr: typeof Component = vNode.tagName;
        let com: Component = new Consr(vNode.properties);
        if (!(com instanceof Component)) {
            throw new Error('tagName 不是 Component的子类构造函数');
        }
        if (typeof com[LifeCycleType.Created] === 'function') {
            com[LifeCycleType.Created]();
        }
        return com;
    }

    getNativeNode<T = HTMLElement>(): T {
        if (this.realNodeType === RealNodeType.NATIVE) {
            return (<T>this.element);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            return (<Component>this.element).getRealNodeProxy().getNativeNode();
        }
        throw new Error('未知类型');
    }

    appendChild(x: RealNodeProxy) {
        x.parentNode = this;
        this.childNodes.push(x);

        ///
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.nativeNodeAppendChild(x);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentAppendChild(x);
        }

        //
        if (x.realNodeType === RealNodeType.COMPONENT) {
            let com: Component = x.element;
            if (typeof com[LifeCycleType.Mounted] === 'function') {
                com[LifeCycleType.Mounted]();
            }
        }
    }

    private nativeNodeAppendChild(x: RealNodeProxy) {
        (this.element as HTMLElement).appendChild(x.getNativeNode());
    }

    private componentAppendChild(x: RealNodeProxy) {
        this.getNativeNode().appendChild(x.getNativeNode());
    }

    removeChild(x: RealNodeProxy, recycle = false) {

        if (this.realNodeType === RealNodeType.NATIVE) {
            this.nativeNodeRemoveChild(x);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentRemoveChild(x);
        }

        ///
        let index = this.childNodes.indexOf(x);
        if (~index) {
            x.parentNode = null;
            this.childNodes.splice(index, 1);
        } else {
            throw Error('被移除的节点没找到,是否是算法错误');
        }

        if (!recycle) {
            x.removeCommands();
            x.setRef(undefined, x.ref);
            //
            if (x.realNodeType === RealNodeType.COMPONENT) {
                let com: Component = x.element;
                if (typeof com[LifeCycleType.UnMounted] === 'function') {
                    com[LifeCycleType.UnMounted]();
                }
            }
        }

    }

    private nativeNodeRemoveChild(x: RealNodeProxy) {
        (this.element as HTMLElement).removeChild(x.getNativeNode());
    }

    private componentRemoveChild(x: RealNodeProxy) {
        this.getNativeNode().removeChild(x.getNativeNode());
    }

    replaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.nativeNodeReplaceChild(newNode, oldNode);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentReplaceChild(newNode, oldNode);
        }

        ///
        let index = this.childNodes.indexOf(oldNode);
        if (~index) {
            oldNode.parentNode = null;
            newNode.parentNode = this;
            this.childNodes.splice(index, 1, newNode);
        } else {
            throw new Error('被替换的节点没找到,是否是算法错误');
        }

        oldNode.setRef(undefined, oldNode.ref);
        oldNode.removeCommands();
        //
        if (newNode.realNodeType === RealNodeType.COMPONENT) {
            let com: Component = newNode.element;
            if (typeof com[LifeCycleType.Mounted] === 'function') {
                com[LifeCycleType.Mounted]();
            }
        }

        if (oldNode.realNodeType === RealNodeType.COMPONENT) {
            let com: Component = oldNode.element;
            if (typeof com[LifeCycleType.UnMounted] === 'function') {
                com[LifeCycleType.UnMounted]();
            }
        }
    }

    private nativeNodeReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        (this.element as HTMLElement).replaceChild(newNode.getNativeNode(), oldNode.getNativeNode());
    }

    private componentReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        this.getNativeNode().replaceChild(newNode.getNativeNode(), oldNode.getNativeNode());
    }

    insertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null, recycle = false) {

        if (insertTo) {
            let index = this.childNodes.indexOf(insertTo);
            if (~index) {
                newNode.parentNode = this;
                this.childNodes.splice(index, 0, newNode);
            } else {
                throw Error('要插入的位置节点没找到,是否是算法错误');
            }
        } else {
            newNode.parentNode = this;
            this.childNodes.push(newNode);
        }

        ///
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.nativeNodeInsertBefore(newNode, insertTo);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentInsertBefore(newNode, insertTo);
        }

        if (!recycle) {
            if (newNode.realNodeType === RealNodeType.COMPONENT) {
                let com: Component = newNode.element;
                if (typeof com[LifeCycleType.Mounted] === 'function') {
                    com[LifeCycleType.Mounted]();
                }
            }
        }

    }

    private nativeNodeInsertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {
        (this.element as HTMLElement).insertBefore(newNode.getNativeNode(), insertTo && insertTo.getNativeNode());
    }

    private componentInsertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {
        this.getNativeNode().replaceChild(newNode.getNativeNode(), insertTo && insertTo.getNativeNode());
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
            if (!(typeof propValue === 'function')) {
                throw new Error('事件的值必须是函数');
            }
            element.addEventListener(event.name, propValue, event.capture);
            return;
        }

        if (this.vNodeType === VNodeType.Node) {
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

        } else if (this.vNodeType === VNodeType.Text) {
            if ((element as any).nodeValue != propValue) {// element is Text
                (element as any).nodeValue = propValue;
            }
        } else {
            throw new Error('类型错误');
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

    addCommand(cmdName: string, cmdValue: any) {
        this.commands = this.commands || {};
        this.commands[cmdName] = cmdValue;
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
        ///
        delete this.commands[cmdName];
        if (Object.keys(this.commands).length === 0) {
            this.commands = undefined;
        }
    }

    updateCommand(cmdName: string, cmdValue: any, previousCmdValue: any) {
        const cmd = getCommand(cmdName);
        if (cmd && cmd.update) {
            cmd.update(this.getNativeNode(), cmdValue, previousCmdValue);
        }
        ///
        this.commands[cmdName] = cmdValue;
    }

    private getNativeNodeEventName(propName: string) {
        //propName eg: 'on-click-capture'
        propName = propName.toLowerCase();
        if (startsWith(propName, 'on-')) {
            if (endsWith(propName, '-capture')) {
                return { name: propName.substring(3, propName.length - 1 - 8), capture: true };
            } else {
                return { name: propName.substring(3), capture: false };
            }
        }
    }

}

export function createRealNodeProxy(vnode: VNode, context: Component): RealNodeProxy {
    return new RealNodeProxy(vnode, context);
}
