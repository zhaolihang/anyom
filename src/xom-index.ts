// Maps a virtual xom tree onto a real xom tree in an efficient manner.
// We don't want to read all of the xom nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a xom node if we know that it contains a child of
// interest.

import { RNode, VNode } from "./vnode";

let noChild = {}

export function xomIndex(rootNode: RNode, tree: VNode, indices: number[], nodes = undefined) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode: RNode, tree, indices, nodes: { [index: number]: RNode }, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        let vChildren = tree.children

        if (vChildren) {

            let childNodes = rootNode.childNodes

            for (let i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                let vChild = vChildren[i] || noChild
                let nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    let minIndex = 0
    let maxIndex = indices.length - 1
    let currentIndex
    let currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}
