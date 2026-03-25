<template>
  <div class="lazy-tree-container">
    <!-- 操作栏 -->
    <div class="actions-bar">
      <button @click="expandAll">Expand All</button>
      <button @click="collapseAll">Collapse All</button>
      <button @click="checkAll" v-if="checkable">Check All</button>
      <button @click="uncheckAll" v-if="checkable">Uncheck All</button>
      <button @click="getCheckedInfo" v-if="checkable">Get Checked</button>
      <button @click="scrollToFirst">Scroll to First</button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="searchKeyword"
        placeholder="Search tree nodes..."
        @input="handleSearch"
      />
      <span v-if="searchKeyword" class="search-count">
        Found: {{ filteredCount }}
      </span>
    </div>

    <!-- 选中信息 -->
    <div v-if="checkable" class="checked-info">
      <span>Checked: {{ checkedKeys.length }}</span>
      <span>Half Checked: {{ halfCheckedKeys.length }}</span>
    </div>

    <!-- VirtTree 组件 -->
    <div class="virt-tree-wrapper">
      <VirtTree
        ref="virtTreeRef"
        :list="treeData"
        itemKey="id"
        :expandable="expandable"
        :selectable="selectable"
        :selectMultiple="selectMultiple"
        :checkable="checkable"
        :checkStrictly="checkStrictly"
        :defaultExpandAll="defaultExpandAll"
        :defaultExpandedKeys="defaultExpandedKeys"
        :defaultCheckedKeys="defaultCheckedKeys"
        :load-node="loadNode"
        :showLine="showLine"
        v-model:checkedKeys="checkedKeys"
        v-model:expandedKeys="expandedKeys"
        v-model:selectedKeys="selectedKeys"
        @check="handleCheck"
        @expand="handleExpand"
        @select="handleSelect"
      >
        <!-- 自定义图标 -->
        <template #icon="{ node, expanded }">
          <span class="custom-icon">
            {{ expanded ? '📂' : '📁' }}
          </span>
        </template>

        <!-- 默认插槽 -->
        <template #default="{ node, index }">
          <div class="tree-node" :class="nodeClasses(node)">
            <span class="node-title">{{ node.title }}</span>
            <span v-if="node.isLoading" class="loading-indicator">
              Loading...
            </span>
            <span v-if="node.children?.length" class="node-count">
              ({{ node.children.length }})
            </span>
          </div>
        </template>

        <!-- Header 插槽 -->
        <template #header>
          <div class="tree-header">
            <h3>Lazy Loading Tree</h3>
            <p>Click on folders to load children</p>
          </div>
        </template>

        <!-- Footer 插槽 -->
        <template #footer>
          <div class="tree-footer">
            <p>Total nodes: {{ totalNodes }}</p>
          </div>
        </template>
      </VirtTree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue';
import type { Ref } from 'vue';
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';

// ============ 类型定义 ============
interface TreeNodeData {
  id: string | number;
  title: string;
  isLeaf?: boolean;
  children?: TreeNodeData[];
  [key: string]: any;
}

// ============ Props ============
interface Props {
  expandable?: boolean;
  selectable?: boolean;
  selectMultiple?: boolean;
  checkable?: boolean;
  checkStrictly?: boolean;
  defaultExpandAll?: boolean;
  showLine?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  expandable: true,
  selectable: false,
  selectMultiple: false,
  checkable: false,
  checkStrictly: false,
  defaultExpandAll: false,
  showLine: false,
});

// ============ 响应式数据 ============
const treeData: Ref<TreeNodeData[]> = shallowRef([]);
const checkedKeys = ref<(string | number)[]>([]);
const expandedKeys = ref<(string | number)[]>([]);
const selectedKeys = ref<(string | number)[]>([]);
const halfCheckedKeys = ref<(string | number)[]>([]);
const searchKeyword = ref('');

const virtTreeRef = ref<InstanceType<typeof VirtTree>>();

// ============ 计算属性 ============
const defaultExpandedKeys = computed(() => {
  // 可以根据需要返回默认展开的节点
  return [];
});

const defaultCheckedKeys = computed(() => {
  return [];
});

const filteredCount = ref(0);

const totalNodes = computed(() => {
  let count = 0;
  const countNodes = (nodes: TreeNodeData[]) => {
    nodes.forEach((node) => {
      count++;
      if (node.children) {
        countNodes(node.children);
      }
    });
  };
  countNodes(treeData.value);
  return count;
});

// ============ 初始化数据 ============
const generateInitialData = (): TreeNodeData[] => {
  return [
    {
      id: 'root-1',
      title: 'Root Node 1',
      isLeaf: false,
    },
    {
      id: 'root-2',
      title: 'Root Node 2',
      isLeaf: false,
    },
    {
      id: 'root-3',
      title: 'Root Node 3',
      isLeaf: false,
    },
  ];
};

const initData = () => {
  treeData.value = generateInitialData();
};

