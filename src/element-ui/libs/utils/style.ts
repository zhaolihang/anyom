export function reset(css) {
  const style = document.createElement('style');
  style.type = 'text/css';
  if ((style as any).styleSheet) {
    (style as any).styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  (document.head || document.getElementsByTagName('head')[0]).appendChild(style);
}
