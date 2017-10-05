import { Observer, Watcher, twoBind } from "../index";
let log = console.log;
let option = { sync: true };


let data = { a: 1 }
new Observer(data);
let w = new Watcher(data, 'a', (newV, oldV) => {
    log('a change')
}, option);
data.a = 2;



let data1 = { a: 1 }
let data2 = { b: 1 }
new Observer(data1);
new Observer(data2);
let dis = twoBind(data1, 'a', data2, 'b', { sync: true });
data1.a = 2;
log(data2.b)
dis();
data1.a = 3;
log(data2.b)
