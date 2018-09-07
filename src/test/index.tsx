import { h, VNode, VNodeType } from "../core/vnode";
import { render } from "../core/render";
import { diff } from "../core/diff-patch";
import { Component } from "../core/component";
import { setCommand } from "../core/command";
let body = document.body
let log = console.log;

setCommand('cmd-tester', {
    inserted(node, newV) {
        log('cmd-tester  inserted', node, newV);
    },

    update(node, newV, oldV) {
        log('cmd-tester  update', node, newV, oldV);
    },

    remove(node, oldV) {
        log('cmd-tester  remove', node, oldV);
    },

});

class AbstructCom0 extends Component {
    render() {
        // log(this)
        return <div>AbstructCom0</div>
    }
}

class AbstructCom1 extends Component {
    render() {
        // log(this)
        return <div {...this.props} >AbstructCom1</div>
    }
}

class AbstructCom2 extends Component {
    render() {
        if (this.props.nouse) {
            return <AbstructCom1 nouse={this.props.nouse}></AbstructCom1>
        } else {
            return <AbstructCom0 nouse={this.props.nouse}></AbstructCom0>
        }
    }
}

function AbstructCom3(props) {
    return <AbstructCom2 nouse={props.nouse} cmd-tester={props.nouse}></AbstructCom2>
}

let vnode1 = <div><AbstructCom3 nouse={0}></AbstructCom3></div>
let vnode2 = <div><AbstructCom3 nouse={1}></AbstructCom3></div>

let ele = render(vnode1, body, null)
// log(vnode1)

let debug = 0;
setTimeout(() => {

    diff(vnode1, vnode2, null)
    // log(vnode2);

}, 1000);



