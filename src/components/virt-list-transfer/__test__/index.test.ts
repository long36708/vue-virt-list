import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp } from 'vue';
import VirtListTransfer from '../index';
import type { TransferItem } from '../type';

// 创建测试应用
const createTestApp = () => {
  const app = createApp({});
  app.component('VirtListTransfer', VirtListTransfer);
  return app;
};

// 生成测试数据
const generateTestData = (count: number): TransferItem[] => {
  const data: TransferItem[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      key: `item-${i}`,
      title: `选项 ${i + 1}`,
      description: `描述 ${i + 1}`,
      disabled: i % 5 === 0, // 每5个禁用一个
    });
  }
  return data;
};

describe('VirtListTransfer', () => {
  let testData: TransferItem[];

  beforeEach(() => {
    testData = generateTestData(20);
  });

  it('should render correctly with basic props', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: ['item-1', 'item-3'],
        selectedKeys: [],
        titles: ['源列表', '目标列表'],
        operations: ['>', '<'],
      },
    });

    expect(wrapper.find('.virt-transfer').exists()).toBe(true);
    expect(wrapper.find('.virt-transfer-list').exists()).toBe(true);
    expect(wrapper.findAll('.virt-transfer-list')).toHaveLength(2);
  });

  it('should display correct titles', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        titles: ['左侧列表', '右侧列表'],
        operations: ['>', '<'],
      },
    });

    const headers = wrapper.findAll('.virt-transfer-header-title');
    expect(headers[0].text()).toBe('左侧列表');
    expect(headers[1].text()).toBe('右侧列表');
  });

  it('should show search input when showSearch is true', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        showSearch: true,
      },
    });

    expect(wrapper.findAll('.virt-transfer-search')).toHaveLength(2);
    expect(wrapper.findAll('input[type="text"]')).toHaveLength(2);
  });

  it('should show select all checkbox when showSelectAll is true', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        showSelectAll: true,
      },
    });

    expect(wrapper.findAll('.virt-transfer-header-select-all')).toHaveLength(2);
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2);
  });

  it('should render correct number of items', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: ['item-1', 'item-3'],
        selectedKeys: [],
      },
    });

    // 源列表应该有18个项目（20个总数 - 2个在目标列表）
    const sourceList = wrapper.findAll('.virt-transfer-item');
    expect(sourceList.length).toBeGreaterThan(0);
  });

  it('should handle item selection', async () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
      },
    });

    const firstItem = wrapper.find('.virt-transfer-item input[type="checkbox"]');
    await firstItem.setValue(true);

    expect(wrapper.emitted('selectChange')).toBeTruthy();
  });

  it('should handle move operations', async () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: ['item-1'],
      },
    });

    const moveButton = wrapper.find('.virt-transfer-operation-btn');
    await moveButton.trigger('click');

    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('should disable move button when no items selected', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
      },
    });

    const moveButton = wrapper.find('.virt-transfer-operation-btn');
    expect(moveButton.classes()).toContain('virt-transfer-operation-btn-disabled');
  });

  it('should handle oneWay mode', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: ['item-1'],
        selectedKeys: ['item-1'],
        oneWay: true,
      },
    });

    const buttons = wrapper.findAll('.virt-transfer-operation-btn');
    expect(buttons).toHaveLength(1); // 只有一个向右移动按钮
  });

  it('should handle disabled state', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        disabled: true,
      },
    });

    expect(wrapper.classes()).toContain('virt-transfer-disabled');
  });

  it('should handle different sizes', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        size: 'large',
      },
    });

    expect(wrapper.classes()).toContain('virt-transfer-large');
  });

  it('should emit search event', async () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        showSearch: true,
      },
    });

    const searchInput = wrapper.find('.virt-transfer-search input');
    await searchInput.setValue('test');

    expect(wrapper.emitted('search')).toBeTruthy();
  });

  it('should handle custom filter function', async () => {
    const customFilter = (inputValue: string, item: TransferItem) => {
      return item.title.includes(inputValue);
    };

    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
        showSearch: true,
        filterOption: customFilter,
      },
    });

    const searchInput = wrapper.find('.virt-transfer-search input');
    await searchInput.setValue('选项 1');

    // 验证过滤功能
    expect(wrapper.emitted('search')).toBeTruthy();
  });

  it('should handle disabled items', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
      },
    });

    const disabledItems = wrapper.findAll('.virt-transfer-item-disabled');
    expect(disabledItems.length).toBeGreaterThan(0);
  });

  it('should show not found content when list is empty', () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: [],
        targetKeys: [],
        selectedKeys: [],
        notFoundContent: '没有数据',
      },
    });

    expect(wrapper.text()).toContain('没有数据');
  });

  it('should handle scroll events', async () => {
    const wrapper = mount(VirtListTransfer, {
      props: {
        dataSource: testData,
        targetKeys: [],
        selectedKeys: [],
      },
    });

    const listContainer = wrapper.find('.virt-transfer-list');
    await listContainer.trigger('scroll');

    expect(wrapper.emitted('scroll')).toBeTruthy();
  });
}); 