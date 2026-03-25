# Vue Virt List - Component Library Skill

这是一个为 vue-virt-list 虚拟列表组件库创建的完整使用指南 skill。

## 📦 包含内容

### 📖 完整文档（references/）

1. **virt-list-api.md** - VirtList 完整 API 文档
   - 所有属性（Props）
   - 所有方法（Exposed Methods）
   - 所有事件（Events）
   - 所有插槽（Slots）
   - 内部响应式数据说明
   - TypeScript 类型定义

2. **virt-tree-api.md** - VirtTree 完整 API 文档
   - 核心属性配置
   - 字段映射（fieldNames）
   - 数据结构定义
   - 插槽说明
   - 事件处理
   - 暴露方法
   - 懒加载实现
   - Vue 2/3 差异
   - CSS 变量自定义

3. **virt-grid-api.md** - VirtGrid 完整 API 文档
   - 核心属性
   - 继承的 VirtList 属性
   - 插槽和事件
   - 暴露方法
   - 工作原理
   - 使用示例
   - 性能优化建议
   - 注意事项

4. **best-practices.md** - 性能优化和最佳实践
   - 核心原则（shallowRef、forceUpdate、DOM 分离）
   - VirtList 性能优化
   - VirtTree 性能优化
   - VirtGrid 性能优化
   - 内存管理
   - 渲染优化
   - 滚动性能优化
   - Vue 2 vs Vue 3 最佳实践
   - 调试和性能监控

5. **common-pitfalls.md** - 常见问题和解决方案
   - 滚动行为异常（itemKey 不唯一）
   - 快速滚动白屏（buffer 设置）
   - 列表更新不显示（forceUpdate）
   - Vue 2/3 响应式差异
   - 大数据量性能问题
   - VirtTree 展开卡顿
   - VirtGrid 布局错乱
   - 样式不生效
   - 横向滚动问题
   - 内存泄漏
   - VirtTree 懒加载失效
   - 滚动位置丢失
   - 类型错误
   - 浏览器高度限制
   - 调试技巧

6. **examples.md** - 实用代码示例
   - **VirtList 示例**（10+）
     - 最简用法
     - 大数据量列表
     - 固定高度列表
     - 带插槽的列表
     - 无限滚动
     - 双向无限滚动
     - 可编辑列表
     - 搜索过滤列表
     - 拖拽排序列表
     - 虚拟滚动表格
   - **VirtTree 示例**（4+）
     - 基础树
     - 可选树
     - 带复选框的树
     - 懒加载树
   - **VirtGrid 示例**（2+）
     - 基础网格
     - 响应式网格
   - **高级示例**（1+）
     - 完整聊天列表组件

### 🎨 可用模板（assets/templates/）

1. **basic-virt-list.vue** - 基础虚拟列表完整实现
   - 完整的组件结构
   - 操作栏（滚动控制、刷新）
   - 统计信息显示
   - 所有插槽使用示例
   - 数据操作方法
   - 事件处理
   - 完整的样式
   - 响应式设计

2. **lazy-tree.vue** - 懒加载树完整实现
   - 完整的树形结构
   - 操作栏（展开/折叠/选择）
   - 搜索功能
   - 选中信息显示
   - 懒加载实现
   - 事件处理
   - 自定义图标和节点样式
   - 完整的样式

3. **grid-layout.vue** - 网格布局完整实现
   - 响应式列数控制
   - 操作栏和统计信息
   - 卡片式网格项
   - 所有插槽使用示例
   - 数据操作方法
   - 滚动控制
   - 完整的样式
   - 暗色主题支持

## 🚀 快速开始

### 1. 使用完整模板

直接复制 `assets/templates/` 下的模板文件到你的项目中：

```bash
# 复制基础列表模板
cp assets/templates/basic-virt-list.vue src/components/MyList.vue

# 复制懒加载树模板
cp assets/templates/lazy-tree.vue src/components/MyTree.vue

# 复制网格布局模板
cp assets/templates/grid-layout.vue src/components/MyGrid.vue
```

### 2. 查看文档

根据需要查看对应的文档：

- 需要了解 API → 查看 `references/virt-list-api.md`
- 需要优化性能 → 查看 `references/best-practices.md`
- 遇到问题 → 查看 `references/common-pitfalls.md`
- 需要示例 → 查看 `references/examples.md`

## 📚 文档使用指南

### 查找 API 信息

1. **VirtList** → `references/virt-list-api.md`
2. **VirtTree** → `references/virt-tree-api.md`
3. **VirtGrid** → `references/virt-grid-api.md`

### 解决性能问题

1. 查看 `references/best-practices.md` 了解优化策略
2. 查看 `references/common-pitfalls.md` 解决常见问题

### 查找代码示例

1. 查看 `references/examples.md` 获取完整示例
2. 复制 `assets/templates/` 下的模板文件直接使用

## 🎯 适用场景

### 适合使用 VirtList 的场景
- ✅ 大数据量列表（> 1000 条）
- ✅ 无限滚动列表
- ✅ 聊天记录
- ✅ 日志列表
- ✅ 数据表格

