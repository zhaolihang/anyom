type AnyFn = (...args: any[]) => any;

export class EventEmitter {
    protected _listeners = {};

    on(evt: string, fn: AnyFn, ctx?: any) {
        (this._listeners[evt] || (this._listeners[evt] = [])).push({
            fn: fn,
            ctx: ctx || this
        });
        return this;
    }

    off(evt?: string, fn?: AnyFn): this;
    off(evt, fn) {
        if (evt === undefined)
            this._listeners = {};
        else {
            if (fn === undefined)
                this._listeners[evt] = [];
            else {
                var listeners = this._listeners[evt];
                for (var i = 0; i < listeners.length;)
                    if (listeners[i].fn === fn)
                        listeners.splice(i, 1);
                    else
                        ++i;
            }
        }
        return this;
    }

    emit(evt: string, ...args: any[]): this;
    emit(evt) {
        var listeners = this._listeners[evt];
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
