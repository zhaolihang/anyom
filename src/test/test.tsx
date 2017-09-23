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
        log('testCmd_1 bind', node, newValue);
    },

    update(node, newValue, oldValue) {
        log('testCmd_1 update', node, newValue, oldValue);
    },

    unbind(node, oldValue) {
        log('testCmd_1 unbind', node);
    },

});

setCommand('testCmd_2', {

    bind(node, newValue) {
        log('testCmd_2 bind', node, newValue);
    },

    update(node, newValue, oldValue) {
        log('testCmd_2 update', node, newValue, oldValue);
    },

    unbind(node) {
        log('testCmd_2 unbind', node);
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
        log('App created');
        this.props.num = 0;
    }
    mounted() {
        log('App mounted');
    }
    unmounted() {
        log('App unmounted');
    }
    updated() {
        log('App updated');
    }

    render() {
        let btnTitle = this.props.btnTitle || 'SecondBut';
        let isName = this.props.isName;
        let input = isName ? <input key='name' ref='name' type='text' placeholder='name'></input> : <input key='password' ref='password' type='password' placeholder='password'></input>;
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

let firstNodeProxy = render(firstVNode)
rootRealNodeProxy.appendChild(firstNodeProxy);

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
    log('patches', patches);

    log('---------------------------------------------');
    log('firstNodeProxy', firstNodeProxy);
    let newFirstNodeProxy = patch(firstNodeProxy, patches);
    log('---------------------------------------------');
    log('newFirstNodeProxy', newFirstNodeProxy);

    log('---------------------------------------------');
    log('newFirstNodeProxy === firstNodeProxy', newFirstNodeProxy === firstNodeProxy);
}, 1000);

(window as any).getRootNode = function () {
    return rootRealNodeProxy;
}