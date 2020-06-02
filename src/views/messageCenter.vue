<template>
  <div>
    <div v-if="noData" class="no-data">
        <img src="/static/img/ic_not_data@2x.png" class="img" /> 暂无数据
      </div>
    <ul class="message-center" v-else>
      <li v-for="item in messages" @click="getMerchantOrder(item.id)">
        <div class="radius">
          <img src="/static/img/ic_message_bule_btn@2x.png" class="img" alt="" />
        </div>
        <div class="content">{{item.order_no}}</div>
        <div class="read active" v-if="item.msg_num>0">{{item.msg_num}}条未读消息</div>
        <div class="read" v-else>已读</div>
      </li>
    </ul>
    
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
    <div v-if="loading" class="no-more">加载中...</div>
    <div v-if="noMore" class="no-more">没有更多了~</div>
    
  </div>
</template>

<script>
  export default {
    data() {
      return {
        message: "",
        showMessage: false,
        messages: [],
        loading: true,
        noData: false,
        noMore:false,
      }
    },
    created() {
      this.getMessage(0)
      window.MessageIndex = 0;
      window.addEventListener("scroll", () => {
        if(this.getScrollHeight() == this.getWindowHeight() + this.getDocumentTop()) {
          //当滚动条到底时,这里是触发内容
          //异步请求数据,局部刷新dom
          this.getMessage(++window.MessageIndex)
        }
      }, false)
    },
    methods: {
      getMessage(index) {
        if(!this.noMore){
        this.loading = true;
        }else{
          return ;
        }
        this.$http({
          //发送格式为json
          data: {
            s:'Merchant.GetMsgList',
            offset:index*20,
            limit:20
          }
        }).then((data) => {
          console.log(data)
          this.loading = false;
          if(data.data.code == 200) {
            var list = data.data.data.chats
            if(index === 0 && list.length < 1) {
              this.noData = true;
              return;
            }

            if(list.length > 0) {
              list.map((item) => {
                this.messages.push(item)
              })
            } else {
              this.noMore = true
            }

          } else {
            this.message = data.data.msg;
            this.showMessage = true
          }
        });
      },
      getMerchantOrder(id) {
        this.$http({
          //发送格式为json
          data: {
            "s":"OtcOrders.GetChatInfo",
            "id":id
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

<style>

</style>