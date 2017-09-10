import { ITagType, VNode } from "./vnode";
import { Component } from "./component";
import { textNodeTagName } from "./h";

export enum RNodeType {
    NATIVE = 'NATIVE',
    COMPONENT = 'COMPONENT',
}
export interface IRNode {
    vNode: VNode;
    parentNode: IRNode;
    childNodes: IRNode[];

    element: any;
    rNodeType: RNodeType;

    getElement(): HTMLElement;

    appendChild: (x: IRNode) => void;
    removeChild: (x: IRNode) => void;
    replaceChild: (newNode: IRNode, oldNode: IRNode) => void;
    insertBefore: (newNode: IRNode, insertTo: IRNode | null) => void;

    setAttribute: (propName: string, propValue: any, previous?: any) => void;
    setAttributeObject: (propName: string, propValue: any, previous?: any) => void;
    removeAttribute: (propName: string, previous?: any) => void;
}


/**
 * RNodeProxy is a Proxy
 */
export class RNodeProxy implements IRNode {
    parentNode: IRNode = null
    childNodes: IRNode[] = [];

    rNodeType: RNodeType;
    element: any;

    getElement(): HTMLElement {
        if (this.rNodeType === RNodeType.NATIVE) {
            return (<HTMLElement>this.element);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            return this.componentGetElement();
        } else {
            throw new Error('未知类型');
        }
    }

    private componentGetElement(): HTMLElement {
        return (<Component>this.element).getRNode().getElement();
    }

    constructor(public vNode: VNode) {
        if (typeof (vNode.tagName) === 'string') {
            this.rNodeType = RNodeType.NATIVE;
            this.element = this.createHTMLByVNode(vNode);
        } else if (typeof (vNode.tagName) === 'function') {
            this.rNodeType = RNodeType.COMPONENT;
            this.element = this.createComponentByVNode(vNode);
        } else {
            throw new Error('tagName 只能是string 或 Component的子类构造函数');
        }
    }

    private createHTMLByVNode(vNode: VNode) {
        if (vNode.tagName === textNodeTagName) {
            return <Text>(document.createTextNode(vNode.properties.value));
        } else {
            return <HTMLElement>(document.createElement(vNode.tagName));
        }
    }

    private createComponentByVNode(vNode: VNode): Component {
        let Consr = vNode.tagName;
        let com: Component = new Consr(vNode.properties);
        if (!(com instanceof Component)) {
            throw new Error('tagName 不是 Component的子类构造函数');
        }
        return com;
    }

    appendChild(x: IRNode) {
        x.parentNode = this;
        this.childNodes.push(x);
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.htmlAppendChild(x);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentAppendChild(x);
        }
    }

    private htmlAppendChild(x: IRNode) {
        (this.element as HTMLElement).appendChild(x.getElement());
    }
    private componentAppendChild(x: IRNode) {
        this.getElement().appendChild(x.getElement());
    }

    removeChild(x: IRNode) {
        let index = this.childNodes.indexOf(x);
        if (~index) {
            x.parentNode = null;
            this.childNodes.splice(index, 1);
        } else {
            throw Error('被移除的节点没找到,是否是算法错误');
        }
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.htmlRemoveChild(x);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentRemoveChild(x);
        }
    }

    private htmlRemoveChild(x: IRNode) {
        (this.element as HTMLElement).removeChild(x.getElement());
    }
    private componentRemoveChild(x: IRNode) {
        this.getElement().removeChild(x.getElement());
    }

    replaceChild(newNode: IRNode, oldNode: IRNode) {
        let index = this.childNodes.indexOf(oldNode);
        if (~index) {
            oldNode.parentNode = null;
            newNode.parentNode = this;
            this.childNodes.splice(index, 1, newNode);
        } else {
            throw Error('被替换的节点没找到,是否是算法错误');
        }
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.htmlReplaceChild(newNode, oldNode);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentReplaceChild(newNode, oldNode);
        }
    }

    private htmlReplaceChild(newNode: IRNode, oldNode: IRNode) {
        (this.element as HTMLElement).replaceChild(newNode.getElement(), oldNode.getElement());
    }
    private componentReplaceChild(newNode: IRNode, oldNode: IRNode) {
        this.getElement().replaceChild(newNode.getElement(), oldNode.getElement());
    }

    insertBefore(newNode: IRNode, insertTo: IRNode | null) {
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
            this.htmlInsertBefore(newNode, insertTo);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentInsertBefore(newNode, insertTo);
        }
    }

    private htmlInsertBefore(newNode: IRNode, insertTo: IRNode | null) {
        (this.element as HTMLElement).insertBefore(newNode.getElement(), insertTo && insertTo.getElement());
    }
    private componentInsertBefore(newNode: IRNode, insertTo: IRNode | null) {
        this.getElement().replaceChild(newNode.getElement(), insertTo && insertTo.getElement());
    }

    setAttribute(propName: string, propValue: any, previous?: any) {
        this[propName] = propValue;
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.htmlSetAttribute(propName, propValue, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentSetAttribute(propName, propValue, previous);
        }
    }

    private htmlSetAttribute(propName: string, propValue: any, previous?: any) {
        if (this.element.setAttribute) {
            if (propName === 'style' && typeof propValue === 'string') {
                (this.element as HTMLElement).style.cssText = propValue;
            } else {
                (this.element as HTMLElement).setAttribute(propName, propValue);
            }
        }
    }
    private componentSetAttribute(propName: string, propValue: any, previous?: any) {
        this.getElement().setAttribute(propName, propValue);
    }

    setAttributeObject(propName: string, propValue: any, previous?: any) {
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k]
            this[propName][k] = (value === undefined) ? replacer : value
        }

        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.htmlSetAttributeObject(propName, propValue, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentSetAttributeObject(propName, propValue, previous);
        }

    }

    private htmlSetAttributeObject(propName: string, propValue: any, previous?: any) {
        let replacer = undefined;
        let element = (this.element as HTMLElement);
        if (propName === 'style') {
            for (let k in propValue) {
                let value = propValue[k]
                element.style[k] = (value === undefined) ? replacer : value
            }
        } else {
            for (let k in propValue) {
                let value = propValue[k]
                element[propName][k] = (value === undefined) ? replacer : value
            }
        }
    }
    private componentSetAttributeObject(propName: string, propValue: any, previous?: any) {
        let replacer = undefined;
        let element = (this.getElement() as HTMLElement);
        if (propName === 'style') {
            for (let k in propValue) {
                let value = propValue[k]
                element.style[k] = (value === undefined) ? replacer : value
            }
        } else {
            for (let k in propValue) {
                let value = propValue[k]
                element[propName][k] = (value === undefined) ? replacer : value
            }
        }
    }

    removeAttribute(propName: string, previous?: any) {
        this[propName] = null;
        ///
        if (this.rNodeType === RNodeType.NATIVE) {
            this.htmlRemoveAttribute(propName, previous);
        } else if (this.rNodeType === RNodeType.COMPONENT) {
            this.componentRemoveAttribute(propName, previous);
        }
    }

    private htmlRemoveAttribute(propName: string, previous?: any) {
        (this.element as HTMLElement).removeAttribute(propName);
    }
    private componentRemoveAttribute(propName: string, previous?: any) {
        this.getElement().removeAttribute(propName);
    }

}

export function createRNodeProxyByVNode(vnode: VNode): IRNode {
    return new RNodeProxy(vnode);
}
