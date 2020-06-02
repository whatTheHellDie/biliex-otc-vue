<template>
  <div class="income-expenses-wrap wrap-white" style="height: auto; min-height: 100%;">
    <div class="income-expenses-box">
      <div v-if="userOrder.length" v-for="item in userOrder" class="income" @click="toOrder(item)" :class="{expenses:item.type=='提现'}">
        <div class="left">
          <div v-if="item.type=='recharge'" class="round">充</div>
          <div v-if="item.type=='withdraw'" class="round">提</div>
          <div v-if="item.type=='commission'" class="round">返</div>
        </div>
        <div class="left box">
          <div class="clearfix">
            <div class="left">
              <div class="text">
                <div v-if="item.type=='recharge'">充值</div>
          <div v-if="item.type=='withdraw'">提现</div>
          <div v-if="item.type=='commission'">返佣</div>
              </div>
            </div>
            <div class="right">
              <p><span class="span" v-if="item.type=='recharge'">+{{item.num}}</span>
                <span class="span" v-else-if="item.type=='withdraw'">-{{item.num}}</span>
                <span class="span" v-else-if="item.type=='commission'">+{{item.num}}</span>
              </p>
            </div>

          </div>
          <div class="clearfix">
            <div class="left">
              <div class="text">
                <span v-html="getLocalTime(item.add_time)"></span>
              </div>
            </div>
            <div class="right">
              <span v-if="item.status=='待支付'" class="blue">{{item.status}}</span>
              <span v-if="item.status=='待确认'" class="blue">{{item.status}}</span>
              <span v-if="item.status=='充值成功'" class="blue">{{item.status}}</span>
              <span v-if="item.status=='超时取消'" class="red">{{item.status}}</span>
              <span v-if="item.status=='驳回'" class="red">充值失败</span>
              <span v-if="item.status=='0'" class="blue">待收款</span>
              <span v-if="item.status=='1'" class="blue">提现成功</span>
              <span v-if="item.status=='2'" class="red">提现失败</span>
            </div>

          </div>
        </div>

      </div>
      <div v-if="noData" class="no-data">
        <img src="/static/img/ic_not_data@2x.png" class="img" /> 暂无数据
      </div>
      <div v-if="loading" class="no-more">加载中...</div>
      <div v-if="noMore" class="no-more">没有更多了~</div>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="$router.push({name:'login'})" @cancel="$router.push({name:'login'})"></message-box>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        userOrder: [],
        noMore: false,
        loading: true,
        noData: false,
        showMessage: false,
        message: '',
      };
    },
    created() {
      window.incomePage = 0;
      this.getData(window.incomePage)
      window.addEventListener("scroll", () => {
        if(this.getScrollHeight() == this.getWindowHeight() + this.getDocumentTop()) {
          //当滚动条到底时,这里是触发内容
          //异步请求数据,局部刷新dom
          this.getData(++window.incomePage)
        }
      }, false)
    },
    methods: {
      getLocalTime(timestamp) {
        var date = new Date(timestamp*1000),
        
                          Y = date.getFullYear() + '-',
                          M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-',
                          D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ',
                          h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':',
                          m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
        //                        s = (date.getSeconds()<10?'0'+(date.getSeconds()):date.getSeconds());
        return Y + M + D + h + m;
      },
      getData(index) {
        if(!this.noMore) {
          this.loading = true;
        } else {
          return;
        }
        this.$http({
          data: {
            "s":"Merchant.GetFundsList",
            "offset":index*20,
            "limit":20
          },
        }).then(({
          data
        }) => {
          this.loading = false;
          if(data.code == 200) {
            var page = data.data.list
            if(index === 0 && page.length < 1) {
              this.noData = true;
              return;
            }
            if(page.length > 0) {
              for(let i = 0; i < page.length; i++) {
                this.userOrder.push(page[i])
              }
            } else {
              this.noMore = true
            }
          } else {
            this.message = data.msg;
            this.showMessage = true
          }

        })
      },
      toOrder(obj) {
        if(obj.type == 'recharge') {
            //支付宝或微信支付
            this.$router.push({
              name: 'chargeCoinCode',
              params: {
                orderSn: obj.sn,
                from: 'history'
              }
            })
        }else if(obj.type == 'withdraw'){
          this.$router.push({
            name: 'withdrawCustomize',
            params: {
              obj: obj,
              from: 'history'
            }
          })
        } else {
          obj.add_time=this.getLocalTime(obj.add_time)
          this.$router.push({
            name: 'rebate',
            params: {
              obj: obj,
              from: 'history'
            }
          })
        }
      },
      getDocumentTop() {
        var scrollTop = 0,
          bodyScrollTop = 0,
          documentScrollTop = 0;
        if(document.body) {
          bodyScrollTop = document.body.scrollTop;
        }
        if(document.documentElement) {
          documentScrollTop = document.documentElement.scrollTop;
        }
        scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
        return scrollTop;
      },
      getWindowHeight() {
        var windowHeight = 0;
        if(document.compatMode == "CSS1Compat") {
          windowHeight = document.documentElement.clientHeight;
        } else {
          windowHeight = document.body.clientHeight;
        }
        return windowHeight;
      },
      getScrollHeight() {
        var scrollHeight = 0,
          bodyScrollHeight = 0,
          documentScrollHeight = 0;
        if(document.body) {
          bodyScrollHeight = document.body.scrollHeight;
        }
        if(document.documentElement) {
          documentScrollHeight = document.documentElement.scrollHeight;
        }
        scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
        return scrollHeight;
      }
    }
  }
</script>