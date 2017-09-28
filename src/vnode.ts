export type ITagName = any;
export type IPropType = { [x: string]: any };
export type ICmdsType = { [commandName: string]: any }; // { commandName:commandArgs }
export type IRefType = (elm: any) => any;
export const TextNodeTag = {};

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

    ref: IRefType;
    key: string;
    cmds: ICmdsType;
    ns: string;

    constructor(public tag: ITagName, public props: IPropType = noProperties, public children: VNode[] = noChildren, key?: string) {

        // type
        if (tag === TextNodeTag) {
            this.type = VNodeType.NativeText;
        } else if (typeof tag === 'string') {
            this.type = VNodeType.NativeNode;
        } else if (typeof tag === 'function') {
            this.type = VNodeType.Component;
        }

        //key
        this.key = key != null ? String(key) : undefined;

        let count = (children && children.length) || 0;
        let descendants = 0;
        for (let i = 0; i < count; i++) {
            let child = children[i];
            descendants += child.count;
        }
        //count
        this.count = count + descendants;

    }

}

//

const stack: VNode[] = [];
const EMPTY_CHILDREN = [];

export function h(tag: ITagName, props?: IPropType, ...args: any[]): VNode {
    props == null ? undefined : props;

    // key
    let key;
    if (props && props.key != null) {
        key = props.key;
        delete props.key;
    }

    // ref
    let ref;
    if (props && props.ref != null) {
        ref = props.ref;
        delete props.ref;
    }

    // cmd 指令
    let cmds: ICmdsType;
    if (props && props.cmds != null) {
        cmds = props.cmds;
        delete props.cmds;
    }

    // namespace 
    let ns: string;
    if (props && props.ns != null) {
        ns = props.ns;
        delete props.ns;
    }

    ////////////////////////////////////////////////////

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
                child = new VNode(TextNodeTag, { value: String(child) });
            }

            if (children === EMPTY_CHILDREN) {
                children = [child];
            } else {
                children.push(child);
            }

        }
    }

    let vnode = new VNode(tag, props, children, key);
    vnode.ref = ref;
    vnode.ns = ns;
    vnode.cmds = cmds;

    return vnode;
}

