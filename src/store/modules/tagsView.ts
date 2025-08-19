/*
 * @Description:后台管理顶部标签数据
 */

import { defineStore } from 'pinia';

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as any,
    cachedViews: [],
    currViews: null,
    editFavorites: false
  }),
  actions: {
    delView(view: any) {
      return new Promise(resolve => {
        this.visitedViews.forEach((v: any, i: any) => {
          if (v.path === view.path) {
            this.visitedViews.splice(i, 1);
          }
        });
        resolve({
          visitedViews: [...this.visitedViews]
        });
      });
    },
    delVisitedView() {
      return new Promise(resolve => {
        this.visitedViews.splice(1, this.visitedViews.length - 1);
        resolve({
          visitedViews: [...this.visitedViews]
        });
      });
    },
    delOthersViews(view: any) {
      return new Promise(resolve => {
        this.visitedViews = this.visitedViews.filter(
          (x: any) => x.path === view.path || x.meta.affix
        );
        resolve({
          visitedViews: [...this.visitedViews]
        });
      });
    },
    delRightViews(view: any) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex((x: any) => x.path === view.path);
        this.visitedViews.splice(index + 1, this.visitedViews.length - index - 1);
        resolve({
          visitedViews: [...this.visitedViews]
        });
      });
    },

    delLeftViews(view: any) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex((x: any) => x.path === view.path);
        this.visitedViews.splice(1, index - 1);
        resolve({
          visitedViews: [...this.visitedViews]
        });
      });
    }
  }
});
