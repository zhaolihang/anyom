import { render, createVNode } from "../inferno-core/src/index";
import createElement from "../inferno-core/src/create-element/index";

let log = console.log;

let rootElement = document.createElement('div');
rootElement.id = 'apptest'
document.body.appendChild(rootElement);

const bar = createVNode(2, "div", "456", null, null, null, null, true);
let foo = createVNode(2, "div", "123", [bar], null, null, null, true);

render(foo, rootElement);
log(foo);

foo = createVNode(2, "div", "123", [bar], null, null, null, true);

render(foo, rootElement);
log(foo);