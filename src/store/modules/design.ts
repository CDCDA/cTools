import { defineStore } from 'pinia';
import { reactive } from 'vue';

const useDesignStore = defineStore(
  'vformDesign',
  () => {
    const renderJsonCache = reactive({
      data: {},
    });
    return {
      renderJsonCache,
    };
  },
);

export default useDesignStore;
