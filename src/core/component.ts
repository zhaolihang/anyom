import { VNode } from "./vnode";
import { queueComponent } from "./scheduler";
import { diff } from "./diff";

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
    state: any;

    setProps(props) {
        this.props = props;
    }

    setState(state) {
        if (this['shouldComponentUpdate']) {
            if (!this['shouldComponentUpdate'](this.props, state)) {
                this.state = Object.assign({}, this.state, state);
                return;
            }
        }
        this.state = Object.assign({}, this.state, state);
        queueComponent(this)
    }

    getInitialState() {
        return {}
    }

    // shouldComponentUpdate(nextProps, nextState): boolean;

    constructor(props) {
        this.$$id = ++GID;
        this.props = props;
        this.state = this.getInitialState();
    }

    render(): VNode {
        throw new Error('请重写本方法');
    }

    $$updateComponent() {
        let instance = this;
        let currResult = instance.render();
        let patchTree = diff(instance.$$lastResult, currResult)
        instance.$$lastResult = currResult;
    }
}

(Component.prototype as any).__observe_forbidden__ = true;

