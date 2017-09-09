import { overwrite } from "./utils";
import { VNode } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { IRNode } from "./element";


export class Component {
    context: any;
    props: any;
    state: any;
    renderRNode: IRNode;
    renderedVNode: VNode;
    constructor(props, context?) {
        this.props = props || {};
        this.context = context || {};
        this.state = this.state || {};
    }

    setProps(props) {
        let s = this.props;
        overwrite(s, props);
        this.forceUpdate();
    }

    setState(state) {
        let s = this.state;
        overwrite(s, state);
        this.forceUpdate();
    }

    forceUpdate(): IRNode {
        let newVNode = this.render();
        if (this.renderedVNode) {
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
