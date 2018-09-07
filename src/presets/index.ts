import { setCommand } from "../core";

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
    inserted(node, newValue) {
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
        addDragCb(<any>node);
    },

    update(node, newValue, oldValue) {
        log('draggable update');
        let data = newValue;
        node[draggableDataName] = data;
    },

    remove(node, oldValue) {
        log('draggable unbind');
    },

});

setCommand('droppable', {

    inserted(node, newValue) {
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

    remove(node) {
        log('droppable unbind');
    },

});

setCommand('dragmove', {

    inserted(node, newValue) {
        log('dragmove bind');

        let dragEl: HTMLElement = <any>node;
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

    remove(node) {
        log('dragmove unbind');
    },

});