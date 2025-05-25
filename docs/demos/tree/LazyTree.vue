<script lang="ts" setup>
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';
import { ref, shallowRef } from 'vue-demi';
type Data = {
  id: string | number;
  title: string;
  children?: Data;
}[];

const customFieldNames = {
  key: 'id',
  children: 'children',
  title: 'name',
};

const treeData = shallowRef([
  {
    name: 'Lazy Parent',
    id: 'lazy-1',
    isLeaf: false,
  },
]);

const loadMore = async (node: any): Promise<any[]> => {
  // 模拟异步请求的 mock 数据
  // const mockChildren = [
  //   { id: `${node.key}-1`, name: `Child 1 of ${node.key}`, hasChildren: false },
  //   { id: `${node.key}-2`, name: `Child 2 of ${node.key}`, hasChildren: true },
  //   { id: `${node.key}-3`, name: `Child 3 of ${node.key}`, hasChildren: false },
  // ];

  const mockChildren: Data[] = [];

  const maxLength = 1_0000;
  for (let i = 0; i < maxLength; i++) {
    mockChildren.push({
      id: `${node.key}-${i}`,
      name: `Child ${i} of ${node.key}`,
      hasChildren: false,
    });
  }

  if (node.key === 'lazy-1') {
    // 模拟延迟加载效果
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve(mockChildren);
      }, 500); // 延迟500毫秒
    });
  }
  if (node.key === 'lazy-1-2') {
    const list = [
      {
        name: 'Lazy Child',
        id: 'lazy-1-2-1',
        isLeaf: true,
      },
    ];
    return list;
  }
  return [];
};

function handleClick(keys: string[], data: Data) {
  console.log(keys, data);
}

const virtTreeRef = ref();
const checkedKeys = ref([]);
function handleCheckedKeys() {
  console.log('checkedKeys', checkedKeys);
}
</script>

<template>
  <div class="demo-tree">
    <button @click="handleCheckedKeys">获取选中项</button>
    <div class="virt-tree-wrapper">
      <VirtTree
        ref="virtTreeRef"
        :list="treeData"
        :load-node="loadMore"
        selectable
        @select="handleClick"
        checkable
        @check="handleCheckedKeys"
        v-model:checkedKeys="checkedKeys"
        :defaultExpandAll="false"
        :fieldNames="customFieldNames"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
