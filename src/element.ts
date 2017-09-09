
import { IRNode, ITagType, VNode } from "./vnode";

export class RNode implements IRNode {
    parentNode: IRNode = null
    childNodes: IRNode[] = [];
    constructor(public vNode: VNode) {
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
        }
    }

    replaceChild(newNode: IRNode, oldNode: IRNode) {
        let index = this.childNodes.indexOf(oldNode);
        if (~index) {
            oldNode.parentNode = null;
            this.childNodes.splice(index, 1, newNode);
        } else {
            this.childNodes.push(newNode);
        }
        newNode.parentNode = this;
    }

    insertBefore(newNode: IRNode, insertTo: IRNode | null) {
        if (insertTo) {
            let index = this.childNodes.indexOf(insertTo);
            if (~index) {
                newNode.parentNode = this;
                this.childNodes.splice(index, 0, newNode);
            } else {
                this.appendChild(newNode);
            }
        } else {
            this.appendChild(newNode);
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
