'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  baseUrl: '"http://192.168.10.163:82"',  //不能去掉里面的""
  baseUrl1: '"http://192.168.10.163:82"',  //不能去掉里面的""
biliexUrl:'"http://192.168.10.163:82/otc?s=OtcAdv.ListView&m=otc&sign=e316bdbddd9aedcf5fffe58231210c24"'
  
})