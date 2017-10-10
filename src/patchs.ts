import { ascending } from "./utils";
import { VNode, NativeElement } from "./vnode";
import { PatchTree, Patch, PatchType, PatchAppend, PatchRemove, PatchReplace, PatchReorder } from "./diff";
import { render } from "./render";

export function patch(patches: PatchTree) {
    patchEach(patches);
}

function patchEach(patches: PatchTree) {
    let indices: number[] = [];
    for (let key in patches) {
        indices.push(Number(key));
    }
    indices.sort(ascending);
    if (indices.length === 0) {
        return;
    }

    for (let i = 0; i < indices.length; i++) {
        applyPatch(patches[indices[i]]);
    }
}

function applyPatch(patchList) {
    if (Array.isArray(patchList)) {
        for (let i = 0; i < patchList.length; i++) {
            patchOp(patchList[i]);
        }
    } else {
        patchOp(patchList);
    }
}


// Maps a virtual om tree onto a om proxy tree in an efficient manner.
// We don't want to read all of the om nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a om node if we know that it contains a child of
// interest.

let noChild = {};


////////////
function patchOp(vpatch: Patch) {
    let { type } = vpatch
    switch (type) {
        case PatchType.Append:
            appendNode(vpatch as PatchAppend);
            break;
        case PatchType.Remove:
            removedChild(vpatch as PatchRemove)
            break;
        case PatchType.Replace:
            replaceNode(vpatch as PatchReplace)
            break;
        case PatchType.Reorder:
            reorderChildren(vpatch as PatchReorder);
            break;
    }
}

function appendNode(vpatch: PatchAppend) {
    let { parent, newNode } = vpatch
    render(newNode, parent.instance as NativeElement)
}

function removedChild(vpatch: PatchRemove) {
    let instance = vpatch.origin.instance as NativeElement;
    (instance.parentNode as NativeElement).removeChild(instance);
}

function replaceNode(vpatch: PatchReplace) {
    let instance = vpatch.origin.instance as NativeElement;
    let parent = instance.parentNode as NativeElement;
    let newNode = vpatch.newNode;
    if (parent && parent.instance) {
        parent.replaceChild(instance, render(newNode));
    }
}

function reorderChildren(vpatch: PatchReorder) {
    let { parent, moves } = vpatch;

    let childNodes = parent.children;
    let keyMap: { [key: string]: VNode } = {};
    let node: VNode;
    let remove: { from: number, key?: string };
    let insert: { to: number, key: string };

    let inserts = moves.inserts;
    let insertsLen = inserts.length
    let removes = moves.removes;
    let removesLen = removes.length;

    let reorderKeyMap: { [key: string]: true } = {};
    let insertKeyMap: { [key: string]: true } = {};
    for (let j = 0; j < insertsLen; j++) {
        insertKeyMap[inserts[j].key] = true;
    }

    //
    for (let i = 0; i < removesLen; i++) {
        remove = removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
            insertKeyMap[remove.key] && (reorderKeyMap[remove.key] = true);
        }
        removedChildWithArg(node, reorderKeyMap[remove.key])
    }

    for (let j = 0; j < insertsLen; j++) {
        insert = inserts[j];
        node = keyMap[insert.key];
        insertChildWithArg(parent, node, insert.to, reorderKeyMap[insert.key]);
    }

}

function removedChildWithArg(origin: VNode, recycle = false) {
    let instance = origin.instance as NativeElement;
    (instance.parentNode as NativeElement).removeChild(instance);
}

function insertChildWithArg(parent: VNode, child: VNode, insertTo: number, recycle = false) {
    if (parent && parent.instance) {
        let parentIns = parent.instance as NativeElement;
        let childNodes = parentIns.childNodes
        let index = insertTo;
        let refChild = childNodes[index];
        if (!recycle) {
            render(child)
        }
        parentIns.insertBefore(child.instance as NativeElement, refChild)
    }
}

