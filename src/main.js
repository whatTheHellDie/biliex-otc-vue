// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { store } from './store/'
import httpRequest from './utils/httpRequest' // api: https://github.com/axios/axios
Vue.config.productionTip = false;
import '@/utils/reset.js'
import './assets/scss/main.scss'
import VueCookie from 'vue-cookie'    
Vue.use(VueCookie)
/* eslint-disable no-new */
Vue.prototype.$http = httpRequest // ajax请求方法
import qs from 'qs'
Vue.prototype.$qs=qs;
import toSign from './utils/toSign'
Vue.prototype.$toSign=toSign;
import axios from 'axios'

axios.interceptors.request.use(config => {
      //请求预设
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        config.headers['Sign'] = toSign(config.data)
        config.data=qs.stringify(config.data)
      return config
    },function(error){
      return Promise.reject(error)
    }
)

axios.interceptors.response.use(function(response) {
  // 对响应数据做点什么
  if (response.data.msg && response.data.code === 40003) { // 401, token失效
    Vue.cookie.delete('token')
    router.replace({name: 'login'})
    return Promise.reject('token失效')
}
  return response;
}, function(error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});
Vue.prototype.$axios=axios;
import MessageBox from './components/MessageBox' //注册全局pc手机共用表格
Vue.use(MessageBox)
import 'vue-loading-overlay/dist/vue-loading.css';
import Loading from 'vue-loading-overlay' //加载
Vue.use(Loading,{width:30,color:"#1B82D1"});

new Vue({
  el: '#app',
  router,
   store,
  components: { App },
  template: '<App/>'
})
