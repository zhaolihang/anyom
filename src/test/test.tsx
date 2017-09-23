import { h } from "../h";
import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { VPatch, VPatchType, VNode } from "../vnode";
import { RealNodeProxy } from "../element";
import { Component } from "../component";
import { setCommand, getCommand } from "../commands";

const log = console.log;


const draggableDataName = 'html_draggable_droppable_dataname';
setCommand('draggable', {
    bind(node, newValue) {
        log('draggable bind', node, newValue);
        node.draggable = true;
        const data = newValue;
        node[draggableDataName] = data;
        const addDragCb = (el) => {
            el.onselectstart = function () {
                return false;
            };
            el.ondragstart = function (ev) {
                const el = ev.target;
                const h5dragedData = el[draggableDataName];
                ev.dataTransfer.effectAllowed = "copy";
                ev.dataTransfer.setData("h5dragedData", JSON.stringify(h5dragedData));
                return true;
            };
            el.ondragend = function (ev) {
                ev.dataTransfer.clearData("h5dragedData");
                return false
            };
        };
        addDragCb(node);
    },

    update(node, newValue, oldValue) {
        log('draggable update', node, newValue, oldValue);
        let data = newValue;
        node[draggableDataName] = data;
    },

    unbind(node, oldValue) {
        log('draggable unbind', node);
    },

});

setCommand('droppable', {

    bind(node, newValue) {
        log('droppable bind', node, newValue);
        let cb = newValue;
        let startColor = undefined;
        let timeID;
        let ishight = false;

        let hightLightElm = () => {
            if (startColor === undefined) {
                startColor = node.style.backgroundColor
                node.style.backgroundColor = "red";
            }
        }
        let unHightLightElm = () => {
            node.style.backgroundColor = startColor;
            startColor = undefined;
        }
        let hightLight = () => {
            hightLightElm();
            if (timeID) {
                clearTimeout(timeID);
            }
            timeID = setTimeout(() => {
                timeID = 0;
                unHightLightElm();
            }, 100);
        }
        node.ondragover = function (ev) {
            ev.preventDefault();
            hightLight();
            return true;
        };

        node.ondragenter = function (ev) {
            return true;
        };

        node.ondrop = function (ev) {
            ev.preventDefault();
            let h5dragedData = ev.dataTransfer.getData("h5dragedData");
            try {
                h5dragedData = JSON.parse(h5dragedData);
            } catch (error) {
                h5dragedData = 'error: droped data isnot JSON!';
            }
            if (typeof cb === 'function') {
                cb(h5dragedData);
            }
            return false;
        };
    },

    update(node, newValue, oldValue) {
        log('droppable update', node, newValue, oldValue);
    },

    unbind(node) {
        log('droppable unbind', node);
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

let firstVNode = (<div >
    {/* <Button title={'FirstButton'}></Button> */}
    <div key={'1'}>111</div>
    <div key={'2'}>222</div>
    <div key={'3'}>333</div>
    <div key={'4'}>444</div>
</div>)

let firstNodeProxy = render(firstVNode)
rootRealNodeProxy.appendChild(firstNodeProxy);

let secondVNode = (<div>

    <div key={'draggable'} commands={{ draggable: { a: 123 } }}>draggable</div>
    <div key={'4'}>444</div>
    <div key={'3'}>333</div>
    <div key={'droppable'} commands={{
        droppable: (data) => {
            log('droppable', data);
        },
    }}>droppable</div>
    <img height="100" src="http://nodejs.cn/static/images/logo.svg" ></img>
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

(window as any).rootnode = rootRealNodeProxy;