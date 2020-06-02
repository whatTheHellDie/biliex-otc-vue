import Vue from 'vue'
import axios from 'axios'
import router from '@/router'
import qs from 'qs'
import merge from 'lodash/merge'
import {clearLoginInfo} from '@/utils'
import toSign from './toSign'
const http = axios.create({
  baseURL: process.env.baseUrl + '/api/h5',
  method:'POST'
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  config.headers['Sign'] = toSign(config.data)
  config.data=qs.stringify(config.data)
  config.headers['token'] = Vue.cookie.get('token') // 请求头带上token
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
if (response.data.msg && response.data.code === 40003) { // 401, token失效
  
    Vue.cookie.delete('token')
    router.replace({name: 'login'})
    return Promise.reject('token失效')
}
  return response
}, error => {
  return Promise.reject(error)
})

/**
 * 请求地址处理
 * @param {*} actionName action方法名称
 */
http.adornUrl = (actionName) => {
  // 非生产环境 && 开启代理, 接口前缀统一使用[/proxyApi/]前缀做代理拦截!
  return process.env.baseUrl + actionName
}

export default http
