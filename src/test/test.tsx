import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { createElement } from "../create-element";
import { VPatch, VPatchType } from "../vnode";

let log = console.log;
let assert = console.assert;

let rootVNode1 = (<div>
    <img src={'1.png'} ></img>
    <img src={'2.png'} ></img>
    <img src={'3.png'} ></img>
</div>)

let rootRNode = createElement(rootVNode1)

let rootVNode2 = (<div>
    <img src={'2.png'} ></img>
    <img src={'0.png'} ></img>
    <img src={'3.png'} ></img>
    <img src={'5.png'} ></img>
</div>)

let patches = diff(rootVNode1, rootVNode2);
log(patches);

assert((patches[0] as VPatch).type === VPatchType.INSERT);

log(rootRNode);
let newRootRNode = patch(rootRNode, patches);
log(newRootRNode);

assert(newRootRNode === rootRNode);
