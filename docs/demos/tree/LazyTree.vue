<script lang="ts" setup>
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';
import { shallowRef } from 'vue-demi';

const treeData = shallowRef([
  {
    title: 'Lazy Parent',
    key: 'lazy-1',
    isLeaf: false,
  },
]);

const loadMore = async (node) => {
  debugger;
  // 模拟异步请求的 mock 数据
  const mockChildren = [
    { id: `${node.key}-1`, name: `Child 1 of ${node.key}`, hasChildren: false },
    { id: `${node.key}-2`, name: `Child 2 of ${node.key}`, hasChildren: true },
    { id: `${node.key}-3`, name: `Child 3 of ${node.key}`, hasChildren: false },
  ];

  // 模拟延迟加载效果
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockChildren.map((child) => ({
          title: child.name,
          key: child.id,
          isLeaf: !child.hasChildren,
        })),
      );
    }, 500); // 延迟500毫秒
  });
};

function handleClick(node) {
  console.log(node);
}
</script>

<template>
  <div class="demo-tree">
    <div class="virt-tree-wrapper">
      <VirtTree
        :list="treeData"
        :load-more="loadMore"
        selectable
        @select="handleClick"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
