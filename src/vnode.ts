
export type ITagType = any;
export type IPropType = { [x: string]: any };

let noProperties = {}
let noChildren = []

export function isVNode(x) {
    return x && (x instanceof VNode)
}


export class RNode {
    parentNode: RNode = null
    childNodes: RNode[] = [];
    constructor(public readonly tagName: ITagType) { }
    appendChild(x: RNode) {
        x.parentNode = this;
        this.childNodes.push(x);
    }

    removeChild(x: RNode) {
        let index = this.childNodes.indexOf(x);
        if (~index) {
            x.parentNode = null;
            this.childNodes.splice(index, 1);
        }
    }

    replaceChild(newNode: RNode, domNode: RNode) {
        let index = this.childNodes.indexOf(domNode);
        if (~index) {
            domNode.parentNode = null;
            this.childNodes.splice(index, 1, newNode);
        } else {
            this.childNodes.push(newNode);
        }
        newNode.parentNode = this;
    }

    insertBefore(newNode: RNode, insertTo: RNode | null) {
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

export class VNode {
    count = 0;
    constructor(public tagName: ITagType, public properties?: IPropType, public children?: VNode[], public key?: number | string) {
        this.tagName = tagName
        this.properties = properties || noProperties
        this.children = children || noChildren
        this.key = key != null ? String(key) : undefined

        var count = (children && children.length) || 0
        var descendants = 0

        for (var i = 0; i < count; i++) {
            var child = children[i]
            if (isVNode(child)) {
                descendants += child.count || 0
            } else {
                throw new Error('must be VNode')
            }
        }
        this.count = count + descendants
    }

    vRender() {
        return new RNode(this.tagName);
    }
}

//

export enum VPatchType {
    NONE = 'NONE',
    VNODE = 'VNODE',
    PROPS = 'PROPS',
    ORDER = 'ORDER',
    INSERT = 'INSERT',
    REMOVE = 'REMOVE',
}

export function isPatch(x) {
    return x && (x instanceof VPatch)
}

export class VPatch {
    constructor(public type: VPatchType, public vNode: VNode, public patch) {
    }
}

