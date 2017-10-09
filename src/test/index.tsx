import { h, VNode, VNodeType } from "../vnode";
import { render } from "../render";
import { diff } from "../diff";
import { patch } from "../patchs";

let body = document.body
let log = console.log;
let vnode1 = <div>
    <span key='1'>1</span>
    <span key='2'>2</span>
    <span key='3'>3</span>
</div >
let vnode2 = <div>
    <span key='3'>3</span>
    <span key='1'>1</span>
    <span key='2'>2</span>
    <span >?</span>
</div >

render(vnode1, body)

let patchTree = diff(vnode1, vnode2)
patch(patchTree)
log(patchTree)
log(vnode2);


