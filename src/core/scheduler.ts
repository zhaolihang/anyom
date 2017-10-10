import { Component } from "./component";

const MAX_UPDATE_COUNT = 100;

const queue: Array<Component> = [];
let has: { [key: number]: true } = {};
let circular: { [key: number]: number } = {};

let waiting = false;
let flushing = false;
let index = 0;// flushingSchedulerQueueIndex

function resetSchedulerState() {
    index = queue.length = 0;
    has = {};
    waiting = flushing = false;
}


function flushSchedulerQueue() {

    flushing = true;
    let com: Component, id;
    queue.sort((a, b) => a.$$id - b.$$id);

    for (index = 0; index < queue.length; index++) {

        com = queue[index];
        id = com.$$id;
        has[id] = null;
        com.$$updateComponent();

        //check and stop circular updates.
        if (has[id] != null) {
            circular[id] = (circular[id] || 0) + 1;
            if (circular[id] > MAX_UPDATE_COUNT) {
                console.error('circulard update!');
                break;
            }
        }

    }

    resetSchedulerState();
}

export function queueComponent(com: Component) {
    const id = com.$$id;

    if (has[id] == null) {
        has[id] = true;

        if (!flushing) {
            queue.push(com);
        } else {
            // if already flushing, splice the watcher based on its id if already past its
            // id, it will be run next immediately.
            let i = queue.length - 1;
            while (i > index && queue[i].$$id > com.$$id) {
                i--;
            }
            queue.splice(i + 1, 0, com);
        }

        // queue the flush
        if (!waiting) {
            waiting = true;
            nextTick(flushSchedulerQueue);
        }

    }
}

const resolvedPromise = Promise.resolve();
function timerFun(cb) {
    resolvedPromise.then(() => {
        if (cb) {
            cb();
        }
    });
}
// for nextTick()
const callbacks = [];
let pending = false;

const nextTickHandler = () => {
    pending = false;
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    for (let i = 0; i < copies.length; i++) {
        copies[i]();
    }
}

export function nextTick(cb?: Function, ctx?: Object) {

    callbacks.push(() => {
        if (cb) {
            try {
                cb.call(ctx);
            } catch (e) {
                console.log(e);
            }
        }
    });

    if (!pending) {
        pending = true;
        timerFun(nextTickHandler);
    }

};
