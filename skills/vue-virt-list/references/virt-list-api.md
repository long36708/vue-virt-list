# VirtList API 完整文档

## 属性（Props）

| 参数 | 说明 | 类型 | 默认值 | 必需 |
|------|------|------|--------|------|
| list | 数据源 | `Array` | - | ✅ 是 |
| itemKey | 项目的唯一标识，**必须唯一**（否则无法正常滚动） | `String \| Number` | - | ✅ 是 |
| minSize | 最小尺寸，根据这个尺寸计算可视区域内个数 | `Number` | `20` | ✅ 是 |
| itemGap | 元素之间的间距（元素尺寸包含 itemGap） | `Number` | `0` | - |
| fixed | 是否为固定高度，可以提升性能<br>**注意：动态高度模式下，请勿使用** | `Boolean` | `false` | - |
| buffer | 当渲染量大，滚动白屏严重时，给定数值，bufferTop 和 bufferBottom 会等于 buffer | `Number` | `0` | - |
| bufferTop | 顶部 buffer 个数 | `Number` | `0` | - |
| bufferBottom | 底部 buffer 个数 | `Number` | `0` | - |
| horizontal | 是否水平滚动 | `Boolean` | `false` | - |
| scrollDistance | 滚动阈值（提前触发 toTop 或 toBottom），单位：px | `number` | `0` | - |
| fixSelection | 是否需要修复滚动丢失 selection 问题（仅 Vue 2 下需要和生效） | `Boolean` | `false` | - |
| start | 起始渲染下标 | `Number` | `0` | - |
| offset | 起始渲染顶部高度 | `Number` | `0` | - |
| listStyle | 列表容器样式 | `string \| Array<string \| { [key: string]: any }> \| { [key: string]: any }` | `''` | - |
| listClass | 列表容器类名 | `string \| Array<string> \| { [key: string]: boolean }` | `''` | - |
| itemStyle | item 容器样式，支持函数形式 | `string \| Array<string \| { [key: string]: any }> \| { [key: string]: any } \| ((item, index) => ...)` | `''` | - |
| itemClass | item 容器类名，支持函数形式 | `string \| Array<string> \| { [key: string]: boolean } \| ((item, index) => ...)` | `''` | - |
| renderControl | 渲染控制器 | `(begin: number, end: number) => { begin: number; end: number }` | - | - |
| headerClass | header 插槽类名 | `ClassType` | `''` | - |
| headerStyle | header 插槽样式 | `StyleType` | `''` | - |
| footerClass | footer 插槽类名 | `ClassType` | `''` | - |
| footerStyle | footer 插槽样式 | `StyleType` | `''` | - |
| stickyHeaderClass | sticky header 插槽类名 | `ClassType` | `''` | - |
| stickyHeaderStyle | sticky header 插槽样式 | `StyleType` | `''` | - |
| stickyFooterClass | sticky footer 插槽类名 | `ClassType` | `''` | - |
| stickyFooterStyle | sticky footer 插槽样式 | `StyleType` | `''` | - |

## 插槽（Slots）

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| default | item 内容 | `{ itemData, index }` |
| header | 顶部插槽 | - |
| footer | 底部插槽 | - |
| sticky-header | 顶部悬浮插槽 | - |
| sticky-footer | 底部悬浮插槽 | - |
| empty | 空数据插槽 | - |

## 事件（Events）

| 事件名 | 说明 | 参数 |
|--------|------|------|
| toTop | 触顶的回调 | 列表中第一项（`any`） |
| toBottom | 触底的回调 | 列表中最后一项（`any`） |
| scroll | 滚动的回调 | `event: Event` |
| itemResize | Item 尺寸发生变化 | `{ id: string, newSize: number }` |
| rangeUpdate | 可视区范围变更 | `{ inViewBegin: number, inViewEnd: number }` |

## 暴露方法（Exposed Methods）

通过 `ref` 访问这些方法：

### scrollToIndex(index)
滚动到指定索引位置。

**参数**：
- `index: number` - 目标索引

```typescript
virtListRef.value?.scrollToIndex(100);
```

### scrollIntoView(index)
如果目标索引不在可视范围内，滚动到该位置。

**参数**：
- `index: number` - 目标索引

```typescript
virtListRef.value?.scrollIntoView(100);
```

### scrollToTop()
滚动到列表顶部。

```typescript
virtListRef.value?.scrollToTop();
```

### scrollToBottom()
滚动到列表底部。

```typescript
virtListRef.value?.scrollToBottom();
```

### scrollToOffset(px)
滚动到指定像素位置。

**参数**：
- `px: number` - 像素值

```typescript
virtListRef.value?.scrollToOffset(500);
```

