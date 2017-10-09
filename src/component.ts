import { proxy } from "./utils";
import { VNode, VNodeType } from "./vnode";
import { diff } from "./diff";
import { patch } from "./patch";
import { createElement } from "./create-element";
import { queueComponent } from "./scheduler";
import { NodeProxy } from "./node-proxy";
import { Observer, Watcher, set, del } from "./observer-watcher/index";

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
    protected $$renderedVNode: VNode;
    protected $$renderedNodeProxy: NodeProxy;

    $$id: number;
    protected $refs: any = {};
    props: any;
    private $$state: any = {};
    private $$watcher: Watcher;
    private $$watchers: Watcher[] = [];

    $watcher(exp: string, fun: Function, opt?: { sync: boolean, deep: boolean }) {
        let w = new Watcher(this.$$state['$state'], exp, fun, opt);
        this.$$watchers.push(w);
        return w;
    }

    protected initialState(): any {
        // can access this.props
        return {};
    }

    protected initialProps(props): any {
        return props;
    }

    constructor(props) {
        this.$$id = ++GID;

        this.props = this.initialProps(props || {});

        let $state = this.initialState();
        this.$$state['$state'] = $state;
        if ($state) {
            for (let key in $state) {
                proxy(this, $state, key);
            }
        }

        let ob = new Observer(this.$$state);
        this.$$watcher = new Watcher(this.$$state, '$state', (newV, oldV) => {
            this.forceUpdate(RenderMode.ASYNC);
        }, { deep: true });
    }

    getNodeProxy(): NodeProxy {
        this.$$renderedNodeProxy || this.forceUpdate(RenderMode.SYNC);
        return this.$$renderedNodeProxy;
    }

    setProps(props) {
        this.props = this.initialProps(props || {});
        this.onUpdateProps(this.props);
        this.forceUpdate(RenderMode.ASYNC);
    }

    // sync props to state if nesseary
    protected onUpdateProps(props) {//to override
        // use props to update state
        // eg: this.firstName = props.firstName;
    }

    forceUpdate(renderMode: RenderMode) {
        if (renderMode === RenderMode.SYNC) {

            if (this.$$renderedVNode) {
                let newVNode = this.$$render();
                let patches = diff(this.$$renderedVNode, newVNode);
                let newRootRNode = patch(this.$$renderedNodeProxy, patches);
                this.$$renderedVNode = newVNode;
                this.$$renderedNodeProxy = newRootRNode;
            } else {
                this.$$renderedVNode = this.$$render();
                this.$$renderedNodeProxy = createElement(this.$$renderedVNode);
            }

        } else {
            queueComponent(this);
        }

    }

    private $$render(): VNode {

        let vnode = this.render() || new VNode(VNodeType.Void, null, null, null);// 处理返回的VNode 是null 的情况
        return vnode;
    }

    private $$destory() {
        this.$$watcher.teardown();
        for (let w of this.$$watchers) {
            w.teardown()
        }
        this.$$watchers.length = 0;
    }

    render(): VNode {
        throw new Error('请重写本方法');
    }

    $set = set;
    $del = del;
}

(Component.prototype as any).__observe_forbidden__ = true;

export class ComponentStateless extends Component {

    constructor(props, renderFn) {
        super(props)
        this.render = () => {
            return renderFn(this.props);
        };
    }

}
