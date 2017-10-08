
enum VNodeFlags {
  Text = 1,
  NativeElement = 1 << 1,

  ComponentClass = 1 << 2,
  ComponentFunction = 1 << 3,
  ComponentUnknown = 1 << 4,

  HasKeyedChildren = 1 << 5,
  HasNonKeyedChildren = 1 << 6,

  Void = 1 << 12,
  Component = ComponentFunction | ComponentClass | ComponentUnknown
}

export default VNodeFlags;
