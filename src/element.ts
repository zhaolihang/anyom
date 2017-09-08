
import { IRNode, ITagType } from "./vnode";

export class RNode implements IRNode {
    parentNode: IRNode = null
    childNodes: IRNode[] = [];
    constructor(public tagName: ITagType) {
        this.tagName = tagName;
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

    replaceChild(newNode: IRNode, xomNode: IRNode) {
        let index = this.childNodes.indexOf(xomNode);
        if (~index) {
            xomNode.parentNode = null;
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

}


