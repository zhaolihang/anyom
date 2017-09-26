export type ITagName = any;
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

    constructor(public tagName: ITagName, public props: IPropType = noProperties, public children: VNode[] = noChildren, public key?: string) {

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

const stack: VNode[] = [];
const EMPTY_CHILDREN = [];

export function h(tagName: ITagName, props?: IPropType, ...args: any[]): VNode {
    props == null ? undefined : props;

    // ref
    let ref;
    if (props && props.ref != null) {
        ref = props.ref;
        delete props.ref;
    }

    // commands 指令
    let commands: ICommandsType;
    if (props && props.commands != null) {
        commands = props.commands;
        delete props.commands;
    }

    // namespace 
    let namespace: string;
    if (props && props.namespace != null) {
        namespace = props.namespace;
        delete props.namespace;
    }

    ////////////////////////////////////////////////////
    // key
    let key;
    if (props && props.key != null) {
        key = props.key;
        delete props.key;
    }

    // children
    let children: VNode[] = EMPTY_CHILDREN;
    let child: any;
    let i;
    for (i = args.length; i-- > 0;) {
        stack.push(args[i]);
    }

    if (props && props.children != null) {
        if (!stack.length) {
            stack.push(props.children);
        }
        delete props.children;
    }

    while (stack.length) {

        if ((child = stack.pop()) && Array.isArray(child)) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        } else {

            let childType = typeof child;
            if (childType === 'string' || childType === 'number' || childType === 'boolean') {
                child = new VNode(TextNodeTagName, { value: String(child) });
            }

            if (children === EMPTY_CHILDREN) {
                children = [child];
            } else {
                children.push(child);
            }

        }
    }

    let vnode = new VNode(tagName, props, children, key);
    vnode.namespace = namespace;
    vnode.ref = ref;
    vnode.commands = commands;

    return vnode;
}

