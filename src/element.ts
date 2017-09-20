import { ITagType, VNode } from "./vnode";
import { Component } from "./component";
import { TextNodeTagName } from "./h";
import { startsWith, endsWith } from "./utils";

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

    constructor(public vNode: VNode) {
        this.createElement()
    }

    private createElement() {
        let vNode = this.vNode;
        if (typeof (vNode.tagName) === 'string') {
            this.realNodeType = RealNodeType.NATIVE;
            this.element = this.createRealNode(vNode);
        } else if (typeof (vNode.tagName) === 'function') {
            this.realNodeType = RealNodeType.COMPONENT;
            this.element = this.createComponent(vNode);
        } else {
            throw new Error('tagName 只能是string 或 Component的子类构造函数');
        }
    }

    private createRealNode(vNode: VNode) {
        if (vNode.tagName === TextNodeTagName) {
            return <Text>(document.createTextNode(vNode.properties.value));
        } else {
            let realNode = <HTMLElement>(document.createElement(vNode.tagName));
            return realNode;
        }
    }

    private createComponent(vNode: VNode): Component {
        let Consr: typeof Component = vNode.tagName;
        let com: Component = new Consr(vNode.properties);
        if (!(com instanceof Component)) {
            throw new Error('tagName 不是 Component的子类构造函数');
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

    }

    private realNodeAppendChild(x: RealNodeProxy) {
        (this.element as HTMLElement).appendChild(x.getRealNode());
    }

    private componentAppendChild(x: RealNodeProxy) {
        this.getRealNode().appendChild(x.getRealNode());
    }

    removeChild(x: RealNodeProxy, reorder = false) {

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
    }

    private realNodeReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        (this.element as HTMLElement).replaceChild(newNode.getRealNode(), oldNode.getRealNode());
    }

    private componentReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        this.getRealNode().replaceChild(newNode.getRealNode(), oldNode.getRealNode());
    }

    insertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null, reorder = false) {

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

        if (element.setAttribute) {
            if (propName === 'style' && typeof propValue === 'string') {
                element.style.cssText = propValue;
            } else {
                if (typeof propValue === 'object') {
                    element[propName] = propValue;
                } else {
                    element.setAttribute(propName, propValue);
                }
            }
        } else {
            if (element instanceof Text) {
                if ((element as Text).nodeValue != propValue) {
                    (element as Text).nodeValue = propValue;
                }
            }
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
            if (previous && previous[propName] && typeof previous[propName] === 'object') {
                element[propName] = undefined;
            } else {
                element.removeAttribute(propName);
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

export function createRealNodeProxy(vnode: VNode): RealNodeProxy {
    return new RealNodeProxy(vnode);
}
