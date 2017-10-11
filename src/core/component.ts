import { VNode } from "./vnode";
import { queueComponent } from "./scheduler";
import { diff } from "./diff-patch";

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
    __observe_forbidden__: boolean;
    public shouldComponentUpdate?(nextProps, nextState): boolean;

    $$id: number;
    $$lastResult: VNode;

    props: any;
    state: any;

    getInitialState() {
        return {}
    }

    constructor(props) {
        this.$$id = ++GID;
        this.props = props;
        this.state = this.getInitialState();
    }

    setProps(props) {
        this.props = props;
    }

    setState(state) {
        if (this.shouldComponentUpdate) {
            if (!this.shouldComponentUpdate(this.props, state)) {
                this.state = Object.assign({}, this.state, state);
                return;
            }
        }
        this.state = Object.assign({}, this.state, state);
        queueComponent(this)
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

Component.prototype.__observe_forbidden__ = true;

