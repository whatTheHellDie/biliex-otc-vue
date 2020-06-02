import Vue from 'vue'
import Router from 'vue-router'
import http from '@/utils/httpRequest'
Vue.use(Router)
const globalRoutes = [
]

// 主入口路由(需嵌套上左右整体布局)
const mainRoutes = {
  path: '/',
  component: resolve=>require(['@/views/main'],resolve),
  name: 'main',
  redirect: {name: 'index'},
  meta: {title: '主入口整体布局'},
  children: [
    // 通过meta对象设置路由展示方式
    // 1. isTab: 是否通过tab展示内容, true: 是, false: 否
    // 2. iframeUrl: 是否通过iframe嵌套展示内容, '以http[s]://开头': 是, '': 否
    // 提示: 如需要通过iframe嵌套展示内容, 但不通过tab打开, 请自行创建组件使用iframe处理!
    {path: '/index', component: resolve=>require(['@/views/index'],resolve), name: 'index', meta: {title: 'OTC'}},
    {path: '/login', component: resolve=>require(['@/views/login'],resolve), name: 'login', meta: {title: '登录'}},
    {path: '/register', component: resolve=>require(['@/views/register'],resolve), name: 'register', meta: {title: '注册'}},
    {path: '/forgetPassword', component: resolve=>require(['@/views/forgetPassword'],resolve), name: 'forgetPassword', meta: {title: '找回密码'}},
    {path: '/messageCenter', component: resolve=>require(['@/views/messageCenter'],resolve), name: 'messageCenter', meta: {title: '消息中心'}},
    {path: '/contactMerchant', component: resolve=>require(['@/views/contactMerchant'],resolve), name: 'contactMerchant', meta: {title: '联系商家'}},
    //path:charge永远不要写
    {path: '/chargeCoin', component: resolve=>require(['@/views/chargeCoin'],resolve), name: 'chargeCoin', meta: {title: '充值'}},
    {path: '/chargeCoinPay', component: resolve=>require(['@/views/chargeCoin-pay'],resolve), name: 'chargeCoinPay', meta: {title: '充币'}},
    {path: '/chargeCoinCode', component: resolve=>require(['@/views/chargeCoin-code'],resolve), name: 'chargeCoinCode', meta: {title: '充币'}},
    {path: '/chargeCoinCodeSifang', component: resolve=>require(['@/views/chargeCoin-code-sifang'],resolve), name: 'chargeCoinCodeSifang', meta: {title: '充币'}},
    {path: '/withdraw', component: resolve=>require(['@/views/withdraw'],resolve), name: 'withdraw', meta: {title: '提现'}},
    {path: '/withdrawCustomize', component: resolve=>require(['@/views/withdrawCustomize'],resolve), name: 'withdrawCustomize', meta: {title: '提现'}},
    {path: '/rebate', component: resolve=>require(['@/views/rebate'],resolve), name: 'rebate', meta: {title: '返佣'}},
    {path: '/property', component: resolve=>require(['@/views/property'],resolve), name: 'property', meta: {title: '数字资产'}},
    {path: '/incomeExpenses', component: resolve=>require(['@/views/incomeExpenses'],resolve), name: 'incomeExpenses', meta: {title: '资金明细'}},
    {path: '/orderManagement', component: resolve=>require(['@/views/orderManagement'],resolve), name: 'orderManagement', meta: {title: '订单管理'}},
    {path: '/receipt', component: resolve=>require(['@/views/receipt'],resolve), name: 'receipt', meta: {title: '收款方式'}},
    {path: '/receiptEdit', component: resolve=>require(['@/views/receipt-edit'],resolve), name: 'receiptEdit', meta: {title: '编辑收款方式'}},
  ],
  beforeEnter(to, from, next) {
    // if (to.meta.title) {
    //   document.title = to.meta.title
    // }
    next()
  }
}


const router = new Router({
  scrollBehavior: () => ({y: 0}),
  isAddDynamicMenuRoutes: false, // 是否已经添加动态(菜单)路由
  routes: globalRoutes.concat(mainRoutes)
})

export default router;

//export default new Router({
// routes: [
// {
// path: '/',
// name: 'casino-dapp',
// component: CasinoDapp
// }
// ]
//})