### getOffset()
获取当前滚动高度。

**返回值**：`number` - 当前滚动距离（px）

```typescript
const offset = virtListRef.value?.getOffset();
```

### getItemSize(itemKey)
获取指定 item 的尺寸。

**参数**：
- `itemKey: string` - item 的 key

**返回值**：`number` - item 高度（px）

```typescript
const size = virtListRef.value?.getItemSize('item-1');
```

### getItemPosByIndex(index)
获取指定 index 的位置信息。

**参数**：
- `index: number` - 目标索引

**返回值**：
```typescript
{
  top: number;      // 顶部位置
  current: number;   // 当前位置
  bottom: number;    // 底部位置
}
```

```typescript
const pos = virtListRef.value?.getItemPosByIndex(100);
```

### reset()
重置列表状态。

```typescript
virtListRef.value?.reset();
```

### forceUpdate()
强制更新列表。在使用 `shallowRef` 时，列表长度变化后需要调用此方法。

```typescript
virtListRef.value?.forceUpdate();
```

### getReactiveData()
返回内部响应式数据。

**返回值**：`ShallowReactive<ReactiveData>`

```typescript
const reactiveData = virtListRef.value?.getReactiveData();
console.log(reactiveData.inViewBegin, reactiveData.inViewEnd);
```

### manualRender(begin, end)
手动控制渲染范围。

**参数**：
- `begin: number` - 起始索引
- `end: number` - 结束索引

```typescript
virtListRef.value?.manualRender(0, 100);
```

### deleteItemSize(itemKey)
删除指定 item 的尺寸缓存。

**参数**：
- `itemKey: string` - item 的 key

```typescript
virtListRef.value?.deleteItemSize('item-1');
```

### deletedList2Top(preList)
删除顶部 list（通常在分页模式下使用）。

**参数**：
- `preList: T[]` - 被删除的列表

```typescript
virtListRef.value?.deletedList2Top(removedList);
```

### addedList2Top(preList)
添加顶部 list（通常在分页模式下使用）。

**参数**：
- `preList: T[]` - 新添加的列表

```typescript
virtListRef.value?.addedList2Top(newList);
```

## 内部响应式数据

### reactiveData: ReactiveData

| 属性 | 类型 | 说明 |
|------|------|------|
| views | number | 可视区域渲染个数（不含 buffer） |
| offset | number | 滚动距离 |
| listTotalSize | number | 不包含插槽的高度 |
| virtualSize | number | 虚拟占位尺寸，是从 0 到 renderBegin 的尺寸 |
| inViewBegin | number | 可视区的起始下标 |
| inViewEnd | number | 可视区的结束下标 |
| renderBegin | number | 实际渲染的起始下标（含 buffer） |
| renderEnd | number | 实际渲染的结束下标（含 buffer） |
| bufferTop | number | 顶部 buffer 个数 |
| bufferBottom | number | 底部 buffer 个数 |

### slotSize: SlotSize

| 属性 | 类型 | 说明 |
|------|------|------|
| clientSize | number | 可视区容器高度 |
| headerSize | number | header 插槽高度 |
| footerSize | number | footer 插槽高度 |
| stickyHeaderSize | number | stickyHeader 插槽高度 |
| stickyFooterSize | number | stickyFooter 插槽高度 |

## TypeScript 类型定义

```typescript
export interface VirtListProps<T extends Record<string, string>> {
  list: T[];
  itemKey: string | number;
  minSize: number;
  itemGap?: number;
  fixed?: boolean;
  buffer?: number;
  bufferTop?: number;
  bufferBottom?: number;
  horizontal?: boolean;
  scrollDistance?: number;
  fixSelection?: boolean;
  start?: number;
  offset?: number;
  listStyle?: StyleType;
  listClass?: ClassType;
  itemStyle?: StyleType | ((item: T, index: number) => StyleType);
  itemClass?: ClassType | ((item: T, index: number) => ClassType);
  renderControl?: (
    begin: number,
    end: number,
  ) => { begin: number; end: number };
  headerClass?: ClassType;
  headerStyle?: StyleType;
  footerClass?: ClassType;
  footerStyle?: StyleType;
  stickyHeaderClass?: ClassType;
  stickyHeaderStyle?: StyleType;
  stickyFooterClass?: ClassType;
  stickyFooterStyle?: StyleType;
}

export interface EmitFunction<T> {
  scroll?: (e: Event) => void;
  toTop?: (item: T) => void;
  toBottom?: (item: T) => void;
  itemResize?: (id: string, newSize: number) => void;
  rangeUpdate?: (inViewBegin: number, inViewEnd: number) => void;
}
```
