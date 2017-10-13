import { isString, isInvalid, isUndefined, FunCompHooks } from "./shared";
import { Component } from "./component";
import { Commands } from "./command";

export interface NativeElement {
    appendChild?(newNode: NativeElement): any
    removeChild?(oriNode: NativeElement): any
    replaceChild?(newNode: NativeElement, refNode: NativeElement): any
    insertBefore?(newNode: NativeElement, refNode: NativeElement): any
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

export type Ref = (node: NativeElement | Component) => void;

export interface Refs {
    onComponentWillMount?(): void;
    onComponentDidMount?(node: NativeElement): void;
    onComponentShouldUpdate?(lastProps, nextProps): boolean;
    onComponentWillUpdate?(lastProps, nextProps): void;
    onComponentDidUpdate?(lastProps, nextProps): void;
    onComponentWillUnmount?(node: NativeElement): void;
}

export type Cmd = any;
export type Cmds = { [cmdName: string]: Cmd };


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

    Void = 1 << 30,

    Node = Element | Text | Void,
}

export type Instance = Component | Function | NativeElement;

export class VNode {
    $$observe_forbidden: boolean;

    key: string;
    tag: TagName;
    type: VNodeType;
    props: PropsType
    children: VNode[]
    private $$instance: Instance;
    get instance() {
        return this.$$instance
    };
    set instance(v) {
        this.$$instance = v;
        if (v && (this.type & VNodeType.ComponentClass) > 0) {
            (v as Component).$$vnode = this;
        }
    }

    lastResult?: VNode;// 只有 type === ComponentFunction 有效
    refs?: Refs;// 只有 type === ComponentFunction 有效
    ref?: Ref;// 只有 type === ComponentClass  or  type === Node 有效
    cmds?: Cmds;// 只有 type === ComponentClass  or  type === Node 有效

    constructor(type: VNodeType, tag: TagName, props: PropsType, children: VNode[], key?: string) {
        this.key = key != null ? String(key) : null;
        this.tag = tag;
        this.type = type;
        this.props = props;
        this.children = children;
    }

}
VNode.prototype.$$observe_forbidden = true;


const stack: VNode[] = [];
const noChildren = [];
if (Object.freeze) {
    Object.freeze(noChildren)
}

export function h(tag: TagName, props?: PropsType, ...args): VNode;
export function h(tag: TagName, props?: PropsType): VNode {
    let type = getVNodeType(tag);
    let key;
    let ref;
    let refs;
    let cmds;
    let tmp;
    let newProps: any = {};
    if (props) {
        for (tmp in props) {
            if (tmp === 'key') {
                key = props.key;
            } else if (tmp === 'ref') {
                ref = props.ref;
            } else if (!isInvalid(props.children)) {
                stack.push(props.children as any);
            } else if (FunCompHooks.has(tmp)) {
                if (!refs) { refs = {}; }
                refs[tmp] = props[tmp];
            } else if (Commands.has(tmp)) {
                if (!cmds) { cmds = {}; }
                cmds[tmp] = cmds[tmp];
            } else {
                newProps[tmp] = props[tmp];
            }
        }
    }

    if (!stack.length) {
        for (tmp = arguments.length; tmp-- > 2;) {
            stack.push(arguments[tmp]);
        }
    }
    ////////////////////////////////////////////////////

    let child: any;
    let children: VNode[] = null;
    while (stack.length) {

        if ((child = stack.pop()) && Array.isArray(child)) {
            for (tmp = child.length; tmp--;) {
                stack.push(child[tmp]);
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
    let node: VNode;
    if (type & VNodeType.Component) {
        newProps.children = children || noChildren;
        node = new VNode(type, tag, newProps, null, key);
    } else {
        node = new VNode(type, tag, newProps, children || noChildren, key);
    }
    node.ref = ref;
    node.refs = refs;
    node.cmds = cmds;
    return node;
}

export function cloneVNode(vNode: VNode): VNode {
    return vNode;
}

export function createVoidNode() {
    return new VNode(VNodeType.Void, null, null, null);
}