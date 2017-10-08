export interface NativeElement {
    type: number;
}

export function setClassName(dom: NativeElement, className: string): NativeElement {
    return dom;
}
export function removeClassName(dom: NativeElement) {
    return dom;
}


export function createTextNode(value: string): NativeElement {
    return null;
}


export function getFirstChild(dom: NativeElement): NativeElement {
    return null;
}


export function getNextSibling(dom: NativeElement): NativeElement {
    return null;
}
export function removeDomChild(parentDom: NativeElement, dom: NativeElement) {
    return null;
}


export function getTagName(dom: NativeElement): any {
    return null;
}


export function getParentNode(dom: NativeElement): NativeElement {
    return null;
}


export function setTextContentNull(dom: NativeElement) {
}
export function setTextContent(dom: NativeElement, value: string) {
}

export function isTextNode(dom: NativeElement) {
}

export function getTextByTextNode(dom: NativeElement): string {
    return null
}



export function setTextByTextNode(dom: NativeElement, value: string) {
}

export function getNodeValue(dom: NativeElement): string {
    return null
}


export function setNodeValue(dom: NativeElement, value: string) {
}

export function setProp(dom: NativeElement, name: string, value: string) {
}
export function removeAttr(dom: NativeElement, name: string) {
}

export function setInnerHtml(dom: NativeElement, innerHTML: string) {
}
export function getInnerHtml(dom: NativeElement): string {
    return null
}


export function getDomEventByName(dom: NativeElement, name: string): any {
}
export function setDomEventByName(dom: NativeElement, name: string, value: any) {
}
