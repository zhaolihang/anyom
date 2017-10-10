import { h, VNode, VNodeType } from "../core/vnode";
import { render } from "../core/render";
import { diff } from "../core/diff";
import { patch } from "../core/patch";
import { Component } from "../core/component";
let body = document.body
let log = console.log;
function App(props) {
    return (
        <div>
            {props.text}
        </div>
    )
}

class TestCom extends Component {

    render() {
        return (
            <App text={this.props.text}>
            </App>
        )
    }
}

let vnode1 = <div>
    <TestCom text="app first"></TestCom>
</div >
let vnode2 = <div style={{ backgroundColor: 'red', height: '50px' }}>
    <TestCom text="app second" ></TestCom>
</div >

let ele = render(vnode1, body)
let patchTree = diff(vnode1, vnode2)

patch(patchTree)
log(patchTree)
log(vnode2);


