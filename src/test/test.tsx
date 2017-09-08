import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { createElement } from "../create-element";

let log = console.log;

let rootVNode1 = (<div>
    <img src={'1.png'} ></img>
    <img src={'2.png'} ></img>
    <img src={'3.png'} ></img>
</div>)

let rootRNode = createElement(rootVNode1)

let rootVNode2 = (<div>
    <img src={'0.png'} ></img>
    <img src={'2.png'} ></img>
    <img src={'3.png'} ></img>
</div>)

let patches = diff(rootVNode1, rootVNode2)

log(patches);
log(rootRNode);
let newRootRNode = patch(rootRNode, patches);
log(newRootRNode);
log(newRootRNode === rootRNode);
