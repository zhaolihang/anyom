import { Component } from '../../libs';
import { h } from '../../../index';

export default class ButtonGroup extends Component {
  render() {
    return (
      <div style={this.style()} className={this.className('el-button-group')}>
        {this.props.children}
      </div>
    )
  }
}
