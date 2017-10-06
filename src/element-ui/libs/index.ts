/*
 *  Only exposing the libraries for the public components,
 *  Internal components such as Markdown shouldn't be here.
 */

export { default as Component } from './component';
export { default as View } from './view';
import './cmds/click-outside';
