import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType, VNode } from "../vnode";
import { RealNodeProxy } from "../element";
import { Component } from "../component";
import { setCommand, getCommand } from "../commands";

const log = console.log;
const assert = console.assert;

setCommand('testCmd_1', {

    bind(node, newValue) {
        log('testCmd_1 bind', newValue);
    },

    update(node, newValue, oldValue) {
        log('testCmd_1 update', newValue, oldValue);
    },

    unbind(node) {
        log('testCmd_1 unbind');
    },
});

setCommand('testCmd_2', {

    bind(node, newValue) {
        log('testCmd_2 bind', newValue);
    },

    update(node, newValue, oldValue) {
        log('testCmd_2 update', newValue, oldValue);
    },

    unbind(node) {
        log('testCmd_2 unbind');
    },
});


const rootNode = document.getElementById('body');
let divVNode = new VNode('div');
const rootRealNodeProxy = new RealNodeProxy(divVNode);
rootNode.appendChild(rootRealNodeProxy.getRealNode());


class Button extends Component {
    render() {
        let title = this.props.title;
        let onclick = this.props.onclick;
        log('>>> Button render this.props ->', this.props);
        return (
            <button on-click={(e) => {
                if (onclick) {
                    onclick(e);
                }
            }} class={'button'} >{title || '按钮'}
            </button>
        );
    }
}


class App extends Component {
    created() {
        log('created');
    }
    mounted() {
        log('mounted');
    }
    unmounted() {
        log('unmounted');
    }
    updated() {
        log('updated');
    }

    render() {
        let btnTitle = this.props.btnTitle || 'SecondBut';
        let isName = this.props.isName;
        let input = isName ? <input key='name' ref='name' type='text' placeholder='name'></input> : <input key='password' ref='password' type='password' placeholder='password'></input>;
        this.props.num = this.props.num || 1;
        return (
            <div class={'app'}>
                <span style={{ display: 'block' }}>Hello world!</span>
                <Button ref={'butRefName' + (this.props.num)} onclick={() => {
                    this.setAttribute('isName', !!!isName);
                    this.setAttribute('num', this.props.num + 1);
                }} title={btnTitle}>
                </Button>
                {input}
            </div>
        );
    }
}

let firstVNode = (<div commands={{ testCmd_1: { a: 123 }, testCmd_2: true }}>
    {/* <Button title={'FirstButton'}></Button> */}
    <div key={'1'}>111</div>
    <div key={'2'}>222</div>
    <div key={'3'}>333</div>
    <div key={'4'}>444</div>
</div>)

let firstNode = render(firstVNode)
rootRealNodeProxy.appendChild(firstNode);

let secondVNode = (<div commands={{ testCmd_1: { a: 456 } }}>

    <div key={'10'}>101010</div>
    <div key={'4'}>444</div>
    <div key={'3'}>333</div>
    <div key={'2'}>222</div>
    <img height="100" src="http://nodejs.cn/static/images/logo.svg"></img>
    <App>
    </App>
    <div innerHTML="<div>I'm from innerHtml</div>"></div>
</div >)

setTimeout(() => {
    let patches = diff(firstVNode, secondVNode);
    log('*********************************************');
    log(patches);

    log('---------------------------------------------');
    log(firstNode);
    let newRootRNode = patch(firstNode, patches);
    log('---------------------------------------------');
    log(newRootRNode);

    log('---------------------------------------------');
    log(newRootRNode === firstNode);
}, 1000);

(window as any).getRootNode = function () {
    return rootRealNodeProxy;
}