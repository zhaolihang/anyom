import { VNode, createVoidNode } from "./vnode";
import { queueComponent } from "./scheduler";
import { diff } from "./diff-patch";
import { isFunction, combineFrom, isNullOrUndef } from "./shared";

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
    get $$observe_forbidden() {
        return true;
    };
    public shouldComponentUpdate?(nextProps, nextState, context): boolean;
    public getChildContext?(): { [x: string]: any };

    // LifeCycle methods
    public componentWillMount?(): void;
    public componentDidMount?(): void;
    public componentWillReceiveProps?(nextProps, nextContext): void;
    public componentWillUpdate?(nextProps, nextState, nextContext): void;
    public componentDidUpdate?(prevProps, prevState, prevContext): void;
    public componentWillUnmount?(): void;

    $$owner: VNode;

    $$id: number;

    private __$$lastResult: VNode;

    get $$lastResult() {
        return this.__$$lastResult
    };
    set $$lastResult(v) {
        this.__$$lastResult = v;
        if (v) {
            v.parentVNode = this.$$owner;
        }
    }

    props: any;
    state: any;
    context: any;

    constructor(props) {
        this.$$id = ++gid;
        this.props = props;
    }

    setState(state, cb?: Function) {
        if (this.shouldComponentUpdate) {
            if (!this.shouldComponentUpdate(this.props, state, this.context)) {
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

    $$setPropsAndContext(nextProps, nextContext) {
        if (!isNullOrUndef(this.componentWillReceiveProps)) {
            this.componentWillReceiveProps(nextProps, nextContext);
        }
        this.props = nextProps;
        this.context = nextContext;
    }

    $$initContext(context) {
        this.context = context;
    }

    $$updateComponent(cb: Function | null) {
        let context = this.context;
        if (this.getChildContext) {
            context = combineFrom(this.context, this.getChildContext())
        }

        if (!isNullOrUndef(this.componentWillUpdate)) {
            this.componentWillUpdate(this.props, this.state, this.context);
        }

        let currResult = this.render() || createVoidNode();
        diff(this.$$lastResult, currResult, context)
        this.$$lastResult = currResult;

        if (!isNullOrUndef(this.componentDidUpdate)) {
            this.componentDidUpdate(this.props, this.state, this.context);
        }

        if (typeof cb === 'function') {
            cb();
        }
    }
}
