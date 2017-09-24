export type ITagType = any;
export type IPropType = { [x: string]: any };
export type ICommandsType = { [commandName: string]: any }; // { commandName:commandArgs }
export const TextNodeTagName = {};

const noProperties = {};
const noChildren = [];

const VNodeFlag = {};
export function isVNode(x) {
    return x && (x.__type__ === VNodeFlag);
}

export enum VNodeType {
    None = 0,
    Component,
    Node,
    Text,
}

export class VNode {
    count = 0;
    type = VNodeType.None;
    commands: ICommandsType;
    ref: string;
    namespace: string;

    constructor(public tagName: ITagType, public props: IPropType = noProperties, public children: VNode[] = noChildren, public key?: string) {

        if (tagName === TextNodeTagName) {
            this.type = VNodeType.Text;
        } else if (typeof tagName === 'string') {
            this.type = VNodeType.Node;
        } else if (typeof tagName === 'function') {
            this.type = VNodeType.Component;
        }

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
(VNode.prototype as any).__type__ = VNodeFlag;

//
export enum VPatchType {
    NONE = 0,
    REPLACE,
    ELEMENTPROPS,
    COMPONENTPROPS,
    ORDER,
    INSERT,
    REMOVE,
    REF,
    COMMANDS,
}

export class VPatch {
    constructor(public type: VPatchType, public vNode: VNode, public patch?: any) {
    }
}