// ============ 懒加载实现 ============
const loadNode = async (node: any): Promise<TreeNodeData[]> => {
  console.log('Loading node:', node.key);

  // 模拟异步加载
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟一些节点没有子节点的情况
      if (node.key === 'root-1-0') {
        resolve([]);
        return;
      }

      // 模拟加载失败的情况
      if (node.key === 'root-2-1') {
        reject(new Error('Failed to load children'));
        return;
      }

      // 生成子节点
      const childCount = Math.floor(Math.random() * 5) + 1;
      const children: TreeNodeData[] = Array.from(
        { length: childCount },
        (_, i) => ({
          id: `${node.key}-${i}`,
          title: `${node.title} - Child ${i + 1}`,
          isLeaf: Math.random() > 0.7, // 30% 概率是叶子节点
        })
      );

      resolve(children);
    }, 500);
  });
};

// ============ 树操作方法 ============
const expandAll = () => {
  virtTreeRef.value?.expandAll();
};

const collapseAll = () => {
  virtTreeRef.value?.collapseAll();
};

const checkAll = () => {
  virtTreeRef.value?.checkAll();
};

const uncheckAll = () => {
  // 通过设置为空数组取消所有勾选
  checkedKeys.value = [];
};

const getCheckedInfo = () => {
  const info = virtTreeRef.value?.getCheckedInfo();
  if (info) {
    console.log('Checked keys:', info.checkedKeys);
    console.log('Checked nodes:', info.checkedNodes);
    console.log('Half checked keys:', info.halfCheckedKeys);
    console.log('Half checked nodes:', info.halfCheckedNodes);
    alert(`Checked: ${info.checkedKeys.length}\nHalf Checked: ${info.halfCheckedKeys.length}`);
  }
};

const scrollToFirst = () => {
  virtTreeRef.value?.scroll({ key: 'root-1', align: 'top' });
};

// ============ 搜索功能 ============
const handleSearch = () => {
  if (!searchKeyword.value) {
    filteredCount.value = 0;
    virtTreeRef.value?.clearFilter();
    return;
  }

  filteredCount.value = 0;
  virtTreeRef.value?.filter(searchKeyword.value);
};

// ============ 事件处理 ============
const handleCheck = (
  keys: (string | number)[],
  info: {
    checked: boolean;
    node: any;
    checkedNodes: any[];
    halfCheckedKeys: (string | number)[];
    halfCheckedNodes: any[];
  }
) => {
  console.log('Checked:', keys);
  halfCheckedKeys.value = info.halfCheckedKeys;
};

const handleExpand = (
  keys: (string | number)[],
  info: { expanded: boolean; node: any }
) => {
  console.log('Expanded:', keys, info);
};

const handleSelect = (
  keys: (string | number)[],
  info: { selected: boolean; node: any }
) => {
  console.log('Selected:', keys, info);
};

// ============ 工具方法 ============
const nodeClasses = (node: any) => {
  return {
    'node-leaf': node.isLeaf,
    'node-loading': node.isLoading,
    'node-selected': selectedKeys.value.includes(node.key),
    'node-checked': checkedKeys.value.includes(node.key),
  };
};

// ============ 生命周期 ============
onMounted(() => {
  initData();
  console.log('VirtTree mounted');
});

// ============ 暴露给父组件 ============
defineExpose({
  expandAll,
  collapseAll,
  checkAll,
  uncheckAll,
  getCheckedInfo,
  loadNode,
});
</script>

<style scoped>
.lazy-tree-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 操作栏 */
.actions-bar {
  padding: 10px;
  background: #f0f0f0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions-bar button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.actions-bar button:hover {
  background: #40a9ff;
}

/* 搜索栏 */
.search-bar {
  padding: 10px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-bar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.search-bar input:focus {
  border-color: #1890ff;
}

.search-count {
  color: #666;
  font-size: 12px;
}

/* 选中信息 */
.checked-info {
  padding: 8px 10px;
  background: #fff7e6;
  border-bottom: 1px solid #ffd591;
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #fa8c16;
}

/* VirtTree 容器 */
.virt-tree-wrapper {
  flex: 1;
  overflow: hidden;
}

/* Tree Header */
.tree-header {
  padding: 15px;
  background: #f0f0f0;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.tree-header h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.tree-header p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

/* Tree Node */
.tree-node {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.tree-node:hover {
  background: #f5f5f5;
}

.tree-node.node-selected {
  background: #e6f7ff;
}

.custom-icon {
  font-size: 14px;
}

.node-title {
  flex: 1;
  font-size: 13px;
}

.loading-indicator {
  color: #1890ff;
  font-size: 12px;
  font-style: italic;
}

.node-count {
  color: #999;
  font-size: 11px;
}

/* Tree Footer */
.tree-footer {
  padding: 15px;
  background: #f0f0f0;
  text-align: center;
  color: #666;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 768px) {
  .actions-bar {
    justify-content: center;
  }
}
</style>
