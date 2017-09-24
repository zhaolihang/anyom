import { ITagType, IPropType, VNode, isVNode, TextNodeTagName, ICommandsType } from "./vnode";
import { isArray, isObject } from "./utils";

const stack: VNode[] = [];
const EMPTY_CHILDREN = [];

export function h(tagName: ITagType, props?: IPropType, ...args: any[]): VNode {
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
        if (isObject(props.commands)) {
            commands = props.commands;
        }
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

        if ((child = stack.pop()) && isArray(child)) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        } else {

            let childType = typeof child;
            if (childType === 'string' || childType === 'number' || childType === 'boolean') {
                child = new VNode(TextNodeTagName, { value: String(child) });
            }

            if (!isVNode(child)) {
                throw new Error('不是合法的 VNode');
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

