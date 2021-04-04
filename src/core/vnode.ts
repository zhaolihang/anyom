// vnode.ts
import { isString, isInvalid, isUndefined } from "./shared";
import { Component } from "./component";
import { Commands } from "./command";

export interface NativeNode {
    appendChild?(newNode: NativeNode): any
    removeChild?(oriNode: NativeNode): any
    replaceChild?(newNode: NativeNode, refNode: NativeNode): any
    insertBefore?(newNode: NativeNode, refNode: NativeNode): any
    parentNode?: NativeNode | any;
    [x: string]: any;
}

export type TagName = Function | string;

export type PropsType = {
    key?: string | number;
    children?: VNode[];
    ref?: Ref;
    [x: string]: any
};

export type Ref = (node: NativeNode | Component) => void;


const FunCompHooks = new Set<string>();
FunCompHooks.add("onWillMount");
FunCompHooks.add("onDidMount");
FunCompHooks.add("onWillUnmount");
FunCompHooks.add("onShouldUpdate");
FunCompHooks.add("onWillUpdate");
FunCompHooks.add("onDidUpdate");

export interface Hooks {
    onWillMount?(): void;
    onDidMount?(node: NativeNode): void;
    onShouldUpdate?(lastProps, nextProps): boolean;
    onWillUpdate?(lastProps, nextProps): void;
    onDidUpdate?(lastProps, nextProps): void;
    onWillUnmount?(node: NativeNode): void;
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

export const enum VNodeType {
    Text = 1,
    Element = 1 << 1,

    ComponentClass = 1 << 2,
    ComponentFunction = 1 << 3,
    Component = ComponentFunction | ComponentClass,

    Void = 1 << 30,

    Node = Element | Text | Void,
    NotVoidNode = Element | Text,
}

export type Instance = Component | Function | NativeNode;

export class VNode {
    get $$observeForbidden() {
        return true;
    };

    key: string;
    tag: TagName;
    type: VNodeType;
    props: PropsType;
    children: VNode[];
    private __instance: Instance;
    get instance() {
        return this.__instance
    };
    set instance(v) {
        this.__instance = v;
        if (v && (this.type & VNodeType.ComponentClass) > 0) {
            (v as Component).$$owner = this;
        }
    }

    private __lastResult?: VNode;// 只有 type === ComponentFunction 有效
    get lastResult() {
        return this.__lastResult
    };
    set lastResult(v) {
        this.__lastResult = v;
        if (v && (this.type & VNodeType.ComponentFunction) > 0) {
            v.parentVNode = this;
        }
    }

    parentVNode?: VNode;// 只有 type & Component 有效// 指向 instance的拥有者

    hooks?: Hooks;// 只有 type === ComponentFunction 有效
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
    let hooks;
    let cmds;
    let tmp;
    let newProps: any = {};
    if (props) {
        for (tmp in props) {
            if (tmp === 'key') {
                key = props.key;
            } else if (tmp === 'ref') {
                ref = props.ref;
                // } else if (!isInvalid(props.children)) {
                // if (props.children.length > 0) {
                //     stack.push(props.children as any);
                // }
            } else if (FunCompHooks.has(tmp)) {
                if (!hooks) { hooks = {}; }
                hooks[tmp] = props[tmp];
            } else if (Commands.has(tmp)) {
                if (!cmds) { cmds = {}; }
                cmds[tmp] = props[tmp];
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
    node.hooks = hooks;
    node.cmds = cmds;
    return node;
}

export function cloneVNode(vNode: VNode): VNode {
    return vNode;
}

export function createVoidNode() {
    return new VNode(VNodeType.Void, null, null, null);
}