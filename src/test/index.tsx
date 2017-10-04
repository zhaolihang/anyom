import { diff } from "../diff";
import { patch } from "../patch";
import { render } from "../create-element";
import { NodeProxy } from "../node-proxy";
import { Component } from "../component";
import { setCommand, getCommand } from "../commands";
import { VNode, h } from "../vnode";

const log = console.log;

{//init html
    const body = document.getElementsByTagName("body")[0];
    const temp = document.createElement("div");
    temp.innerHTML = `<div id="fullscreenshadow_for_dragmovepanel" style="display:none;position:fixed;top:0;left:0;width:10000px;height:10000px;z-index:500;"></div>`;
    const shadow = temp.removeChild(temp.childNodes[0])
    body.insertBefore(shadow, body.childNodes[0]);
    shadow.addEventListener("mousedown", function (event) { }, false);
    shadow.addEventListener("mousemove", function (event) { }, false);
    shadow.addEventListener("mouseend", function (event) { }, false);
}

const draggableDataName = 'html_draggable_droppable_dataname';
setCommand('draggable', {
    bind(node, newValue) {
        log('draggable bind');
        node.draggable = true;
        const data = newValue;
        node[draggableDataName] = data;
        const addDragCb = (el: HTMLElement) => {
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
        log('draggable update');
        let data = newValue;
        node[draggableDataName] = data;
    },

    unbind(node, oldValue) {
        log('draggable unbind');
    },

});

setCommand('droppable', {

    bind(node, newValue) {
        log('droppable bind');
        const cb = newValue;
        let startColor = undefined;
        let timeID;
        let ishight = false;

        const hightLightElm = () => {
            if (startColor === undefined) {
                startColor = node.style.backgroundColor
                node.style.backgroundColor = "red";
            }
        }

        const unHightLightElm = () => {
            node.style.backgroundColor = startColor;
            startColor = undefined;
        }

        const hightLight = () => {
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
            let error;
            try {
                h5dragedData = JSON.parse(h5dragedData);
            } catch (e) {
                error = 'error: droped data isnot JSON!';
            }
            if (typeof cb === 'function') {
                cb(error, h5dragedData);
            }
            return false;
        };
    },

    update(node, newValue, oldValue) {
        log('droppable update');
    },

    unbind(node) {
        log('droppable unbind');
    },

});

setCommand('dragmove', {

    bind(node, newValue) {
        log('dragmove bind');

        let dragEl: HTMLElement = node;
        dragEl.style.position = 'fixed';

        let nMouseX, nMouseY, nStartX, nStartY;
        let bMouseUp = true;

        dragEl.addEventListener('mousedown', (mousedownEv) => {
            let shouldExit = true;
            for (let target = (mousedownEv.target as HTMLElement); target; target = (target.parentNode as HTMLElement)) {
                if (target === dragEl) {
                    shouldExit = false;
                    break;
                }
            }
            if (shouldExit) {
                return;
            }

            let shadow = document.getElementById('fullscreenshadow_for_dragmovepanel');
            if (shadow) {
                shadow.style.display = "block";
            }

            bMouseUp = false;
            nStartX = nStartY = 0;
            nMouseX = mousedownEv.clientX;
            nMouseY = mousedownEv.clientY;

            let moveEl = dragEl;
            moveEl.style.zIndex = '1001';
            for (let offParent = moveEl; offParent; offParent = (offParent.offsetParent as HTMLElement)) {
                nStartX += offParent.offsetLeft;
                nStartY += offParent.offsetTop;
            }

            const mousemoveHandler = (mousemoveEv: MouseEvent) => {
                if (bMouseUp) {
                    return;
                }
                moveEl.style.left = String(nStartX + mousemoveEv.clientX - nMouseX) + "px";
                moveEl.style.top = String(nStartY + mousemoveEv.clientY - nMouseY) + "px";
                mousemoveEv.stopPropagation();
                mousemoveEv.preventDefault();
            };

            const mouseupHandler = (mouseupEv: MouseEvent) => {

                bMouseUp = true;
                moveEl.style.zIndex = '1000';

                let shadow = document.getElementById('fullscreenshadow_for_dragmovepanel');
                if (shadow) {
                    shadow.style.display = "none";
                }

                document.removeEventListener('mousemove', mousemoveHandler);
                document.removeEventListener('mouseup', mouseupHandler);
                mouseupEv.stopPropagation();
                mouseupEv.preventDefault();

            };

            document.addEventListener('mousemove', mousemoveHandler);
            document.addEventListener('mouseup', mouseupHandler);
            mousedownEv.stopPropagation();
            mousedownEv.preventDefault();

        });
    },

    update(node, newValue, oldValue) {
        log('dragmove update');
    },

    unbind(node) {
        log('dragmove unbind');
    },

});

const rootNode = document.getElementById('body');
const rootNodeProxy = render(new VNode('div'))
rootNode.appendChild(rootNodeProxy.getNativeNode());

// const Flag = function (props) {
//     // log('ComponentStateless this === undefined', this === undefined);
//     return <div>{props.flag ? true : false} </div>
// }

let scope = this;
const Flag = (props) => {
    // log('ComponentStateless this=',this === scope);
    return <div>{props.flag ? true : false}</div>
}

class Tag extends Component {
    mounted() {
        log('Tag mounted');
    }

    unmounted() {
        log('Tag unmounted');
    }

    render() {
        let be = 0;
        return be ? (<div>small tag</div>) : (<Flag></Flag>);
    }
}

class Button extends Component {
    created() {
        log('Button created');
    }

    mounted() {
        log('Button mounted');
    }

    unmounted() {
        log('Button unmounted');
    }

    beforeUpdate() {
        log('Button beforeUpdate');
    }

    afterUpdate() {
        log('Button afterUpdate');
    }

    render() {
        let title = this.$props.title;
        return (
            <button className={'button'} on-click={(e) => {
                this.emit('click', e);
            }} >
                {title || '按钮'}
                {null}
            </button>
        );
    }
}

class Input extends Component {

    created() {
        log('Input created');
    }

    mounted() {
        log('Input mounted');
    }

    unmounted() {
        log('Input unmounted');
    }

    beforeUpdate() {
        log('Input beforeUpdate');
    }

    afterUpdate() {
        log('Input afterUpdate');
    }

    render() {
        return (
            <input ref='input' on-change={(e) => {
                this.emit('input', e.target.value);
                log(e.target.value);
            }} {...this.$props} />
        );
    }
}

class App extends Component {

    num: number;
    isName: boolean;
    btnTitle: string;
    testArr: string[];
    testObj: any;
    testString: string;
    inputString: string;
    initialState() {
        return {
            num: 0,
            isName: true,
            btnTitle: 'SecondBut',
            testArr: ['test1', 'test2'],
            testObj: { test1: 1, test2: 2 },
            testString: 'string',
            inputString: '',
        };
    }

    created() {
        log('App created');
    }

    mounted() {
        log('App mounted');
    }

    unmounted() {
        log('App unmounted');
    }

    beforeUpdate() {
        log('App beforeUpdate');
    }

    afterUpdate() {
        log('App afterUpdate');
    }

    render() {
        let testspread = { a: 0, c: 0 };
        let isName = this.isName;
        let btnTitle = this.btnTitle;
        let num = this.num;
        let input = isName ? <Input key='name' two-bind="inputString" ref={'name'} type='text' placeholder='name' /> : <Input key='password' ref={'password'} two-bind="inputString" type='password' placeholder='password' />;

        let testArr = this.testArr;
        let modelArr = testArr.map((v, i, arr) => {
            return <Input two-bind={arr[i]} />;
        });

        let testObj = this.testObj;
        let modelObj = Object.keys(testObj).map((key) => {
            return <Input two-bind={testObj[key]} />
        });

        return (
            <div a={{ a: 0 }} {...testspread} className={'app'}>
                <span style={{ display: 'block' }}>Hello world!</span>
                <Button ref={'button'} on-click={() => {
                    log('test ref name =', this.$refs.name);
                    this.isName = !isName;
                    this.num = num + 1;
                }} title={btnTitle}>
                    <Flag flag={isName}></Flag>
                </Button>
                {input}
                {modelObj}
            </div>
        );
    }
}

let firstVNode = (<div >
    <Button></Button>
    <div key={'1'}>111</div>
    <div key={'2'}>222</div>
    <div key={'3'}>333</div>
    <div key={'4'}>444</div>
</div>)

let firstNodeProxy = render(firstVNode)
rootNodeProxy.appendChild(firstNodeProxy);

let secondVNode = (<div>

    <div key={'draggable'} cmd-draggable={{ a: 123 }}>draggable</div>
    <div key={'4'}>444</div>
    <div key={'3'}>333</div>
    <div key={'droppable'} cmd-droppable={(error, data) => {
        if (!error) {
            log('droppable', data);
            return;
        }
        log(error);
    }}>droppable</div>
    <img height="100" src="http://nodejs.cn/static/images/logo.svg" ></img>
    <App>
    </App>
    <div cmd-dragmove={true} innerHTML="<div>I'm from innerHtml</div>"></div>
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

(window as any).rootnode = rootNodeProxy;