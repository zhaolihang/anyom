import { Row } from "./Row";
import { Store } from "./Store";
import { Component, h, render } from "../index";
var startTime;
var lastMeasure;
var startMeasure = function (name) {
    startTime = performance.now();
    lastMeasure = name;
}
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
}

export class Main extends Component {
    start = 0;
    length = 0;
    constructor(props) {
        super(props);
        (this as any).state = { store: new Store() };
        this.select = this.select.bind(this);
        this.delete = this.delete.bind(this);
        this.add = this.add.bind(this);
        this.run = this.run.bind(this);
        this.update = this.update.bind(this);
        this.runLots = this.runLots.bind(this);
        this.clear = this.clear.bind(this);
        this.swapRows = this.swapRows.bind(this);

        (window as any).app = this;
    }

    beforeUpdate() {
        console.log('Main beforeUpdate');
    }

    afterUpdate() {
        console.log('Main afterUpdate');
    }

    printDuration() {
        stopMeasure();
    }
    run() {
        startMeasure("run");
        (this as any).state.store.run();
        (this as any).setState({ store: (this as any).state.store });
    }
    add() {
        startMeasure("add");
        (this as any).state.store.add();
        (this as any).setState({ store: (this as any).state.store });
    }
    update() {
        startMeasure("update");
        (this as any).state.store.update();
        (this as any).setState({ store: (this as any).state.store });
    }
    select(id) {
        startMeasure("select");
        (this as any).state.store.select(id);
        (this as any).setState({ store: (this as any).state.store });
    }
    delete(id) {
        startMeasure("delete");
        (this as any).state.store.delete(id);
        (this as any).setState({ store: (this as any).state.store });
    }
    runLots() {
        startMeasure("runLots");
        (this as any).state.store.runLots();
        (this as any).setState({ store: (this as any).state.store });
    }
    clear() {
        startMeasure("clear");
        (this as any).state.store.clear();
        (this as any).setState({ store: (this as any).state.store });
    }
    swapRows() {
        startMeasure("swapRows");
        (this as any).state.store.swapRows();
        (this as any).setState({ store: (this as any).state.store });
    }
    render() {
        let rows = (this as any).state.store.data.map((d, i) => {
            return <Row key={d.id} data={d} onClick={this.select} onDelete={this.delete} styleClass={d.id === (this as any).state.store.selected ? 'danger' : ''}></Row>
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
    }
}

document.getElementById('main').appendChild(render(<Main />).getNativeNode());
