export type ITagType = any;
export type IPropType = { [x: string]: any };

let noProperties = {}
let noChildren = []

export function isVNode(x) {
    return x && (x instanceof VNode)
}

interface IRNodeConstructor {
    new(vNode: VNode): IRNode;
}

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

export class VNode {

    count = 0;
    constructor(public tagName: ITagType, public properties?: IPropType, public children?: VNode[], public key?: string) {
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
}

//

export enum VPatchType {
    NONE = 'NONE',
    REPLACE = 'REPLACE',
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

