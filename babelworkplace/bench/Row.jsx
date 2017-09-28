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
import { Component, h } from "../index";
window.rowsUpdated = 0;
window.rowsMounted = 0;
var Row = /** @class */ (function (_super) {
    __extends(Row, _super);
    function Row(props) {
        var _this = _super.call(this, props) || this;
        _this.onDelete = _this.onDelete.bind(_this);
        _this.onClick = _this.onClick.bind(_this);
        return _this;
    }
    Row.prototype.onDelete = function () {
        this.props.onDelete(this.props.data.id);
    };
    Row.prototype.onClick = function () {
        this.props.onClick(this.props.data.id);
    };
    Row.prototype.render = function () {
        var _a = this.props, styleClass = _a.styleClass, onClick = _a.onClick, onDelete = _a.onDelete, data = _a.data;
        return (<tr className={styleClass}>
			<td className="col-md-1">{data.id}</td>
			<td className="col-md-4">
				<a on-click={this.onClick}>{data.label}</a>
			</td>
			<td className="col-md-1"><a on-click={this.onDelete}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>
			<td className="col-md-6"></td>
		</tr>);
    };
    return Row;
}(Component));
export { Row };
//# sourceMappingURL=Row.jsx.map