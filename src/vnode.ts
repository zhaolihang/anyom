export type ITagType = any;
export type IPropType = { [x: string]: any };
export type ICommandsType = { [commandName: string]: any }; // { commandName:commandArgs }

let noProperties = {};
let noChildren = [];

export const TextNodeTagName = {};

export function isVNode(x) {
    return x && (x.__type__ === '__VNode__');
}

export enum VNodeType {
    None = 0,
    Component = 'Component',
    Node = 'Node',
    Text = 'Text',
}

export class VNode {
    count = 0;
    type = VNodeType.None;
    commands: ICommandsType;
    ref: string;
    namespace: string;

    constructor(public tagName: ITagType, public properties?: IPropType, public children?: VNode[], public key?: string) {
        const tagNameType = typeof tagName;
        if (tagName === TextNodeTagName) {
            this.type = VNodeType.Text;
        } else if (tagNameType === 'string') {
            this.type = VNodeType.Node;
        } else if (tagNameType === 'function') {
            this.type = VNodeType.Component;
        }

        this.tagName = tagName;
        this.properties = properties || noProperties;
        this.children = children || noChildren;
        this.key = key != null ? String(key) : undefined;

        let count = (children && children.length) || 0;
        let descendants = 0;

        for (let i = 0; i < count; i++) {
            let child = children[i];
            if (isVNode(child)) {
                descendants += child.count || 0;
            } else {
                throw new Error('must be VNode');
            }
        }
        this.count = count + descendants;
    }

}
(VNode.prototype as any).__type__ = '__VNode__';

//

export enum VPatchType {
    NONE = 'NONE',
    REPLACE = 'REPLACE',
    PROPS = 'PROPS',
    ORDER = 'ORDER',
    INSERT = 'INSERT',
    REMOVE = 'REMOVE',
    REF = 'REF',
    COMMONDS = 'COMMONDS',
}

export function isPatch(x) {
    return x && (x.__type__ === '__VPatch__');
}

export class VPatch {
    constructor(public type: VPatchType, public vNode: VNode, public patch?: any) {
    }
}
(VPatch.prototype as any).__type__ = '__VPatch__';

