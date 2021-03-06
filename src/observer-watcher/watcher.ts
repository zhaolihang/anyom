/* @flow */

import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'
import { parsePath, isObject, remove, Set, ISet, def } from "./utils"

let uid = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */

export default class Watcher {
    public value: any;
    public vm: any;
    private cb: Function;

    public id: number;
    public deep: boolean;
    public lazy: boolean;
    public sync: boolean;
    public dirty: boolean;
    public active: boolean;

    private deps: Array<Dep>;
    private newDeps: Array<Dep>;
    private depIds: ISet;
    private newDepIds: ISet;
    private getter: Function;

    constructor(vm: any, expOrFn: string | Function, cb: Function, options?: {
        deep?: boolean,
        lazy?: boolean,
        sync?: boolean
    }) {

        if (vm === undefined || vm === null) {
            throw new Error('vm can not be undefined or null');
        }

        this.vm = vm;

        // options
        if (options) {
            this.deep = !!options.deep;
            this.lazy = !!options.lazy;
            this.sync = !!options.sync;
        } else {
            this.deep = this.lazy = this.sync = false;
        }

        this.cb = cb;
        this.id = ++uid; // uid for batching
        this.active = true;
        this.dirty = this.lazy; // for lazy watchers
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();

        // parse expression for getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = parsePath(expOrFn);
            if (!this.getter) {
                this.getter = function () { };
            }
        }

        this.value = this.lazy ? undefined : this.get();
    }

    /**
   * Evaluate the getter, and re-collect dependencies.
   */
    get() {

        pushTarget(this);
        let value;
        const vm = this.vm;

        try {
            value = this.getter.call(vm, vm);
        } catch (e) {
            console.error(e);
        } finally {
            // "touch" every property so they are all tracked as dependencies for deep
            // watching
            if (this.deep) {
                traverse(value);
            }
            popTarget();
            this.updateDeps();
        }

        return value;
    }

    /**
   * Add a dependency to this directive.
   */
    addDep(dep: Dep) {

        const id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    }

    /**
   * Clean up for dependency collection.
   */
    updateDeps() {

        let i = this.deps.length;
        while (i--) {
            const dep = this.deps[i];
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this);
            }
        }

        let tmp1 = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp1;
        this.newDepIds.clear();

        let tmp2 = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp2;
        this.newDeps.length = 0;
    }

    /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
    update() {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true;
        } else if (this.sync) {
            this.run();
        } else {
            queueWatcher(this);
        }
    }

    /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
    run() {
        if (this.active) {
            const value = this.get();

            // Deep watchers and watchers on Object/Arrays should fire even when the value
            // is the same, because the value may have mutated.
            if (value !== this.value || isObject(value) || this.deep) {
                // set new value
                const oldValue = this.value;
                this.value = value;
                this.cb.call(this.vm, value, oldValue);
            }
        }
    }

    /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
    evaluate() {
        this.value = this.get();
        this.dirty = false;
        return this.value;
    }

    /**
   * Depend on all deps collected by this watcher.
   */
    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();
        }
    }

    /**
   * Remove self from all dependencies' subscriber list.
   */
    teardown() {
        if (this.active) {
            let i = this.deps.length;
            while (i--) {
                this.deps[i].removeSub(this);
            }
            this.active = false;
        }
    }
}

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
const seenObjects = new Set();

function traverse(val: any) {
    seenObjects.clear();
    _traverse(val, seenObjects);
}

function _traverse(val: any, seen: ISet) {
    if (!val || val.$$observeForbidden) {
        return
    }
    let i, keys;
    const isA = Array.isArray(val);

    if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
        return;
    }

    if (val.__observer) {
        const depId = val.__observer.dep.id;
        // if obj is hit, it is in circular structure
        if (seen.has(depId)) {
            return;
        }
        seen.add(depId);
    }

    if (isA) {
        i = val.length;
        while (i--) {
            _traverse(val[i], seen);
        }
    } else {
        keys = Object.keys(val);
        i = keys.length;
        while (i--) {
            // val[keys[i]] will evaluate reactiveGetter by Observer defined
            _traverse(val[keys[i]], seen);
        }
    }
}
