import { Observer, set } from "./observer";
import { segmentsPath, getObjBySegments } from "./utils";
import Watcher from "./watcher";

export let twowayBind = (dataA: any, dataAPath: string, dataB: any, dataBPath: string, options = { deep: false, sync: false }) => {
    if (!(dataA.__observer__ instanceof Observer)) {
        throw new Error('dataA isnot be observed!');
    }

    if (!(dataB.__observer__ instanceof Observer)) {
        throw new Error('dataB isnot be observed!');
    }

    let segmentsA = segmentsPath(dataAPath);
    let segmentsA_1 = [...segmentsA];
    let segmentsA_last = segmentsA_1.pop();

    let segmentsB = segmentsPath(dataBPath);
    let segmentsB_1 = [...segmentsB];
    let segmentsB_last = segmentsB_1.pop();

    let cb_A = (newV, oldV) => {
        let obj = getObjBySegments(dataB, segmentsB_1);
        obj && set(obj, segmentsB_last, newV);
    };

    let watcher_A = new Watcher(dataA, dataAPath, cb_A, options);

    let cb_B = (newV, oldV) => {
        let obj = getObjBySegments(dataA, segmentsA_1);
        obj && set(obj, segmentsA_last, newV);
    };

    let watcher_B = new Watcher(dataB, dataBPath, cb_B, options);

    return function disconnect() {
        watcher_A.cleanupDeps()
        watcher_B.cleanupDeps()
    };

};

