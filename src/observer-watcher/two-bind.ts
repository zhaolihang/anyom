import { Observer, set } from "./observer";
import { segmentsPath, getObjBySegments } from "./utils";
import Watcher from "./watcher";

export let twoBind = (dataA: any, dataAPath: string, dataB: any, dataBPath: string, options: { deep?: boolean, sync?: boolean }) => {
    if (!(dataA.__observer instanceof Observer)) {
        new Observer(dataA);
    }

    if (!(dataB.__observer instanceof Observer)) {
        new Observer(dataB);
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
        watcher_A.teardown();
        watcher_B.teardown();
    };

};

