import { h, VNode, VNodeType } from "../vnode";
import { render } from "../render";
import { diff } from "../diff";
import { patch } from "../patch";
let body = document.body
let log = console.log;
function App(props) {
    return (
        <div>
            {props.text}
        </div>
    )
}
let vnode1 = <div>
    <App text="app first"></App>
</div >
let vnode2 = <div style={{ backgroundColor: 'red', height: '50px' }}>
    <App text="app second" ></App>
</div >

let ele = render(vnode1, body)
log(ele)

let patchTree = diff(vnode1, vnode2)
patch(patchTree)
log(patchTree)
log(vnode2);


