import { proxy } from "./utils";
import { VNode, VNodeType } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { queueComponent } from "./scheduler";
import { NodeProxy } from "./node-proxy";
import { Observer, Watcher, set, del } from "./observer-watcher/index";

export const LifeCycleType = {
    Created: 'created',
    Mounted: 'mounted',
    UnMounted: 'unmounted',
    BeforeUpdate: 'beforeUpdate',
    AfterUpdate: 'afterUpdate',
    Destory: '$$destory',
}

export enum RenderMode {
    None = 0,
    SYNC,
    ASYNC,
}

let GID = 0;
export class Component {
    $$id: number;
    $$lastResult: VNode;

    props: any;

    setProps(props) {
        this.props = props;
    }

    constructor(props) {
        this.$$id = ++GID;
        this.props = props;
    }

    render(): VNode {
        throw new Error('请重写本方法');
    }
}

(Component.prototype as any).__observe_forbidden__ = true;

