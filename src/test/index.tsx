import { render, createVNode } from "../inferno-core/src/index";
import createElement from "../inferno-core/src/create-element/index";
import { setCommand } from "../inferno-core/src/command/index";


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


let log = console.log;

let rootElement = document.createElement('div');
rootElement.id = 'apptest'
document.body.appendChild(rootElement);

const bar = createVNode(2, "div", "456", null, null, null, null, null, true);
let foo = createVNode(2, "div", "123", [bar], null, null, null, null, true);

render(foo, rootElement);
log(foo);

foo = createVNode(2, "div", "123", [bar], null, null, null, null, true);

render(foo, rootElement);
log(foo);

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
    <img cmd-dragmove={true} height="100" src="http://nodejs.cn/static/images/logo.svg" ></img>
</div >)


render(secondVNode, rootElement);
