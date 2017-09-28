var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Row } from "./Row";
import { Store } from "./Store";
import { Component, h, render } from "../index";
var startTime;
var lastMeasure;
var startMeasure = function (name) {
    startTime = performance.now();
    lastMeasure = name;
};
var stopMeasure = function () {
    var last = lastMeasure;
    if (lastMeasure) {
        window.setTimeout(function () {
            lastMeasure = null;
            var stop = performance.now();
            var duration = 0;
            console.log(last + " took " + (stop - startTime));
        }, 0);
    }
};
var Main = /** @class */ (function (_super) {
    __extends(Main, _super);
    function Main(props) {
        var _this = _super.call(this, props) || this;
        _this.start = 0;
        _this.length = 0;
        _this.state = { store: new Store() };
        _this.select = _this.select.bind(_this);
        _this.delete = _this.delete.bind(_this);
        _this.add = _this.add.bind(_this);
        _this.run = _this.run.bind(_this);
        _this.update = _this.update.bind(_this);
        _this.runLots = _this.runLots.bind(_this);
        _this.clear = _this.clear.bind(_this);
        _this.swapRows = _this.swapRows.bind(_this);
        window.app = _this;
        return _this;
    }
    Main.prototype.beforeUpdate = function () {
        console.log('Main beforeUpdate');
    };
    Main.prototype.afterUpdate = function () {
        console.log('Main afterUpdate');
        this.printDuration();
    };
    Main.prototype.printDuration = function () {
        stopMeasure();
    };
    Main.prototype.run = function () {
        startMeasure("run");
        this.state.store.run();
        this.setState({ store: this.state.store });
    };
    Main.prototype.add = function () {
        startMeasure("add");
        this.state.store.add();
        this.setState({ store: this.state.store });
    };
    Main.prototype.update = function () {
        startMeasure("update");
        this.state.store.update();
        this.setState({ store: this.state.store });
    };
    Main.prototype.select = function (id) {
        startMeasure("select");
        this.state.store.select(id);
        this.setState({ store: this.state.store });
    };
    Main.prototype.delete = function (id) {
        startMeasure("delete");
        this.state.store.delete(id);
        this.setState({ store: this.state.store });
    };
    Main.prototype.runLots = function () {
        startMeasure("runLots");
        this.state.store.runLots();
        this.setState({ store: this.state.store });
    };
    Main.prototype.clear = function () {
        startMeasure("clear");
        this.state.store.clear();
        this.setState({ store: this.state.store });
    };
    Main.prototype.swapRows = function () {
        startMeasure("swapRows");
        this.state.store.swapRows();
        this.setState({ store: this.state.store });
    };
    Main.prototype.render = function () {
        var _this = this;
        var rows = this.state.store.data.map(function (d, i) {
            return <Row key={d.id} data={d} onClick={_this.select} onDelete={_this.delete} styleClass={d.id === _this.state.store.selected ? 'danger' : ''}></Row>;
        });
        return (<div className="container">
            <div className="jumbotron">
                <div className="row">
                    <div className="col-md-6">
                        <h1>anyom v0.0.x</h1>
                    </div>
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col-sm-6 smallpad">
                                <button type="button" className="btn btn-primary btn-block" id="run" on-click={this.run}>Create 1,000 rows</button>
                            </div>
                            <div className="col-sm-6 smallpad">
                                <button type="button" className="btn btn-primary btn-block" id="runlots" on-click={this.runLots}>Create 10,000 rows</button>
                            </div>
                            <div className="col-sm-6 smallpad">
                                <button type="button" className="btn btn-primary btn-block" id="add" on-click={this.add}>Append 1,000 rows</button>
                            </div>
                            <div className="col-sm-6 smallpad">
                                <button type="button" className="btn btn-primary btn-block" id="update" on-click={this.update}>Update every 10th row</button>
                            </div>
                            <div className="col-sm-6 smallpad">
                                <button type="button" className="btn btn-primary btn-block" id="clear" on-click={this.clear}>Clear</button>
                            </div>
                            <div className="col-sm-6 smallpad">
                                <button type="button" className="btn btn-primary btn-block" id="swaprows" on-click={this.swapRows}>Swap Rows</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <table className="table table-hover table-striped test-data">
                <tbody>
                    {rows}
                </tbody>
            </table>
            <span className="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
        </div>);
    };
    return Main;
}(Component));
export { Main };
document.getElementById('main').appendChild(render(<Main />).getNativeNode());
//# sourceMappingURL=index.jsx.map