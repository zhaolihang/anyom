import { RNode } from "./element";

export type ITagType = any;
export type IPropType = { [x: string]: any };

let noProperties = {}
let noChildren = []

export function isVNode(x) {
    return x && (x instanceof VNode)
}

interface IRNodeConstructor {
    new(tagName: ITagType): IRNode;
}

export interface IRNode {
    tagName: ITagType;
    parentNode: IRNode;
    childNodes: IRNode[];
    appendChild: (x: IRNode) => void;
    removeChild: (x: IRNode) => void;
    replaceChild: (newNode: IRNode, xomNode: IRNode) => void;
    insertBefore: (newNode: IRNode, insertTo: IRNode | null) => void;
}

let rNodeConstrutor = RNode;
export function getRNodeConstrutor(): IRNodeConstructor {
    return rNodeConstrutor;
}
export function setRNodeConstrutor(v: IRNodeConstructor) {
    rNodeConstrutor = v;
}

export class VNode {

    count = 0;
    constructor(public tagName: ITagType, public properties?: IPropType, public children?: VNode[], public key?: number | string) {
        this.tagName = tagName
        this.properties = properties || noProperties
        this.children = children || noChildren
        this.key = key != null ? String(key) : undefined

        let count = (children && children.length) || 0
        let descendants = 0

        for (let i = 0; i < count; i++) {
            let child = children[i]
            if (isVNode(child)) {
                descendants += child.count || 0
            } else {
                throw new Error('must be VNode')
            }
        }
        this.count = count + descendants
    }

    vRender() {
        return new (getRNodeConstrutor())(this.tagName);
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
    constructor(public type: VPatchType, public vNode: VNode, public patch?: any) {
    }
}

