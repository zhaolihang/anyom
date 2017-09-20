import { ITagType, IPropType, VNode, isVNode } from "./vnode";
import { isArray } from "./utils";

const stack = [];
const EMPTY_CHILDREN = [];
export const TextNodeTagName = '#text';

export function h(tagName: ITagType, properties?: IPropType, ...args: any[]): VNode {
    properties == null ? undefined : properties;

    // key
    let key;
    if (properties && properties.key != null) {
        key = properties.key;
        delete properties.key;
    }

    // ref
    let ref;
    if (properties && properties.ref != null) {
        ref = properties.ref;
        delete properties.ref;
    }

    // commands 指令
    let commands: { name: string, value: any }[];
    if (properties && properties.commands != null) {
        if (isArray(properties.commands)) {
            commands = properties.commands;
        }
        delete properties.commands;
    }

    // children
    let children = EMPTY_CHILDREN, child, i;
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

    return new VNode(tagName, properties, children, key);
}

