export type AnyFn = (...args: any[]) => any;

export class EventEmitter {
    protected $$listeners = {};

    on(evt: string, fn: AnyFn, ctx?: any) {
        (this.$$listeners[evt] || (this.$$listeners[evt] = [])).push({
            fn: fn,
            ctx: ctx || this
        });
        return this;
    }

    off(evt?: string, fn?: AnyFn): this;
    off(evt, fn) {
        if (evt === undefined)
            this.$$listeners = {};
        else {
            if (fn === undefined)
                this.$$listeners[evt] = [];
            else {
                var listeners = this.$$listeners[evt];
                let find = false;
                for (var i = 0; i < listeners.length;) {
                    if (listeners[i].fn === fn) {
                        find = true
                        listeners.splice(i, 1);
                    } else {
                        ++i;
                    }
                }
                if (!find) {
                    console.log(fn)
                    debugger;
                }
            }
        }
        return this;
    }

    emit(evt: string, ...args: any[]): this;
    emit(evt) {
        var listeners = this.$$listeners[evt];
        if (listeners) {
            var args = [],
                i = 1;
            for (; i < arguments.length;)
                args.push(arguments[i++]);
            for (i = 0; i < listeners.length;)
                listeners[i].fn.apply(listeners[i++].ctx, args);
        }
        return this;
    }
}
