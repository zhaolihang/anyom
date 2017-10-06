import { setCommand } from "../../../index";


setCommand('clickOutside', {
    bind(node, value) {// value is a callback
        const domNode = node
        value.handler = (e) => {
            if ((!domNode || !domNode.contains(e.target))
                && typeof value === 'function') {
                value(e);
            }
        }
        document.addEventListener('click', value.handler, true);
    },

    unbind(node, value) {
        document.removeEventListener('click', value.handler, true);
    },

});
