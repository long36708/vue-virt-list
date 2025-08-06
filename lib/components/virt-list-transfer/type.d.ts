import type { StyleType, ClassType } from '../../utils';
export interface TransferItem {
    key: string;
    title: string;
    description?: string;
    disabled?: boolean;
    [key: string]: any;
}
export interface TransferProps {
    dataSource: TransferItem[];
    targetKeys: string[];
    selectedKeys: string[];
    titles: string[];
    operations: string[];
    showSearch?: boolean;
    showSelectAll?: boolean;
    filterOption?: (inputValue: string, item: TransferItem) => boolean;
    searchPlaceholder?: string;
    notFoundContent?: string;
    itemHeight?: number;
    itemGap?: number;
    buffer?: number;
    listStyle?: StyleType | (() => StyleType);
    listClass?: ClassType | (() => ClassType);
    itemStyle?: StyleType | ((item: TransferItem, index: number) => StyleType);
    itemClass?: ClassType | ((item: TransferItem, index: number) => ClassType);
    headerStyle?: StyleType | (() => StyleType);
    headerClass?: ClassType | (() => ClassType);
    footerStyle?: StyleType | (() => StyleType);
    footerClass?: ClassType | (() => ClassType);
    disabled?: boolean;
    oneWay?: boolean;
    pagination?: boolean | Record<string, any>;
    showSize?: boolean;
    size?: 'small' | 'default' | 'large';
}
export interface TransferEmit {
    change: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
    selectChange: (selectedKeys: string[], info: {
        sourceSelectedKeys: string[];
        targetSelectedKeys: string[];
    }) => void;
    search: (direction: 'left' | 'right', value: string) => void;
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
