import { overwrite } from "./utils";
import { VNode } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { NodeProxy } from "./element";
import { queueComponent } from "./scheduler";
import { LifeCycleType } from "./lifecycle";


export enum RenderMode {
    None = 0,
    SYNC,
    ASYNC,
}

export class Component {
    private static globalId = 0;

    protected renderedNodeProxy: NodeProxy;
    protected renderedVNode: VNode;

    protected props: any;
    protected state: any = {};
    id: number;
    refs = {};

    constructor(props) {
        this.id = ++Component.globalId;
        this.props = props || {};
    }

    getNodeProxy(): NodeProxy {
        this.renderedNodeProxy || this.forceUpdate(RenderMode.SYNC);
        return this.renderedNodeProxy;
    }

    setState(state) {
        let s = this.state;
        overwrite(s, state || {});
        this.forceUpdate(RenderMode.ASYNC);
    }

    setProps(props) {
        this.props = props || {};
        this.forceUpdate(RenderMode.ASYNC);
    }

    forceUpdate(renderMode: RenderMode) {
        if (renderMode === RenderMode.SYNC) {

            if (this.renderedVNode) {
                if (typeof this[LifeCycleType.BeforeUpdate] === 'function') {
                    this[LifeCycleType.BeforeUpdate]();
                }
                let newVNode = this.render();
                let patches = diff(this.renderedVNode, newVNode);
                let newRootRNode = patch(this.renderedNodeProxy, patches, this);
                this.renderedVNode = newVNode;
                this.renderedNodeProxy = newRootRNode;
                if (typeof this[LifeCycleType.AfterUpdate] === 'function') {
                    this[LifeCycleType.AfterUpdate]();
                }
            } else {
                let newVNode = this.render();
                this.renderedVNode = newVNode;
                this.renderedNodeProxy = createElement(this.renderedVNode, this);
            }
        } else {
            queueComponent(this);
        }

    }

    render(): VNode {
        throw new Error('请重写本方法');
    };
}