### 适合使用 VirtTree 的场景
- ✅ 文件树
- ✅ 组织架构
- ✅ 分类导航
- ✅ 权限管理树
- ✅ 大数据量树形结构

### 适合使用 VirtGrid 的场景
- ✅ 图片库
- ✅ 商品展示
- ✅ 卡片布局
- ✅ 仪表盘
- ✅ 数据可视化

## 💡 最佳实践建议

### 性能优化

1. **始终使用 shallowRef**（大数据集）
   ```typescript
   import { shallowRef } from 'vue';
   const list = shallowRef(generateLargeData(100000));
   ```

2. **调用 forceUpdate()**（列表长度变化后）
   ```typescript
   list.value = [...list.value, ...newData];
   virtListRef.value?.forceUpdate();
   ```

3. **使用固定高度**（如果可能）
   ```vue
   <VirtList :list="list" :fixed="true">
   ```

4. **简化 DOM 结构**
   - 避免深层嵌套
   - 使用轻量级组件
   - 分离渲染层和交互层

### 避免常见问题

1. **itemKey 必须唯一**
   ```typescript
   // ✅ 正确
   const list = data.map((item, index) => ({
     ...item,
     _id: `${item.type}-${index}`,
   }));
   ```

2. **调整 buffer 设置**
   ```vue
   <!-- 正常滚动 -->
   <VirtList :buffer="0" />
   
   <!-- 快速滚动 -->
   <VirtList :buffer="10" />
   ```

3. **Vue 2 vs Vue 3 响应式**
   ```typescript
   // Vue 2 - 使用数组方法
   this.list.push(...newData);
   this.list.splice(0, 1);
   
   // Vue 3 - 创建新数组
   list.value = [...list.value, ...newData];
   ```

## 📊 性能参考

| 场景 | 推荐配置 |
|------|---------|
| 小数据 (< 1000) | `ref`, `fixed: false`, 默认 buffer |
| 中等数据 (1000-10000) | `shallowRef`, `fixed: false`, `buffer: 5` |
| 大数据 (10000-100000) | `shallowRef`, `fixed: true`, `buffer: 10` |
| 超大数据 (> 100000) | `shallowRef`, `fixed: true`, 分页加载 |

## 🔍 调试技巧

### 监控渲染状态

```typescript
const reactiveData = computed(() => {
  return virtListRef.value?.getReactiveData();
});

watch(reactiveData, (data) => {
  console.log('Render Range:', data?.renderBegin, data?.renderEnd);
});
```

### 监控滚动位置

```typescript
const handleScroll = (e: Event) => {
  const offset = virtListRef.value?.getOffset();
  console.log('Scroll Offset:', offset);
};
```

### 性能监控

```typescript
import { performance } from 'perf_hooks';

const start = performance.now();
// 执行操作
const end = performance.now();
console.log(`Execution time: ${end - start}ms`);
```

## 🐛 问题排查流程

### 1. 滚动问题
- 检查 `itemKey` 是否唯一
- 检查 `minSize` 是否合理
- 检查是否有样式冲突

### 2. 性能问题
- 检查是否使用 `shallowRef`
- 检查 DOM 结构是否复杂
- 检查是否使用固定高度
- 检查 buffer 设置

### 3. 更新问题
- 检查是否调用 `forceUpdate()`
- 检查 Vue 版本的响应式差异
- 检查数据引用是否正确

### 4. 样式问题
- 检查 CSS 优先级
- 检查作用域样式
- 检查全局样式覆盖

## 🌐 官方资源

- **在线文档**：https://kolarorz.github.io/vue-virt-list/
- **GitHub**：https://github.com/kolarorz/vue-virt-list
- **NPM**：https://www.npmjs.com/package/vue-virt-list

## 📝 更新日志

### v1.0.0 (2026-03-26)
- ✅ 创建完整的 VirtList API 文档
- ✅ 创建完整的 VirtTree API 文档
- ✅ 创建完整的 VirtGrid API 文档
- ✅ 创建性能优化和最佳实践文档
- ✅ 创建常见问题和解决方案文档
- ✅ 创建 20+ 实用代码示例
- ✅ 创建 3 个完整的可用模板
- ✅ 支持无源码快速上手

## 📄 许可证

本 skill 基于原始 vue-virt-list 组件库的 MIT 许可证。

## 🤝 贡献

如果发现问题或有改进建议，欢迎：
1. 查看官方文档和 GitHub Issues
2. 报告 bug 或提出功能请求
3. 贡献代码示例和文档改进

## 📞 支持

如果遇到问题：
1. 首先查看 `references/common-pitfalls.md`
2. 查看 `references/examples.md` 找到类似实现
3. 查看官方文档
4. 在 GitHub 上提 issue

---

**提示**：本 skill 包含了无需源码即可使用 vue-virt-list 的所有必要信息。所有文档、示例和模板都可以直接使用，按需修改即可集成到项目中。
