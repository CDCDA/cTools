import { defineStore } from 'pinia';
import { autoClearTimer } from '@/utils/timer.ts';

export const useWebSocketStore = defineStore({
  id: 'websocket',
  state: () => ({
    // 当前已连接的webSocket服务对象
    socket: null,
    isClose: false,
    reconnectNum: 0
  }),
  actions: {
    // 连接 webSocket
    connectWebSocket(functions) {
      if (this.socket) {
        console.log('socket连接已建立');
        this.isClose = true;
        this.socket.close();
        console.log('关闭socket连接并重连');
      }
      autoClearTimer(() => {
        const { hostname, port } = window.location;
        let url = 'ws://localhost:5008/websocket';
        this.socket = new WebSocket(url);
        console.log('初始化socket连接', this.socket);
        // 连接成功
        this.socket.onopen = event => {
          console.log('socket连接成功');
          this.isClose = false;
          this.reconnectNum = 0;
          let onopen = functions.onopen;
          onopen ? onopen(event) : '';
          let onsend = functions.onsend;
          onsend ? onsend(event) : '';
        };
        // 收到消息
        this.socket.onmessage = event => {
          console.log('socket接收信息', event);
          let onmessage = functions.onmessage;
          onmessage ? onmessage(event) : '';
        };
        // 连接关闭
        this.socket.onclose = event => {
          console.log('socket连接关闭');
          if (!this.isClose) {
            console.log('非手动关闭,开始重连');
            this.reconnectNum++;
            this.reconnet(this.reconnectNum);
          }
          let onclose = functions.onclose;
          onclose ? onclose(event) : '';
        };
        // 连接错误
        this.socket.onerror = event => {
          console.log('socket连接错误');
          this.reconnectNum++;
          this.reconnet(this.reconnectNum);
          let onerror = functions.onerror;
          onerror ? onerror(event) : '';
        };
      }, 1000);
    },
    // 关闭 webscoket
    closeWebSocket() {
      if (this.socket) {
        this.isClose = true;
        this.socket.close();
        this.socket = null;
        this.functions = {
          onopen: onOpen,
          onmessage: onMessage,
          onerror: onError,
          onclose: onClose
        };
        console.log('关闭socket连接');
      }
    },

    async reconnet(num) {
      if (num >= 4 && num <= 6) {
        // const { code } = await verifyToken();
        // if (code == 401) {
        //   MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
        //     confirmButtonText: '重新登录',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        //   }).then(() => {
        //     store.dispatch('LogOut').then(() => {
        //       location.href = '/index';
        //     });
        //   });
        // }
      } else if (num >= 6) {
        console.log('socket连接错误超过5次,终止重连');
      } else {
        console.log(`进行第${num}次重连`);
        this.connectWebSocket();
      }
    }
  }
});

export default useWebSocketStore;
