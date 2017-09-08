import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType } from "../vnode";
import { RNode } from "../element";

let log = console.log;
let assert = console.assert;

let rootVNode1 = (<div>
    <img src={'1.png'} ></img>
    <img src={'2.png'} ></img>
    <img src={'3.png'} ></img>
</div>)

let rootRNode = render(rootVNode1)
let root = new RNode('root');
root.appendChild(rootRNode);

let rootVNode2 = (<span data={{ a: 0 }}>
    <img src={'2.png'} ></img>
    <input value={'00'} ></input>
    <img src={'3.png'} ></img>
    <img src={'5.png'} ></img>
</span>)

let patches = diff(rootVNode1, rootVNode2);
log(patches);

log(rootRNode);
let newRootRNode = patch(rootRNode, patches);
log(newRootRNode);
log(newRootRNode === rootRNode);
