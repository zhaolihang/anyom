import classnames from 'classnames';
import { Component } from '../../../index';


export default class ElComponent extends Component {
  classNames(...args) {
    return classnames(args);
  }

  className(...args) {
    return this.classNames.apply(this, args.concat([this.props.className]));
  }

  style(args?) {
    return Object.assign({}, args, this.props.style)
  }
}
