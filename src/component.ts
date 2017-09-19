import { overwrite } from "./utils";
import { VNode } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { RealNodeProxy } from "./element";
import { queueComponent } from "./scheduler";


export enum RenderMode {
    SYNC = 1,
    ASYNC,
}

export class Component {
    private static id = 1;

    id: number;
    renderRealNode: RealNodeProxy;
    protected props: any;
    protected state: any = {};
    protected renderedVNode: VNode;

    constructor(props) {
        this.id = Component.id++;
        this.props = props || {};

    }

    getRealNode(): RealNodeProxy {
        this.renderRealNode || this.forceUpdate(RenderMode.SYNC);
        return this.renderRealNode;
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

            if (this.renderedVNode && this.renderRealNode) {
                let patches = diff(this.renderedVNode, newVNode);
                let newRootRNode = patch(this.renderRealNode, patches);
                this.renderedVNode = newVNode;
                this.renderRealNode = newRootRNode;
            } else {
                this.renderedVNode = newVNode;
                this.renderRealNode = createElement(this.renderedVNode);
            }
        } else {
            queueComponent(this);
        }

    }

    render(): VNode {
        throw new Error('请重写本方法');
    };
}
