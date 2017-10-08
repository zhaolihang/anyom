import { h, VNode, VNodeType } from "../vnode";
let log = console.log;
let child: any = '23'
child = new VNode(VNodeType.Text, null, { value: String(child) }, null);
let vnode = <div children={child}></div >
log(vnode)


