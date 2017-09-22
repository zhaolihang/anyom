import { overwrite } from "./utils";
import { VNode } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { RealNodeProxy } from "./element";
import { queueComponent } from "./scheduler";
import { LifeCycleType } from "./lifecycle";


export enum RenderMode {
    SYNC = 1,
    ASYNC,
}

export class Component {
    private static increasingID = 1;

    protected renderedRealNode: RealNodeProxy;
    protected renderedVNode: VNode;

    protected props: any;
    protected state: any = {};
    id: number;
    refs = {};

    constructor(props) {
        this.id = Component.increasingID++;
        this.props = props || {};

    }

    getRealNodeProxy(): RealNodeProxy {
        this.renderedRealNode || this.forceUpdate(RenderMode.SYNC);
        return this.renderedRealNode;
    }

    setAttribute(propName: string, propValue: any, previous?: any) {
        overwrite(this.props, { [propName]: propValue });
        this.forceUpdate(RenderMode.ASYNC);
    }

    setAttributeObject(propName: string, propValue: any, previous?: any) {

        for (let k in propValue) {
            let value = propValue[k];
            if (value === undefined) {
                delete this.props[propName][k];
            } else {
                this.props[propName][k] = value;
            }
        }
        this.forceUpdate(RenderMode.ASYNC);

    }

    removeAttribute(propName: string, previous?: any) {
        delete this.props[propName];
        this.forceUpdate(RenderMode.ASYNC);
    }

    setState(state) {
        let s = this.state;
        overwrite(s, state || {});
        this.forceUpdate(RenderMode.ASYNC);
    }

    forceUpdate(renderMode: RenderMode) {
        renderMode = renderMode || RenderMode.ASYNC;
        if (renderMode === RenderMode.SYNC) {
            let newVNode = this.render();

            if (this.renderedVNode && this.renderedRealNode) {
                let patches = diff(this.renderedVNode, newVNode);
                let newRootRNode = patch(this.renderedRealNode, patches, this);
                this.renderedVNode = newVNode;
                this.renderedRealNode = newRootRNode;
                if (typeof this[LifeCycleType.Updated] === 'function') {
                    this[LifeCycleType.Updated]();
                }
            } else {
                this.renderedVNode = newVNode;
                this.renderedRealNode = createElement(this.renderedVNode, this);
            }
        } else {
            queueComponent(this);
        }

    }

    render(): VNode {
        throw new Error('请重写本方法');
    };
}
