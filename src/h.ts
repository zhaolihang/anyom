import { ITagType, IPropType, VNode, isVNode, TextNodeTagName, ICommandsType } from "./vnode";
import { isArray, isObject } from "./utils";

const stack: VNode[] = [];
const EMPTY_CHILDREN = [];

export function h(tagName: ITagType, properties?: IPropType, ...args: any[]): VNode {
    properties == null ? undefined : properties;

    // ref
    let ref;
    if (properties && properties.ref != null) {
        ref = properties.ref;
        delete properties.ref;
    }

    // commands 指令
    let commands: ICommandsType;
    if (properties && properties.commands != null) {
        if (isObject(properties.commands)) {
            commands = properties.commands;
        }
        delete properties.commands;
    }

    // namespace 
    let namespace: string;
    if (properties && properties.namespace != null) {
        namespace = properties.namespace;
        delete properties.namespace;
    }

    ////////////////////////////////////////////////////
    // key
    let key;
    if (properties && properties.key != null) {
        key = properties.key;
        delete properties.key;
    }

    // children
    let children: VNode[] = EMPTY_CHILDREN;
    let child: any;
    let i;
    for (i = args.length; i-- > 0;) {
        stack.push(args[i]);
    }

    if (properties && properties.children != null) {
        if (!stack.length) {
            stack.push(properties.children);
        }
        delete properties.children;
    }

    while (stack.length) {

        if ((child = stack.pop()) && isArray(child)) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        } else {

            if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
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

    let vnode = new VNode(tagName, properties, children, key);
    vnode.commands = commands;
    vnode.ref = ref;
    vnode.namespace = namespace;

    return vnode;
}

