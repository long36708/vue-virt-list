<template>
  <div class="transfer-example">
    <h2>VirtListTransfer 穿梭框组件示例</h2>
    
    <div class="example-section">
      <h3>基础用法</h3>
      <VirtListTransfer
        v-model:targetKeys="targetKeys"
        v-model:selectedKeys="selectedKeys"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '<']"
        @change="handleChange"
        @selectChange="handleSelectChange"
      />
    </div>

    <div class="example-section">
      <h3>带搜索功能</h3>
      <VirtListTransfer
        v-model:targetKeys="targetKeys2"
        v-model:selectedKeys="selectedKeys2"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '<']"
        :showSearch="true"
        searchPlaceholder="请输入搜索关键词"
        @change="handleChange"
        @selectChange="handleSelectChange"
        @search="handleSearch"
      />
    </div>

    <div class="example-section">
      <h3>自定义过滤</h3>
      <VirtListTransfer
        v-model:targetKeys="targetKeys3"
        v-model:selectedKeys="selectedKeys3"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '<']"
        :showSearch="true"
        :filterOption="customFilter"
        searchPlaceholder="自定义过滤搜索"
        @change="handleChange"
        @selectChange="handleSelectChange"
      />
    </div>

    <div class="example-section">
      <h3>单向移动</h3>
      <VirtListTransfer
        v-model:targetKeys="targetKeys4"
        v-model:selectedKeys="selectedKeys4"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '']"
        :oneWay="true"
        @change="handleChange"
        @selectChange="handleSelectChange"
      />
    </div>

    <div class="example-section">
      <h3>禁用状态</h3>
      <VirtListTransfer
        v-model:targetKeys="targetKeys5"
        v-model:selectedKeys="selectedKeys5"
        :dataSource="dataSource"
        :titles="['源列表', '目标列表']"
        :operations="['>', '<']"
        :disabled="true"
        @change="handleChange"
        @selectChange="handleSelectChange"
      />
    </div>

    <div class="example-section">
      <h3>不同尺寸</h3>
      <div class="size-examples">
        <div>
          <h4>Small</h4>
          <VirtListTransfer
            v-model:targetKeys="targetKeys6"
            v-model:selectedKeys="selectedKeys6"
            :dataSource="dataSource.slice(0, 10)"
            :titles="['源列表', '目标列表']"
            :operations="['>', '<']"
            size="small"
            @change="handleChange"
            @selectChange="handleSelectChange"
          />
        </div>
        <div>
          <h4>Large</h4>
          <VirtListTransfer
            v-model:targetKeys="targetKeys7"
            v-model:selectedKeys="selectedKeys7"
            :dataSource="dataSource.slice(0, 10)"
            :titles="['源列表', '目标列表']"
            :operations="['>', '<']"
            size="large"
            @change="handleChange"
            @selectChange="handleSelectChange"
          />
        </div>
      </div>
    </div>

    <div class="example-section">
      <h3>当前状态</h3>
      <div class="status-info">
        <p><strong>目标列表 Keys:</strong> {{ targetKeys.join(', ') || '无' }}</p>
        <p><strong>选中 Keys:</strong> {{ selectedKeys.join(', ') || '无' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import VirtListTransfer from './index';
import type { TransferItem } from './type';

// 生成测试数据
const generateData = (count: number): TransferItem[] => {
  const data: TransferItem[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      key: `item-${i}`,
      title: `选项 ${i + 1}`,
      description: `这是选项 ${i + 1} 的描述信息`,
      disabled: i % 10 === 0, // 每10个禁用一个
    });
  }
  return data;
};

const dataSource = generateData(100);

// 状态管理
const targetKeys = ref<string[]>(['item-1', 'item-3', 'item-5']);
const selectedKeys = ref<string[]>([]);

const targetKeys2 = ref<string[]>(['item-2', 'item-4']);
const selectedKeys2 = ref<string[]>([]);

const targetKeys3 = ref<string[]>(['item-6', 'item-8']);
const selectedKeys3 = ref<string[]>([]);

const targetKeys4 = ref<string[]>(['item-10', 'item-12']);
const selectedKeys4 = ref<string[]>([]);

const targetKeys5 = ref<string[]>(['item-14', 'item-16']);
const selectedKeys5 = ref<string[]>([]);

const targetKeys6 = ref<string[]>(['item-18']);
const selectedKeys6 = ref<string[]>([]);

const targetKeys7 = ref<string[]>(['item-20']);
const selectedKeys7 = ref<string[]>([]);

// 事件处理
const handleChange = (newTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => {
  console.log('数据移动:', {
    newTargetKeys,
    direction,
    moveKeys,
  });
};

const handleSelectChange = (selectedKeys: string[], info: {
  sourceSelectedKeys: string[];
  targetSelectedKeys: string[];
}) => {
  console.log('选择变化:', {
    selectedKeys,
    info,
  });
};

const handleSearch = (direction: 'left' | 'right', value: string) => {
  console.log('搜索:', {
    direction,
    value,
  });
};

// 自定义过滤函数
const customFilter = (inputValue: string, item: TransferItem): boolean => {
  return item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
         item.description?.toLowerCase().includes(inputValue.toLowerCase()) ||
         item.key.toLowerCase().includes(inputValue.toLowerCase());
};
</script>

<style scoped>
.transfer-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fafafa;
}

.example-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #262626;
  font-size: 18px;
}

.example-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #595959;
  font-size: 14px;
}

.size-examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.status-info {
  background-color: #fff;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.status-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #595959;
}

.status-info strong {
  color: #262626;
}

/* 引入组件样式 */
@import './transfer.css';
</style> 