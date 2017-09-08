import { ITagType, IPropType, VNode, isVNode } from "./vnode";
import { isArray } from "./utils";

export function isChild(x) {
    return isVNode(x)
}

export function isChildren(x) {
    return isArray(x) || isChild(x);
}

function addChild(c: VNode[] | VNode, childNodes: VNode[], tag: ITagType, props: IPropType) {
    if (isChild(c)) {
        childNodes.push(<VNode>c);
    } else if (isArray(c)) {
        for (var i = 0; i < (<VNode[]>c).length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw new Error('非法的子节点');
    }
}

export function h(tagName: ITagType, properties?: IPropType | VNode[], children?: VNode[]) {
    let childNodes = [];
    let tag, props, key;
    tag = tagName
    if (!children && isChildren(properties)) {
        children = <VNode[]>properties;
        props = {};
    }

    props = props || properties || {};

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }
    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }
    return new VNode(tag, props, childNodes, key);
}

