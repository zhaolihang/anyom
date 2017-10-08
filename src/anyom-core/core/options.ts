/**
 * @module Inferno
 */ /** TypeDoc Comment */

import { LifecycleClass } from "../shared";
import { InfernoInput } from "./VNodes";
import { NativeElement } from "../native";
export interface Root {
  dom: NativeElement;
  input: InfernoInput;
  lifecycle: LifecycleClass;
}

export const options: {
  afterMount: null | Function;
  afterRender: null | Function;
  afterUpdate: null | Function;
  beforeRender: null | Function;
  beforeUnmount: null | Function;
  createVNode: null | Function;
  findDOMNodeEnabled: boolean;
  roots: Root[];
} = {
  afterMount: null,
  afterRender: null,
  afterUpdate: null,
  beforeRender: null,
  beforeUnmount: null,
  createVNode: null,
  findDOMNodeEnabled: false,
  roots: []
};
