import type { StyleType, ClassType } from '../../utils';

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}

export interface TransferProps {
  // 数据源
  dataSource: TransferItem[];
  
  // 目标列表的 key 数组
  targetKeys: string[];
  
  // 选中的 key 数组
  selectedKeys: string[];
  
  // 标题数组，[源列表标题, 目标列表标题]
  titles: string[];
  
  // 操作按钮文本数组，[向右移动按钮文本, 向左移动按钮文本]
  operations: string[];
  
  // 是否显示搜索框
  showSearch?: boolean;
  
  // 是否显示全选功能
  showSelectAll?: boolean;
  
  // 自定义过滤函数
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  
  // 搜索框占位符
  searchPlaceholder?: string;
  
  // 无数据时显示的内容
  notFoundContent?: string;
  
  // 列表项高度
  itemHeight?: number;
  
  // 列表项间距
  itemGap?: number;
  
  // 缓冲区大小
  buffer?: number;
  
  // 列表样式
  listStyle?: StyleType | (() => StyleType);
  
  // 列表类名
  listClass?: ClassType | (() => ClassType);
  
  // 列表项样式
  itemStyle?: StyleType | ((item: TransferItem, index: number) => StyleType);
  
  // 列表项类名
  itemClass?: ClassType | ((item: TransferItem, index: number) => ClassType);
  
  // 头部样式
  headerStyle?: StyleType | (() => StyleType);
  
  // 头部类名
  headerClass?: ClassType | (() => ClassType);
  
  // 底部样式
  footerStyle?: StyleType | (() => StyleType);
  
  // 底部类名
  footerClass?: ClassType | (() => ClassType);
  
  // 是否禁用
  disabled?: boolean;
  
  // 是否单向移动（只能向右移动）
  oneWay?: boolean;
  
  // 分页配置
  pagination?: boolean | Record<string, any>;
  
  // 是否显示尺寸信息
  showSize?: boolean;
  
  // 组件尺寸
  size?: 'small' | 'default' | 'large';
}

export interface TransferEmit {
  // 数据移动事件
  change: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  
  // 选择变化事件
  selectChange: (selectedKeys: string[], info: {
    sourceSelectedKeys: string[];
    targetSelectedKeys: string[];
  }) => void;
  
  // 搜索事件
  search: (direction: 'left' | 'right', value: string) => void;
  
  // 滚动事件
  scroll: (direction: 'left' | 'right', event: Event) => void;
}

export interface TransferState {
  sourceSelectedKeys: string[];
  targetSelectedKeys: string[];
  sourceSearchValue: string;
  targetSearchValue: string;
}

export interface TransferListProps {
  direction: 'left' | 'right';
  list: TransferItem[];
  selectedKeys: string[];
  searchValue: string;
  title: string;
  showSearch: boolean;
  showSelectAll: boolean;
  searchPlaceholder: string;
  notFoundContent: string;
  itemHeight: number;
  itemGap: number;
  buffer: number;
  disabled: boolean;
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  onSelectChange: (selectedKeys: string[]) => void;
  onSelectAll: (selected: boolean) => void;
  onSearch: (value: string) => void;
  onScroll: (event: Event) => void;
} 