import { ITagType, IPropType, VNode, isVNode } from "./vnode";
import { isArray } from "./utils";

const stack = [];
const EMPTY_CHILDREN = [];
export const TextNodeTagName = '#text';

export function h(tagName: ITagType, properties?: IPropType, ...args: any[]): VNode {
    
    properties == null ? undefined : properties;
    let key;
    if (properties && properties.hasOwnProperty('key')) {
        key = properties.key;
        properties.key = undefined;
    }

    let children = EMPTY_CHILDREN, child, i;
    for (i = args.length; i-- > 0;) {
        stack.push(args[i]);
    }

    if (properties && properties.children != null) {
        if (!stack.length) {
            stack.push(properties.children);
        }
        console.log('delete properties.children;')
        delete properties.children;
    }

    while (stack.length) {

        if ((child = stack.pop()) && child.pop !== undefined) {
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

