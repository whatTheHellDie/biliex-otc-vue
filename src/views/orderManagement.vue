<template>
  <div class="income-expenses-wrap wrap-white" style="height: auto; min-height: 100%;">
    <div class="income-expenses-box income-expenses-box1">
      <div v-if="userOrder.length" v-for="(item,i) in userOrder" class="income" >
        <div class="left">
          <div class="round">订</div>
        </div>
        <div class="left box">
          <div class="clearfix">
            <div class="left">
              <div class="text">
                <div>{{item.order_no}}</div>
              </div>
            </div>
            <div class="right">
              <p><span class="span">{{item.amount}}</span>
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
              <span v-if="item.status=='取消交易'" class="red">{{item.status}}</span>
              <span v-if="item.status=='待付款'" class="blue">{{item.status}}</span>
              <span v-if="item.status=='待收款'" class="blue">{{item.status}}</span>
              <span v-if="item.status=='交易完成'" class="red">{{item.status}}</span>
              <span v-if="item.status=='超时取消'" class="red">{{item.status}}</span>
            </div>

          </div>
        </div>
        <div class="line" ></div>
        <div class="confirm-box">
        <div class="btn" v-if="item.status=='待收款'" @click="refuse(item.id,i)">未收到款项</div>
        <div class="btn btn1" v-if="item.status=='待收款'" @click="confirm(item.id,i)">确认收款</div>
        </div>
      </div>
      <div v-if="noData" class="no-data">
        <img src="/static/img/ic_not_data@2x.png" class="img" /> 暂无数据
      </div>
      <div v-if="loading" class="no-more">加载中...</div>
      <div v-if="noMore" class="no-more">没有更多了~</div>
    </div>
    <message-box :showMessage="showMessage"  :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
    <message-box :showMessage="showMessage1" confirmWord="已收款" :message="message1" @confirm="setConfirm()" @cancel="showMessage1=false"></message-box>
    <message-box :showMessage="showMessage2" confirmWord="未收款" :message="message2" @confirm="getMerchantOrder()" @cancel="showMessage2=false"></message-box>

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
        activeId:"",
        activeIndex:null,
        showMessage: false,
        message: '',
        showMessage1: false,
        message1: '',
        showMessage2: false,
        message2: '',
        loadingData:false
      };
    },
    created() {
      window.incomePage = 0;
      this.getData(window.incomePage)
      window.addEventListener("scroll", () => {
        if(this.getScrollHeight() == this.getWindowHeight() + this.getDocumentTop()) {
          //当滚动条到底时,这里是触发内容
          //异步请求数据,局部刷新dom
          this.getData()
        }
      }, false)
    },
    methods: {
       getData() {
        if(!this.noMore) {
          this.loading = true;
        } else {
          return;
        }
        if(this.loadingData){
          return;
        }
        this.loadingData=true
        this.$http({
          data: {
            "s":"OtcOrders.GetList",
            "offset":window.incomePage*20,
            "limit":20
          },
        }).then(({
          data
        }) => {
          this.loading = false;
          window.incomePage++;
          this.loadingData=false;
          if(data.code == 200) {
            var page = data.data
            console.log(page)
            if(window.incomePage === 0 && page.length < 1) {
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
      getMerchantOrder(id) {
        this.$http({
          //发送格式为json
          data: {
            "s":"OtcOrders.GetChatInfo",
            "id":this.activeId
          }
        }).then((data) => {
          if(data.data.code == 200) {
            this.$router.push({
              name: 'contactMerchant',
              params: {
                chat: data.data.data
              }
            })
          } else {
            this.message = data.data.msg;
            this.showMessage = true
          }
        });
      },
      setConfirm(){
        this.showMessage1=false
        let loader = this.$loading.show();
        this.$http({
          data: {
            "s":"OtcOrders.SetStatus",
            "id":this.activeId,
            "state":"2"
          },
        }).then(({
          data
        }) => {
          loader.hide()
          
          if(data.code == 200) {
            this.userOrder[this.activeIndex].status="交易完成"
          } else {
            this.message = data.msg;
            this.showMessage = true
          }

        })
      },
      confirm(activeId,index){
        this.activeId=activeId
        this.activeIndex=index
        this.message1="是否确认收到款项"
        this.showMessage1=true
      },
      refuse(activeId,index){
        this.activeId=activeId
        this.activeIndex=index
        this.message2="是否确认未收到款项"
        this.showMessage2=true
      },
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