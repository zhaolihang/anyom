import { overwrite } from "./utils";
import { VNode } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { RNodeProxy } from "./element";
import { queueComponent } from "./scheduler";


export enum RenderMode {
    SYNC = 1,
    ASYNC,
}

export class Component {
    private static id = 1;

    id: number;
    renderRNode: RNodeProxy;
    context: Component;
    refs: { [name: string]: Component | HTMLElement } = {};
    protected props: any;
    protected state: any;
    protected renderedVNode: VNode;

    constructor(props, context?: Component) {

        this.id = Component.id++;

        this.props = props || {};
        this.context = context;
        this.state = this.state || {};
        if (this.context && typeof this.props.ref === 'string') {
            this.context.refs[this.props.ref] = this;
        }

    }

    getRNode(): RNodeProxy {
        this.renderRNode || this.forceUpdate(RenderMode.SYNC);
        return this.renderRNode;
    }

    setAttribute(propName: string, propValue: any, previous?: any, context?: Component) {

        overwrite(this.props, { [propName]: propValue });

        if (propName === 'ref') {
            if (context) {
                context.refs[propValue] = this;
                if (previous && previous[propName]) {
                    if (context.refs[previous[propName]] === this) {
                        delete context.refs[previous[propName]];
                    }
                }
            }
        }

        this.forceUpdate();

    }

    setAttributeObject(propName: string, propValue: any, previous?: any) {

        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k];
            if (value === undefined) {
                delete this.props[propName][k];
            } else {
                this.props[propName][k] = value;
            }
        }
        this.forceUpdate();

    }

    removeAttribute(propName: string, previous?: any, context?: Component) {

        let propValue = this.props[propName]
        if (propName === 'ref') {
            if (context) {
                if (context.refs[propName] === this) {
                    delete context.refs[previous[propName]];
                }
            }
        }
        delete this.props[propName];
        this.forceUpdate();

    }

    setState(state) {
        let s = this.state;
        overwrite(s, state);
        this.forceUpdate();
    }

    forceUpdate(renderMode: RenderMode = RenderMode.ASYNC) {

        if (renderMode === RenderMode.SYNC) {
            let newVNode = this.render();

            if (this.renderedVNode && this.renderRNode) {
                let patches = diff(this.renderedVNode, newVNode);
                let newRootRNode = patch(this.renderRNode, patches, this);
                this.renderedVNode = newVNode;
                this.renderRNode = newRootRNode;
            } else {
                this.renderedVNode = newVNode;
                this.renderRNode = createElement(this.renderedVNode, this);
            }
        } else {
            queueComponent(this);
        }

    }

    render(): VNode {
        throw new Error('请重写本方法');
    };
}
