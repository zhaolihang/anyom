import { Observer, Watcher } from "../index";
let log = console.log;

let data = { a: 1 }
let ob = new Observer(data);
let w = new Watcher(data, 'a', (newV, oldV) => {
    log('a change')
});


data.a = 2;
// log(data.a)
