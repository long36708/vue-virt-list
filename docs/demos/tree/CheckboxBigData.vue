<script lang="ts" setup>
import { onMounted, ref, shallowRef } from 'vue';
import { VirtTree } from 'vue-virt-list';
import 'vue-virt-list/lib/assets/tree.css';
import { mockTreeData } from './mockTreeData.js';

type Data = {
  id: string | number;
  title: string;
  children?: Data;
}[];

const customFieldNames = {
  key: 'id',
  title: 'name',
};

const list = shallowRef<Data>([]);
onMounted(() => {
  list.value = mockTreeData();
});

const virtTreeRef = ref<typeof VirtTree>();
const key = ref<string>('0');

const onExpandAll = () => {
  virtTreeRef.value?.expandAll(true);
};
const onCollapseAll = () => {
  virtTreeRef.value?.expandAll(false);
};

const expandNode = () => {
  virtTreeRef.value?.expandNode(key.value, true);
};
const collapseNode = () => {
  virtTreeRef.value?.expandNode(key.value, false);
};
// 用于保存所有 timeoutId 的数组（附加在函数属性上）
expandNodeKeys.timeouts = [];

function expandNodeKeys() {
  // virtTreeRef.value?.expandNode(['0-0', '0-1', '0-2'], true);
  const keys = [];
  for (let i = 0; i < 10; i++) {
    // keys.push('' + i);
    for (let j = 0; j < 10000; j++) {
      keys.push('' + i + '-' + j);
    }
  }
  const delayInterval = 10; // 提取延迟间隔为常量，便于维护
  // 清理之前的定时器（如果有）
  if (expandNodeKeys.timeouts) {
    expandNodeKeys.timeouts.forEach(clearTimeout);
    expandNodeKeys.timeouts = [];
  }
  // 批量控制展开频率，避免过多定时器
  const batchSize = 100; // 每批展开的节点数
  let index = 0;

  const processNextBatch = () => {
    const end = Math.min(index + batchSize, keys.length);
    for (let i = index; i < end; i++) {
      const key = keys[i];
      virtTreeRef.value?.expandNode(key, true);
    }
    index = end;

    if (index < keys.length) {
      setTimeout(processNextBatch, delayInterval);
    }
  };
  // 首次启动
  setTimeout(processNextBatch, delayInterval);
}

function expandNodeKeysBatch() {
  // virtTreeRef.value?.expandNode(['0-0', '0-1', '0-2'], true);
  const keys = [];
  for (let i = 0; i < 10; i++) {
    // keys.push('' + i);
    for (let j = 0; j < 10000; j++) {
      keys.push('' + i + '-' + j);
    }
  }
  // virtTreeRef.value?.expandNode(keys, true);
  // virtTreeRef.value?.setExpandedKeysMod(keys);
  virtTreeRef.value?.setExpandedKeys(keys);
}
const checkedKeys = ref<(number | string)[]>(['0']);

const onCheck = (data: Data, checkedInfo: any) => {
  console.warn('data', data, checkedInfo);
};

const clearCheck = (check: boolean) => {
  virtTreeRef.value?.checkAll(check);
};

function onClick(data: Data) {
  console.log('click', data);
}
</script>

<template>
  <div class="demo-tree">
    <div class="tree-btn-container">
      <div style="display: flex; gap: 8px">
        <div class="btn-item" @click="onCollapseAll">折叠所有</div>
        <div class="btn-item" @click="onExpandAll">展开所有</div>
        <div class="btn-item" @click="clearCheck(false)">清空 check</div>
        <div class="btn-item" @click="clearCheck(true)">check所有</div>
      </div>
      <div class="input-container">
        <div class="input-label">操作指定节点：</div>
        <input v-model="key" />
        <div class="btn-item" @click="expandNode">展开</div>
        <div class="btn-item" @click="collapseNode">折叠</div>
      </div>

      <div>
        <div class="btn-item" @click="expandNodeKeys">展开多个节点</div>
        <div class="btn-item" @click="expandNodeKeysBatch">
          批量展开多个节点
        </div>
      </div>
    </div>

    <div class="virt-tree-wrapper">
      <VirtTree
        ref="virtTreeRef"
        :list="list"
        :fieldNames="customFieldNames"
        :indent="20"
        checkable
        checkOnClickNode
        v-model:checkedKeys="checkedKeys"
        @check="onCheck"
        selectable
        @select="onClick"
        :defaultExpandAll="false"
      >
        <template #empty>
          <div style="padding: 16px">暂无数据</div>
        </template>
      </VirtTree>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo-tree {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .tree-btn-container {
    display: flex;
    flex: 1;
    flex-direction: row-reverse;
    justify-content: space-between;
    padding: 12px 8px;
    gap: 8px;
    .input-label {
      font-size: 14px;
    }
    .btn-item {
      padding: 4px 12px;
      cursor: pointer;
      border: 1px solid #ececec;
      border-radius: 4px;
      font-size: 14px;
    }
    .input-container {
      display: flex;
      gap: 8px;
      align-items: center;
      input {
        height: 100%;
        border: 1px solid #ececec;
        border-radius: 4px;
        padding: 0 8px;
      }
    }
  }
}
</style>
