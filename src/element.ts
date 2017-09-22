import { ITagType, VNode, VNodeType } from "./vnode";
import { Component } from "./component";
import { startsWith, endsWith } from "./utils";
import { LifeCycleType } from "./lifecycle";

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

    realNodeType: RealNodeType;
    element: any;

    constructor(public vNode: VNode, public context?: Component) {
        this.createElement()
    }

    private createElement() {
        let vNode = this.vNode;
        if (vNode.type === VNodeType.Component) {
            this.realNodeType = RealNodeType.COMPONENT;
            this.element = this.createComponent();
        } else {
            this.realNodeType = RealNodeType.NATIVE;
            this.element = this.createRealNode();
        }
        if (this.context && this.vNode.ref) {
            this.context.refs[this.vNode.ref] = this.element;
        }
    }

    private createRealNode() {
        let vNode = this.vNode;
        if (vNode.type === VNodeType.Text) {
            return <Text>(document.createTextNode(vNode.properties.value));
        } else if (vNode.type === VNodeType.Node) {
            let realNode = <HTMLElement>(document.createElement(vNode.tagName));
            return realNode;
        } else {
            throw new Error('类型错误');
        }
    }

    private createComponent(): Component {
        let vNode = this.vNode;
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

    getRealNode<T = HTMLElement>(): T {
        if (this.realNodeType === RealNodeType.NATIVE) {
            return (<T>this.element);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            return (<Component>this.element).getRealNodeProxy().getRealNode();
        }
        throw new Error('未知类型');
    }

    appendChild(x: RealNodeProxy) {
        x.parentNode = this;
        this.childNodes.push(x);

        ///
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.realNodeAppendChild(x);
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

    private realNodeAppendChild(x: RealNodeProxy) {
        (this.element as HTMLElement).appendChild(x.getRealNode());
    }

    private componentAppendChild(x: RealNodeProxy) {
        this.getRealNode().appendChild(x.getRealNode());
    }

    removeChild(x: RealNodeProxy, recycle = false) {

        if (this.realNodeType === RealNodeType.NATIVE) {
            this.realNodeRemoveChild(x);
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
            if (x.context && x.vNode.ref) {
                if (x.context.refs[x.vNode.ref] === x.element) {
                    delete x.context.refs[x.vNode.ref];
                }
            }
            //
            if (x.realNodeType === RealNodeType.COMPONENT) {
                let com: Component = x.element;
                if (typeof com[LifeCycleType.UnMounted] === 'function') {
                    com[LifeCycleType.UnMounted]();
                }
            }
        }


    }

    private realNodeRemoveChild(x: RealNodeProxy) {
        (this.element as HTMLElement).removeChild(x.getRealNode());
    }

    private componentRemoveChild(x: RealNodeProxy) {
        this.getRealNode().removeChild(x.getRealNode());
    }

    replaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.realNodeReplaceChild(newNode, oldNode);
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
            throw Error('被替换的节点没找到,是否是算法错误');
        }

        if (oldNode.context && oldNode.vNode.ref) {
            if (oldNode.context.refs[oldNode.vNode.ref] === oldNode.element) {
                delete oldNode.context.refs[oldNode.vNode.ref]
            }
        }

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

    private realNodeReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        (this.element as HTMLElement).replaceChild(newNode.getRealNode(), oldNode.getRealNode());
    }

    private componentReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        this.getRealNode().replaceChild(newNode.getRealNode(), oldNode.getRealNode());
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
            this.realNodeInsertBefore(newNode, insertTo);
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

    private realNodeInsertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {
        (this.element as HTMLElement).insertBefore(newNode.getRealNode(), insertTo && insertTo.getRealNode());
    }

    private componentInsertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {
        this.getRealNode().replaceChild(newNode.getRealNode(), insertTo && insertTo.getRealNode());
    }


    getAttribute(propName: string): any {
        return this[propName];
    }

    setAttribute(propName: string, propValue: any, previous?: any) {
        ///
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.realNodeSetAttribute(propName, propValue, previous);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentSetAttribute(propName, propValue, previous);
        }

        this[propName] = propValue;
    }

    private realNodeSetAttribute(propName: string, propValue: any, previous?: any) {

        let element: HTMLElement = this.element;

        let event = this.getRealNodeEventName(propName);
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

        if (this.vNode.type === VNodeType.Node) {
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

        } else if (this.vNode.type === VNodeType.Text) {
            if ((element as any).nodeValue != propValue) {// element is Text
                (element as any).nodeValue = propValue;
            }
        } else {
            throw new Error('类型错误');
        }

    }

    private componentSetAttribute(propName: string, propValue: any, previous?: any) {
        (this.element as Component).setAttribute(propName, propValue, previous);
    }

    setObjectAttribute(propName: string, propValue: any, previous?: any) {
        for (let k in propValue) {
            let value = propValue[k];
            this[propName][k] = value;
        }

        ///
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.realNodeSetObjectAttribute(propName, propValue, previous);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentSetObjectAttribute(propName, propValue, previous);
        }
    }

    private realNodeSetObjectAttribute(propName: string, propValue: any, previous?: any) {

        let element = (this.element as HTMLElement);
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k];
            element[propName][k] = value;
        }

    }

    private componentSetObjectAttribute(propName: string, propValue: any, previous?: any) {
        (this.element as Component).setAttributeObject(propName, propValue, previous);
    }

    removeAttribute(propName: string, previous?: any) {
        if (this.realNodeType === RealNodeType.NATIVE) {
            this.realNodeRemoveAttribute(propName, previous);
        } else if (this.realNodeType === RealNodeType.COMPONENT) {
            this.componentRemoveAttribute(propName, previous);
        }

        ///
        delete this[propName];
    }

    private realNodeRemoveAttribute(propName: string, previous?: any) {
        let element: HTMLElement = this.element;

        let event = this.getRealNodeEventName(propName);
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

    private componentRemoveAttribute(propName: string, previous?: any) {
        (this.element as Component).removeAttribute(propName, previous);
    }

    private getRealNodeEventName(propName: string) {
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
