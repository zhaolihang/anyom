import { Component } from '../../libs';
import { h } from '../../../index';

export default class Icon extends Component {
  render() {
    return <i style={this.style()} className={this.className(`el-icon-${this.props.name}`)}></i>;
  }
}
