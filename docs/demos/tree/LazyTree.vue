<script lang="ts" setup>
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';
import { shallowRef } from 'vue-demi';
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
  const mockChildren = [
    { id: `${node.key}-1`, name: `Child 1 of ${node.key}`, hasChildren: false },
    { id: `${node.key}-2`, name: `Child 2 of ${node.key}`, hasChildren: true },
    { id: `${node.key}-3`, name: `Child 3 of ${node.key}`, hasChildren: false },
  ];
  if (node.key === 'lazy-1') {
    // 模拟延迟加载效果
    return new Promise((resolve) => {
      setTimeout(() => {
        // const list = mockChildren.map((child) => ({
        //   title: child.name,
        //   key: child.id,
        //   isLeaf: !child.hasChildren,
        // }));

        // treeData.value.push(...list);
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
    // treeData.value.push(...list);
    return list;
  }
  return [];
};

function handleClick(keys: string[], data: Data) {
  console.log(keys, data);
}
</script>

<template>
  <div class="demo-tree">
    <div class="virt-tree-wrapper">
      <VirtTree
        :list="treeData"
        :load-node="loadMore"
        selectable
        @select="handleClick"
        checkable
        :defaultExpandAll="false"
        :fieldNames="customFieldNames"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
