import Watcher from "./watcher";

const MAX_UPDATE_COUNT = 100;

const queue: Array<Watcher> = [];
const activatedChildren: Array<any> = [];
let has: { [key: number]: true } = {};
let circular: { [key: number]: number } = {};

let waiting = false;
let flushing = false;
let index = 0;// flushingSchedulerQueueIndex

function resetSchedulerState() {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    waiting = flushing = false;
}

function flushSchedulerQueue() {

    flushing = true;
    let watcher: Watcher, id;
    queue.sort((a, b) => a.id - b.id);

    for (index = 0; index < queue.length; index++) {

        watcher = queue[index];
        id = watcher.id;
        has[id] = null;
        watcher.run();

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

export function queueWatcher(watcher: Watcher) {
    const id = watcher.id;

    if (has[id] == null) {
        has[id] = true;

        if (!flushing) {
            queue.push(watcher);
        } else {
            // if already flushing, splice the watcher based on its id if already past its
            // id, it will be run next immediately.
            let i = queue.length - 1;
            while (i > index && queue[i].id > watcher.id) {
                i--;
            }
            queue.splice(i + 1, 0, watcher);
        }

        // queue the flush
        if (!waiting) {
            waiting = true;
            nextTick(flushSchedulerQueue);
        }

    }
}

type TimerFunType = (fun: (...any) => any, time: number) => any;
let timerFun: TimerFunType = setTimeout;

export const setTimerFun = (v: TimerFunType) => {
    timerFun = v;
};
export const getTimerFun = () => {
    return timerFun;
};

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
        timerFun(nextTickHandler, 0);
    }

};
