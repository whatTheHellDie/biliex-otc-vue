import MessageBoxComponent from './MessageBox.vue'

const MessageBox = {
  install: function (Vue) {
    Vue.component('MessageBox', MessageBoxComponent)
  }
}

export default MessageBox