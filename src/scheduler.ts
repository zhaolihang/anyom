import { Component, RenderMode, LifeCycleType } from "./component";

const queue: Array<Component> = [];
let has: { [key: number]: true } = {};

let waiting = false;
let flushing = false;
let index = 0;// flushingIndex

function resetSchedulerState() {
    index = queue.length = 0;
    has = {};
    waiting = flushing = false;
}

function flushSchedulerQueue() {
    flushing = true;
    let component: Component, id;
    queue.sort((a, b) => a.id - b.id);

    for (index = 0; index < queue.length; index++) {
        component = queue[index];
        id = component.id;
        has[id] = null;
        component[LifeCycleType.BeforeUpdate] && component[LifeCycleType.BeforeUpdate]();
        component.forceUpdate(RenderMode.SYNC);
    }

    for (index = 0; index < queue.length; index++) {
        component = queue[index];
        component[LifeCycleType.AfterUpdate] && component[LifeCycleType.AfterUpdate]();
    }
    resetSchedulerState();
}


export function queueComponent(component: Component) {
    const id = component.id;
    if (!has[id]) {
        has[id] = true;
        if (!flushing) {
            queue.push(component);
        } else {
            let i = queue.length - 1;
            while (i > index && queue[i].id > component.id) {
                i--;
            }
            queue.splice(i + 1, 0, component);
        }
        // queue the flush
        if (!waiting) {
            waiting = true;
            nextTick(flushSchedulerQueue);
        }
    }
}
// for nextTick()
let callbacks = [];
let pending = false;

const nextTickHandler = () => {
    pending = false;
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    for (let i = 0; i < copies.length; i++) {
        copies[i]();
    }
}

const defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

export function nextTick(cb?: Function, ctx?: Object) {
    if (!cb) {
        return;
    }
    callbacks.push(() => {
        try {
            cb.call(ctx);
        } catch (e) {
            console.error(e);
        }
    });
    if (!pending) {
        pending = true;
        defer(nextTickHandler);
    }
};
