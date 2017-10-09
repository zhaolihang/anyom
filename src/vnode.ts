import { hasCommand } from "./commands";
import { isString, isStatefulComponent, isInvalid, toArray, ComponentHooks } from "./shared";
import { Component } from "./component";
import { NodeProxy } from "./node-proxy";

export interface NativeElement {

}
export type TagName = Function | string;
export type PropsType = {
    children?: VNode[];
    ref?: Function
    key?: string | number;
    [x: string]: any
};

export type Cmds = { [x: string]: any }

export type Ref = (node?: NativeElement | null) => void;
export interface Refs {
    onComponentDidMount?: (domNode: NativeElement) => void;
    onComponentWillMount?(): void;
    onComponentShouldUpdate?(lastProps, nextProps): boolean;
    onComponentWillUpdate?(lastProps, nextProps): void;
    onComponentDidUpdate?(lastProps, nextProps): void;
    onComponentWillUnmount?(domNode: NativeElement): void;
}


export function getVNodeTypeByString(name: string): VNodeType {
    return VNodeType.Element;
}

export function getVNodeType(type: any): VNodeType {
    if (isString(type)) {
        return getVNodeTypeByString(type);
    } else {
        return isStatefulComponent(type) ? VNodeType.ComponentClass : VNodeType.ComponentFunction;
    }
}

export function isVNode(o: VNode): boolean {
    return !!o.type;
}

export enum VNodeType {
    Text = 1,
    Element = 1 << 1,

    ComponentClass = 1 << 2,
    ComponentFunction = 1 << 3,
    ComponentUnknown = 1 << 4,
    Component = ComponentFunction | ComponentClass,

    Void = 1 << 10,
}

export type Instance = Component | Function | NodeProxy;

export class VNode {
    count = 0;

    key: string;
    tag: TagName;
    type: VNodeType;
    props: PropsType
    children: VNode[]
    instance: Instance = null;

    constructor(type: VNodeType, tag: TagName, props: PropsType, children: VNode[], key?: string) {
        this.key = key != null ? String(key) : null;
        this.tag = tag;
        this.type = type;
        this.props = props;
        this.children = children;

        let count = (children && children.length) || 0;
        let descendants = 0;
        for (let i = 0; i < count; i++) {
            let child = children[i];
            descendants += child.count;
        }
        this.count = count + descendants;
    }

}

const stack: VNode[] = [];
const EMPTY_CHILDREN = [];

export function h(tag: TagName, props?: PropsType, ...args): VNode;
export function h(tag: TagName, props?: PropsType): VNode {
    let type = getVNodeType(tag);
    let key;
    if (props) {
        key = props.key;
        delete props.key;
        if (!isInvalid(props.children)) {
            stack.push(props.children as any);
            delete props.children;
        }
    }
    let i;
    if (!stack.length) {
        for (i = arguments.length; i-- > 2;) {
            stack.push(arguments[i]);
        }
    }
    ////////////////////////////////////////////////////

    let child: any;
    let children: VNode[] = null;
    while (stack.length) {

        if ((child = stack.pop()) && Array.isArray(child)) {
            for (i = child.length; i--;) {
                stack.push(child[i]);
            }
        } else {
            if (isInvalid(child)) {
                continue;
            }
            let childType = typeof child;
            if (childType === 'string' || childType === 'number') {
                child = new VNode(VNodeType.Text, null, { value: String(child) }, null);
            }
            if (!children) {
                children = [child];
            } else {
                children.push(child);
            }
        }
    }
    if (type & VNodeType.Component) {
        if (children) {
            props = props || {}
            props.children = children;
        }
        return new VNode(type, tag, props, null, key);
    } else {
        return new VNode(type, tag, props, children, key);
    }
}

export function cloneVNode(vNode: VNode): VNode {
    return vNode;
}
