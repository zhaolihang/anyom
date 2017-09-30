import Watcher from "./watcher"
import { Observer, set, del, getObserver } from "./observer"
import { setTimerFun, getTimerFun } from "./scheduler"
import { twowayBind } from "./twoway-bind";
import { deepCopy } from "./deep-copy";

export {
    Watcher,
    Observer,
    getObserver,
    twowayBind,
    set,
    del,
    setTimerFun,
    getTimerFun,
    deepCopy,
}
