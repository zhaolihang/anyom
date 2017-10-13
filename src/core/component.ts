import { VNode, createVoidNode } from "./vnode";
import { queueComponent } from "./scheduler";
import { diff } from "./diff-patch";
import { isFunction, combineFrom } from "./shared";

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

export function linkEvent(data, event) {
    if (isFunction(event)) {
        return { data, event };
    }
    return null;
}

let gid = 0;
export class Component {
    $$observe_forbidden: boolean;
    public shouldComponentUpdate?(nextProps, nextState): boolean;
    public getChildContext?(): { [x: string]: any };

    $$vnode: VNode;

    $$id: number;
    $$lastResult: VNode;

    props: any;
    state: any;
    context: any;

    constructor(props) {
        this.$$id = ++gid;
        this.props = props;
    }

    setState(state, cb?: Function) {
        if (this.shouldComponentUpdate) {
            if (!this.shouldComponentUpdate(this.props, state)) {
                this.state = Object.assign({}, this.state, state);
                if (typeof cb === 'function') {
                    cb();
                }
                return;
            }
        }
        this.state = Object.assign({}, this.state, state);
        queueComponent(this, cb)
    }

    render(): VNode {
        throw new Error('请重写本方法');
    }

    $$setProps(props) {
        this.props = props;
    }

    $$setContext(context) {
        this.context = context;
    }

    $$updateComponent(cb: Function | null) {
        let context = this.context;
        if (this.getChildContext) {
            context = combineFrom(this.context, this.getChildContext())
        }
        let currResult = this.render() || createVoidNode();
        diff(this.$$lastResult, currResult, context)
        this.$$lastResult = currResult;
        if (typeof cb === 'function') {
            cb();
        }
    }
}

Component.prototype.$$observe_forbidden = true;

