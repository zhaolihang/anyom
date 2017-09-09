import { ITagType, VNode } from "./vnode";
import { Component } from "./component";
import { textNodeTagName } from "./h";

export enum RNodeType {
    NATIVE = 'NATIVE',
    IRNODE = 'IRNODE',
}
export interface IRNode {
    vNode: VNode;
    parentNode: IRNode;
    childNodes: IRNode[];
    element: HTMLElement | IRNode;
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
 * RNode is a delegate
 */
export class RNode implements IRNode {
    parentNode: IRNode = null
    childNodes: IRNode[] = [];
    element: HTMLElement | IRNode;
    rNodeType: RNodeType;
    getElement(): HTMLElement {
        if (this.rNodeType === RNodeType.NATIVE) {
            return (<HTMLElement>this.element);
        } else if (this.rNodeType === RNodeType.IRNODE) {
            return (<IRNode>this.element).getElement();
        } else {
            throw new Error('未知类型');
        }
    }
    constructor(public vNode: VNode) {
        if (typeof (vNode.tagName) === 'string') {
            this.rNodeType = RNodeType.NATIVE;
            if (vNode.tagName === textNodeTagName) {
                this.element = <any>document.createTextNode(vNode.properties.value);
            } else {
                this.element = document.createElement(vNode.tagName);
            }
        } else if (vNode.tagName instanceof Function) {
            this.rNodeType = RNodeType.IRNODE;
            let Consr = vNode.tagName;
            let com: Component = new Consr(vNode.properties);
            if (!(com instanceof Component)) {
                throw new Error('tagName 不是 Component的子类构造函数');
            }
            this.element = com.forceUpdate();
        } else {
            throw new Error('tagName 只能是string 或 Component的子类构造函数');
        }
    }
    appendChild(x: IRNode) {
        x.parentNode = this;
        this.childNodes.push(x);
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
        if (insertTo) {
            this.getElement().insertBefore(newNode.getElement(), insertTo.getElement());
        } else {
            this.getElement().appendChild(newNode.getElement());
        }
    }

    setAttribute(propName: string, propValue: any, previous?: any) {
        this[propName] = propValue;
        this.element.setAttribute && (this.element as any).setAttribute(propName, propValue, previous);
    }

    setAttributeObject(propName: string, propValue: any, previous?: any) {
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k]
            this[propName][k] = (value === undefined) ? replacer : value
        }

        for (let k in propValue) {
            let value = propValue[k]
            this.element[propName][k] = (value === undefined) ? replacer : value
        }
    }

    removeAttribute(propName: string, previous?: any) {
        this[propName] = null;
        this.element.removeAttribute(propName);
    }

}

export function createRNodeByVNode(vnode: VNode): IRNode {
    return new RNode(vnode);
}
