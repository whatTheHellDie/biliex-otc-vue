//获取验证码专用请求
import toSign1 from './toSign1'
import axios from 'axios'
import qs from 'qs'
let axios1 = axios.create()
axios1.interceptors.request.use(config => {
    //请求预设
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    config.headers['Sign'] = toSign1(config.data)
    config.data = qs.stringify(config.data)
    return config
  }, function(error) {
    return Promise.reject(error)
  }

)
axios1.interceptors.response.use(function(response) {
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
export default axios1;