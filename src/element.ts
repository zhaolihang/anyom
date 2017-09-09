
import { IRNode, ITagType, VNode } from "./vnode";
import { Component } from "./component";

enum RNodeType {
    NATIVE = 'NATIVE',
    COMPONENT = 'COMPONENT',
}
export class RNode implements IRNode {
    parentNode: IRNode = null
    childNodes: IRNode[] = [];
    element: any;
    rNodeType: RNodeType;
    constructor(public vNode: VNode) {
        if (typeof(vNode.tagName) === 'string') {
            this.rNodeType = RNodeType.NATIVE;
            this.element = { tagName: vNode.tagName, properties: vNode.properties };
        } else if (vNode.tagName instanceof Function) {
            this.rNodeType = RNodeType.COMPONENT;
            let Consr = vNode.tagName;
            let com: Component = new Consr(vNode.properties);
            if (!(com instanceof Component)) {
                throw Error('tagName 不是 Component的子类');
            }
            com.forceUpdate();
            this.element = com;
        } else {
            throw Error('tagName 只能是string 或 Component的子类构造函数');
        }
    }
    appendChild(x: IRNode) {
        x.parentNode = this;
        this.childNodes.push(x);
    }

    removeChild(x: IRNode) {
        let index = this.childNodes.indexOf(x);
        if (~index) {
            x.parentNode = null;
            this.childNodes.splice(index, 1);
        } else {
            throw Error('被移除的节点没找到,是否是算法错误');
        }
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
    }

    setAttribute(propName: string, propValue: any, previous?: any) {
        this[propName] = propValue;
    }

    setAttributeObject(propName: string, propValue: any, previous?: any) {
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k]
            this[propName][k] = (value === undefined) ? replacer : value
        }
    }

    removeAttribute(propName: string, previous?: any) {
        this[propName] = null;
    }

}

export function createRNodeByVNode(vnode: VNode): IRNode {
    return new RNode(vnode);
}
