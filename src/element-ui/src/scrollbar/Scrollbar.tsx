import { Component } from '../../libs';
import { addResizeListener, removeResizeListener } from '../../libs/utils/resize-event';
import { getScrollBarWidth } from './scrollbar-width';
import { Bar } from './Bar'
import { h, nextTick } from '../../../index';


const defaultProps = {
  viewComponent: 'div'
}

export class Scrollbar extends Component {
  cleanResize: () => void;
  cleanRAF: () => void;

  sizeWidth: string
  sizeHeight: string
  moveX: number
  moveY: number
  protected initialState() {
    return {
      sizeWidth: '0',
      sizeHeight: '0',
      moveX: 0,
      moveY: 0
    }
  }

  protected initialProps(props) {
    return { ...defaultProps, ...props };
  }

  get wrap() {
    return this.$refs.wrap;
  }

  mounted() {
    let handler = this.update.bind(this)
    let rafId = requestAnimationFrame(handler)
    this.cleanRAF = () => {
      cancelAnimationFrame(rafId)
    }
    if (!this.props.noresize) {
      addResizeListener(this.$refs.resize, handler)
      this.cleanResize = () => {
        removeResizeListener(this.$refs.resize, handler);
      }
    }
  }

  unmounted() {
    this.cleanRAF();
    this.cleanResize && this.cleanResize();
  }

  handleScroll() {
    const wrap = this.wrap;
    this.moveY = ((wrap.scrollTop * 100) / wrap.clientHeight)
    this.moveX = ((wrap.scrollLeft * 100) / wrap.clientWidth)
  }

  update() {
    let heightPercentage, widthPercentage;
    const wrap = this.wrap;
    if (!wrap) return;

    heightPercentage = (wrap.clientHeight * 100 / wrap.scrollHeight);
    widthPercentage = (wrap.clientWidth * 100 / wrap.scrollWidth);

    let sizeHeight = (heightPercentage < 100) ? (heightPercentage + '%') : '';
    let sizeWidth = (widthPercentage < 100) ? (widthPercentage + '%') : '';

    nextTick(() => {
      this.sizeHeight = sizeHeight
      this.sizeWidth = sizeWidth
    })
  }

  render() {

    let {
      native, viewStyle, wrapStyle, viewClass, children, viewComponent, wrapClass, noresize,
      className, ...others } = this.props;
    let { moveX, moveY, sizeWidth, sizeHeight } = this;

    let style = wrapStyle;
    const gutter = getScrollBarWidth();
    if (gutter) {
      const gutterWith = `-${gutter}px`;
      if (Array.isArray(wrapStyle)) {
        style = Object.assign.apply(null, [...wrapStyle, { marginRight: gutterWith, marginBottom: gutterWith }])
      } else {
        style = Object.assign({}, wrapStyle, { marginRight: gutterWith, marginBottom: gutterWith })
      }
    }

    const view = h(viewComponent, {
      className: this.classNames('el-scrollbar__view', viewClass),
      style: viewStyle,
      ref: (v) => {
        this.$refs.resize = v;
      }
    }, children);

    let nodes;
    if (!native) {
      const wrap = (
        <div ref="wrap"
          key={0}
          style={style}
          onScroll={this.handleScroll.bind(this)}
          className={this.classNames(wrapClass, 'el-scrollbar__wrap', gutter ? '' : 'el-scrollbar__wrap--hidden-default')}
        >
          {view}
        </div>
      )
      nodes = [
        wrap,
        <Bar key={1} move={moveX} size={sizeWidth} getParentWrap={() => this.wrap}></Bar>,
        <Bar key={2} move={moveY} size={sizeHeight} getParentWrap={() => this.wrap} vertical={true}></Bar>,
      ]
    } else {
      nodes = [
        (
          <div key={0} ref="wrap" className={this.classNames(wrapClass, 'el-scrollbar__wrap')} style={style}>
            {view}
          </div>
        )
      ]
    }

    return h('div', { className: this.classNames('el-scrollbar', className) }, nodes)
  }
}

