import { overwrite } from "./utils";
import { VNode, TextNodeTag, NullNodeTag } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { queueComponent } from "./scheduler";
import { NodeProxy } from "./node-proxy";
import { EventEmitter } from "./EventEmitter";

export const LifeCycleType = {
    Created: 'created',
    Mounted: 'mounted',
    UnMounted: 'unmounted',
    BeforeUpdate: 'beforeUpdate',
    AfterUpdate: 'afterUpdate',
}

export enum RenderMode {
    None = 0,
    SYNC,
    ASYNC,
}

let GID = 0;
export class Component extends EventEmitter {

    protected renderedVNode: VNode;
    protected renderedNodeProxy: NodeProxy;

    id: number;
    protected props: any;
    protected state: any = {};
    protected refs: any = {};

    constructor(props) {
        super()
        this.id = ++GID;
        this.props = props || {};
    }

    getNodeProxy(): NodeProxy {
        this.renderedNodeProxy || this.forceUpdate(RenderMode.SYNC);
        return this.renderedNodeProxy;
    }

    setState(state) {
        //@TODO 考虑双向绑定
        this.state = state;
        this.forceUpdate(RenderMode.ASYNC);
    }

    setProps(props) {
        this.props = props || {};
        this.forceUpdate(RenderMode.ASYNC);
    }

    forceUpdate(renderMode: RenderMode) {
        if (renderMode === RenderMode.SYNC) {

            if (this.renderedVNode) {
                let newVNode = this._render();
                let patches = diff(this.renderedVNode, newVNode);
                let newRootRNode = patch(this.renderedNodeProxy, patches);
                this.renderedVNode = newVNode;
                this.renderedNodeProxy = newRootRNode;
            } else {
                this.renderedVNode = this._render();
                this.renderedNodeProxy = createElement(this.renderedVNode);
            }

        } else {
            queueComponent(this);
        }

    }

    private _render(): VNode {
        let vnode = this.render() || new VNode(NullNodeTag, {});// 处理返回的VNode 是null 的情况
        return vnode;
    }

    render(): VNode {
        throw new Error('请重写本方法');
    };
}

export class ComponentStateless extends Component {

    constructor(props, renderFn) {
        super(props)
        this.render = () => {
            return renderFn(this.props);
        };
    }

}
