import { Component, View } from '../../libs';
import { h } from '../../../index';

export default class Tag extends Component {
  visible: boolean

  protected initialState() {
    return {
      visible: true
    }
  }

  constructor(props: Object) {
    super(props);
  }

  handleClose() {
    this.visible = false;
    this.emit('close');
  }

  render() {
    const { type, hit, closable, closeTransition, color } = this.props;

    return (
      <View key={this.visible} show={this.visible}>
        <span style={this.style({
          backgroundColor: color
        })} className={this.className('el-tag', type && `el-tag--${type}`, {
          'is-hit': hit
        })}>
          {this.props.children}
          {closable && <i className="el-tag__close el-icon-close" on-click={this.handleClose.bind(this)}></i>}
        </span>
      </View>
    )
  }
}
