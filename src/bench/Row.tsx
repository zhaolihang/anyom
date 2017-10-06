import { Component, h } from "../index";
(window as any).rowsUpdated = 0;
(window as any).rowsMounted = 0;

export class Row extends Component {
	constructor(props) {
		super(props);
		this.onDelete = this.onDelete.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	onDelete() {
		this.emit('delete',this.props.data.id)
	}
	onClick() {
		this.emit('click',this.props.data.id)
	}

	render() {
		let { styleClass, onClick, onDelete, data } = this.props;
		return (<tr className={styleClass}>
			<td className="col-md-1">{data.id}</td>
			<td className="col-md-4">
				<a on-click={this.onClick}>{data.label}</a>
			</td>
			<td className="col-md-1"><a on-click={this.onDelete}><span className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>
			<td className="col-md-6"></td>
		</tr>);
	}
}

