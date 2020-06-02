<template>
  <div class="receipt-wrap wrap-white">
    <div class="receipt-box">
      <div v-for="(item, index) in accountList" :key="item.receiveType">
        <div v-if="item.account" class="receipt already">
          <div class="body">
            <template>
              <img v-if="item.receiveType === 1" class="ic-left" src="/static/img/ic_order_pay_big@2x.png">
              <img v-else-if="item.receiveType === 2" class="ic-left" src="/static/img/ic_order_chart_big@2x.png">
              <img v-else class="ic-left" src="/static/img/ic_order_card_big@2x.png">
            </template>
            <div class="info">
              <p>账号：{{item.account}}</p>
              <p class="name">姓名：{{item.trueName}}</p>
            </div>
          </div>
          <div class="foot">
            <span class="edit" @click="updateReceipt(item.receiveType, 'edit')">编辑</span>
          </div>
        </div>
        <div v-else class="receipt not">
          <div class="body">
            <template>
              <img v-if="item.receiveType === 1" class="ic-left" src="/static/img/ic_order_pay_big@2x.png">
              <img v-else-if="item.receiveType === 2" class="ic-left" src="/static/img/ic_order_chart_big@2x.png">
              <img v-else class="ic-left" src="/static/img/ic_order_card_big@2x.png">
            </template>
            <div class="info">
              <span>未添加</span>
            </div>
            <img class="ic-right" @click="updateReceipt(item.receiveType, 'add')" src="/static/img/ic_plus_circle@2x.png">
          </div>
        </div>
      </div>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
     <message-box :showMessage="showMessage1" :message="message1" confirmWord="去添加"  @confirm="$router.push({name:'receipt'})" @cancel="showMessage1=false"></message-box>
  </div>
</template>

<script>
  import http1 from '@/utils/httpRequest1'
export default {
  data() {
    return {
      accountList: [],
      showMessage: false,
      message: '',
      showMessage1: false,
      message1: '',
    };
  },
  created() {
    this.getReceipt();
  },
  methods: {
    // 获取收款
    getReceipt() {
      http1({
        data:{
          s:"OtcUserPayment.GetList"
        }
      }).then(data => {
        if(data.data.code == 200) {
          let showList=[{receiveType:1},{receiveType:2},{receiveType:3}]
          let list=data.data.data.list
          list.map((item)=>{
            let obj={}
            console.log(item)
            if(item.pay_code== "alipay"){
              obj.receiveType=1
              obj.account=item.memo.account
              obj.trueName=item.memo.realname
              showList[0]=obj
            }else if(item.pay_code== "wechat"){
              obj.receiveType=2
              obj.account=item.memo.account
              obj.trueName=item.memo.realname
              showList[1]=obj
            }else{
              obj.receiveType=3
              obj.account=item.memo.account
              obj.trueName=item.memo.realname
              showList[2]=obj
            }
          })
          
          this.accountList = showList;
        } else {
          this.message = data.data.msg;
          this.showMessage = true;
        }
      })
    },
    // 更新收款方式
    updateReceipt(receiveType, method) {
      this.$router.push({
        name: 'receiptEdit',
        params: {
          receiveType,
          method,
        }
      });
    }
  }
};
</script>