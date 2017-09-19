import { ITagType, VNode } from "./vnode";
import { Component } from "./component";
import { TextNodeTagName } from "./h";
import { startsWith, endsWith } from "./utils";

export enum RNodeType {
    NATIVE = 'NATIVE',
    COMPONENT = 'COMPONENT',
}

/**
 * RealNodeProxy is a Proxy
 */
export class RealNodeProxy {

    parentNode: RealNodeProxy = null;
    childNodes: RealNodeProxy[] = [];

    rNodeType: RNodeType;
    element: any;

    constructor(public vNode: VNode) {

        if (typeof (vNode.tagName) === 'string') {
            this.rNodeType = RNodeType.NATIVE;
            this.element = this.createXOMByVNode(vNode);
        } else if (typeof (vNode.tagName) === 'function') {
            this.rNodeType = RNodeType.COMPONENT;
            this.element = this.createComponentByVNode(vNode);
        } else {
            throw new Error('tagName 只能是string 或 Component的子类构造函数');
        }

    }

    private createXOMByVNode(vNode: VNode) {
        if (vNode.tagName === TextNodeTagName) {
            return <Text>(document.createTextNode(vNode.properties.value));
        } else {
            let xomElement = <HTMLElement>(document.createElement(vNode.tagName));
            return xomElement;
        }
    }

    private createComponentByVNode(vNode: VNode): Component {
        let Consr: typeof Component = vNode.tagName;
        let com: Component = new Consr(vNode.properties);
        if (!(com instanceof Component)) {
            throw new Error('tagName 不是 Component的子类构造函数');
        }
        return com;
    }

    getElement(): HTMLElement {
        if (this.rNodeType === RNodeType.NATIVE) {
            return (<HTMLElement>this.element);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            return (<Component>this.element).getRealNode().getElement();
        }
        throw new Error('未知类型');
    }

    appendChild(x: RealNodeProxy) {
        x.parentNode = this;
        this.childNodes.push(x);

        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomAppendChild(x);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentAppendChild(x);
        }

    }

    private xomAppendChild(x: RealNodeProxy) {
        (this.element as HTMLElement).appendChild(x.getElement());
    }

    private componentAppendChild(x: RealNodeProxy) {
        this.getElement().appendChild(x.getElement());
    }

    removeChild(x: RealNodeProxy) {

        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomRemoveChild(x);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
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

    private xomRemoveChild(x: RealNodeProxy) {
        (this.element as HTMLElement).removeChild(x.getElement());
    }

    private componentRemoveChild(x: RealNodeProxy) {
        this.getElement().removeChild(x.getElement());
    }

    replaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomReplaceChild(newNode, oldNode);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
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

    private xomReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        (this.element as HTMLElement).replaceChild(newNode.getElement(), oldNode.getElement());
    }

    private componentReplaceChild(newNode: RealNodeProxy, oldNode: RealNodeProxy) {
        this.getElement().replaceChild(newNode.getElement(), oldNode.getElement());
    }

    insertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {

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
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomInsertBefore(newNode, insertTo);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentInsertBefore(newNode, insertTo);
        }

    }

    private xomInsertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {
        (this.element as HTMLElement).insertBefore(newNode.getElement(), insertTo && insertTo.getElement());
    }

    private componentInsertBefore(newNode: RealNodeProxy, insertTo: RealNodeProxy | null) {
        this.getElement().replaceChild(newNode.getElement(), insertTo && insertTo.getElement());
    }


    getAttribute(propName: string): any {
        return this[propName];
    }

    setAttribute(propName: string, propValue: any, previous?: any) {
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomSetAttribute(propName, propValue, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentSetAttribute(propName, propValue, previous);
        }

        this[propName] = propValue;
    }

    private xomSetAttribute(propName: string, propValue: any, previous?: any) {

        let element: HTMLElement = this.element;

        let event = this.getXOMEventName(propName);
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

    setAttributeObject(propName: string, propValue: any, previous?: any) {
        for (let k in propValue) {
            let value = propValue[k];
            this[propName][k] = value;
        }

        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomSetAttributeObject(propName, propValue, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentSetAttributeObject(propName, propValue, previous);
        }
    }

    private xomSetAttributeObject(propName: string, propValue: any, previous?: any) {

        let element = (this.element as HTMLElement);
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k];
            element[propName][k] = value;
        }

    }

    private componentSetAttributeObject(propName: string, propValue: any, previous?: any) {
        (this.element as Component).setAttributeObject(propName, propValue, previous);
    }

    removeAttribute(propName: string, previous?: any) {
        if (this.rNodeType === RNodeType.NATIVE) {
            this.xomRemoveAttribute(propName, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentRemoveAttribute(propName, previous);
        }

        ///
        delete this[propName];
    }

    private xomRemoveAttribute(propName: string, previous?: any) {
        let element: HTMLElement = this.element;

        let event = this.getXOMEventName(propName);
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

    private getXOMEventName(propName: string) {
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

export function createRealNodeProxyByVNode(vnode: VNode): RealNodeProxy {
    return new RealNodeProxy(vnode);
}
