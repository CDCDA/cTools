/*
 * @Description:字典数据
 */

import { defineStore } from 'pinia';

export const useDictStore = defineStore('dict', {
  state: () => ({
    dict: {} as any
  }),
  actions: {
    // 获取字典
    getDict(key: any) {
      return this.dict[key];
    },
    // 设置字典
    setDict(key: any, value: any) {
      if (key !== null && key !== '') {
        this.dict[key] = value;
      }
    },
    // 删除字典
    removeDict(key: any) {
      if (this.dict[key]) delete this.dict[key];
    },
    // 清空字典
    cleanDict() {
      this.dict = {};
    }
  }
});
