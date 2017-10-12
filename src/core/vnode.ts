import { isString, isInvalid, isUndefined } from "./shared";
import { Component } from "./component";

export interface NativeElement {
    appendChild?(...args): any
    removeChild?(...args): any
    replaceChild?(...args): any
    insertBefore?(...args): any
    childNodes?: (NativeElement | any)[] | any;
    parentNode?: NativeElement | any;
    [x: string]: any;
}
export type TagName = Function | string;
export type PropsType = {
    key?: string | number;
    children?: VNode[];
    ref?: Ref;
    [x: string]: any
};

export type Ref = (node?: NativeElement | null) => void;
export interface Refs {
    onComponentDidMount?: (domNode: NativeElement) => void;
    onComponentWillMount?(): void;
    onComponentShouldUpdate?(lastProps, nextProps): boolean;
    onComponentWillUpdate?(lastProps, nextProps): void;
    onComponentDidUpdate?(lastProps, nextProps): void;
    onComponentWillUnmount?(domNode: NativeElement): void;
}


function isStatefulComponent(o: any): boolean {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}

function getVNodeType(type: any): VNodeType {
    if (isString(type)) {
        return VNodeType.Element;
    } else {
        return isStatefulComponent(type) ? VNodeType.ComponentClass : VNodeType.ComponentFunction;
    }
}

export enum VNodeType {
    Text = 1,
    Element = 1 << 1,

    ComponentClass = 1 << 2,
    ComponentFunction = 1 << 3,
    Component = ComponentFunction | ComponentClass,

    Void = 1 << 32,

    Node = Element | Text | Void,
}

export type Instance = Component | Function | NativeElement;

export class VNode {
    __observe_forbidden__: boolean;

    key: string;
    tag: TagName;
    type: VNodeType;
    props: PropsType
    children: VNode[]
    _instance: Instance = null;
    get instance() {
        return this._instance
    };
    set instance(v) {
        if (v && this.type & VNodeType.ComponentClass) {
            (v as Component).$$vnode = this;
        }
        this._instance = v
    }

    lastResult?: VNode;// 只有 type === ComponentClass 有效
    rootElement?: NativeElement = null;// 只有 type & Component 有效

    constructor(type: VNodeType, tag: TagName, props: PropsType, children: VNode[], key?: string) {
        this.key = key != null ? String(key) : null;
        this.tag = tag;
        this.type = type;
        this.props = props;
        this.children = children;
    }

}
VNode.prototype.__observe_forbidden__ = true;


const stack: VNode[] = [];
const noChildren = [];
if (Object.freeze) {
    Object.freeze(noChildren)
}

export function h(tag: TagName, props?: PropsType, ...args): VNode;
export function h(tag: TagName, props?: PropsType): VNode {
    let type = getVNodeType(tag);
    let key;
    if (props) {
        if (props.key) {
            key = props.key;
            delete props.key;
        }
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
                child = new VNode(VNodeType.Text, null, { value: String(child) }, noChildren);
            }
            if (!children) {
                children = [child];
            } else {
                children.push(child);
            }
        }
    }
    props = props || {};
    if (type & VNodeType.Component) {
        if (children) {
            props.children = children;
        }
        return new VNode(type, tag, props, noChildren, key);
    } else {
        return new VNode(type, tag, props, children || noChildren, key);
    }
}

export function cloneVNode(vNode: VNode): VNode {
    return vNode;
}



export function createVoidNode() {
    return new VNode(VNodeType.Void, null, null, noChildren);
}