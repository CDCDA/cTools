/*
 * @Description:登录用户数据
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
const useUserStore = defineStore('user', () => {
  const userName = ref('');
  const avatar = ref('');
  const userId = ref('');
  const token = ref('');
  const nickName = ref('');
  const email = ref('');
  const permission = ref([]) as any;
  return {
    userName,
    token,
    permission,
    userId,
    avatar,
    nickName,
    email
  };
});

export default useUserStore;
