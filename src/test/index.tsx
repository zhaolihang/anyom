import { h, VNode, VNodeType } from "../vnode";
import { render } from "../render";
let body = document.body
let log = console.log;
let child1 = new VNode(VNodeType.Text, null, { value: String(123) }, null);
let child2 = new VNode(VNodeType.Text, null, { value: String(456) }, null);
let vnode = <div children={[child1, child2]}></div >
log(vnode)
render(vnode, body)


