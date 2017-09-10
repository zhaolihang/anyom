import { overwrite } from "./utils";
import { VNode } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { IRNode } from "./element";


export class Component {
    renderRNode: IRNode;
    context: any;
    protected props: any;
    protected state: any;
    protected renderedVNode: VNode;
    constructor(props, context?) {
        this.props = props || {};
        this.context = context || {};
        this.state = this.state || {};
    }

    getRNode(): IRNode {
        return this.renderRNode || this.forceUpdate();
    }
    setAttribute(propName: string, propValue: any, previous?: any) {
        overwrite(this.props, { [propName]: propValue });
        this.forceUpdate();
    }
    setAttributeObject(propName: string, propValue: any, previous?: any) {
        let replacer = undefined;
        for (let k in propValue) {
            let value = propValue[k]
            if (value === undefined) {
                delete this.props[propName][k]
            } else {
                this.props[propName][k] = value;
            }
        }
        this.forceUpdate();
    }
    removeAttribute(propName: string, previous?: any) {
        delete this.props[propName]
        this.forceUpdate();
    }


    // setProps(props) {
    //     let s = this.props;
    //     overwrite(s, props);
    //     this.forceUpdate();
    // }

    setState(state) {
        let s = this.state;
        overwrite(s, state);
        this.forceUpdate();
    }

    forceUpdate(): IRNode {
        let newVNode = this.render();
        if (this.renderedVNode && this.renderRNode) {
            let patches = diff(this.renderedVNode, newVNode);
            let newRootRNode = patch(this.renderRNode, patches);
            this.renderedVNode = newVNode;
            this.renderRNode = newRootRNode;
        } else {
            this.renderedVNode = newVNode;
            this.renderRNode = createElement(this.renderedVNode);
        }
        return this.renderRNode;
    }

    render(): VNode {
        throw new Error('请重写本方法');
    };
}
