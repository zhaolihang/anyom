export type ITagType = any;
export type IPropType = { [x: string]: any };
export type ICommandsType = { [commandName: string]: any }; // { commandName:commandArgs }
export const TextNodeTagName = {};

const noProperties = {};
const noChildren = [];

export enum VNodeType {
    None = 0,
    Component,
    NativeNode,
    NativeText,
}

export class VNode {
    count = 0;
    type: VNodeType;
    commands: ICommandsType;
    ref: string;
    namespace: string;

    constructor(public tagName: ITagType, public props: IPropType = noProperties, public children: VNode[] = noChildren, public key?: string) {

        if (tagName === TextNodeTagName) {
            this.type = VNodeType.NativeText;
        } else if (typeof tagName === 'string') {
            this.type = VNodeType.NativeNode;
        } else if (typeof tagName === 'function') {
            this.type = VNodeType.Component;
        }

        this.key = key != null ? String(key) : undefined;

        let count = (children && children.length) || 0;
        let descendants = 0;

        for (let i = 0; i < count; i++) {
            let child = children[i];
            descendants += child.count;
        }
        this.count = count + descendants;
    }

}

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
