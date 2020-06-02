<template>
  <div class="charge-wrap">
    <div class="charge-money-box">
      <h1 class="clearfix">充值金额<div class="more" v-if="tooMore" @click="showMore">{{showMoney}}<img src="/static/img/ic_right_bule@2x.png" class="img" :class="{turn:!hideCharge}" alt="下拉" /></div></h1>
      <ul :class="{activeHide:hideCharge}">
        <li v-for="(item, index) in chargeMoneys" :class="{active: index == chargeMoneyIndex}" @click="chargeMoneyFn(index)">{{item}}元</li>
      </ul>
    </div>
    <div class="charge-payment-box charge-payment-box1" style="margin-top: 1rem;">
      <h1>选择支付方式</h1>
      <ul>
        <li v-for="(item, index) in payments"  :class="{active:index==paywayIndex}" @click="paymentFn(index)">
          <img class="ic-left" :src="item.leftSrc">
          <span>{{item.name}}</span>
          <img class="ic-right" :src="item.rightSrc">     
        </li>
      </ul>
    </div>
    <div class="btn-box bottom1">
      <div class="btn primary" @click="chargeNow">立即充值</div>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showMessage:false,
      message:'',
      paywayIndex:null,
      chargeMoneys: [],
      payWay:[],
      tooMore:false,
      hideCharge:false,
      showMoney:"更多金额",
      payments: [
        {
          name: '支付宝',
          leftSrc: '/static/img/ic_order_pay@2x.png',
          rightSrc: '/static/img/ic_check-circle_violet_not@2x.png'
        },
        {
          name: '微信',
          leftSrc: '/static/img/ic_order_chart@2x.png',
          rightSrc: '/static/img/ic_check-circle_violet_not@2x.png'
        }
      ],
      paymentIndex: 0,
      chargeMoneyIndex: 0,
      fullPage: false
      
    };
  },
   created(){
        //查询充币订单详情
        this.$axios({
          url: "http://192.168.10.10:8020/sidebar/token/grant",
          method: 'post',
          //发送格式为json
          data: JSON.stringify({
          "timestamp": new Date().getTime(),
          "applicationNo": "201911230929262ktr1574472566223",
          "applicationKey": "YzdhOTk1ZDUtYzMwYy00YzZlLThlMTMtODJkNTI0Yjc5MmFj"
        }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          }
        }).then((data) => {
          });
          
    },
  methods: {
    showMore(){
      if(this.hideCharge){
        this.showMoney="隐藏"
        this.hideCharge=false
      }else{
        this.showMoney="更多金额"
        this.hideCharge=true
      }
      
    },
    chargeNow(){
      if(this.paywayIndex==null){
        this.message="支付方式不能为空"
        this.showMessage=true
        return;
      }
      if(this.paywayIndex!=2){
        this.$router.push({name:'chargeCoinCode',params:{payWay:Number(this.paywayIndex)+1,payAmount:this.chargeMoneys[this.chargeMoneyIndex],from:'create'}})
      }else{
        this.$router.push({name:'chargeCoinPay',params:{payWay:Number(this.paywayIndex)+1,payAmount:this.chargeMoneys[this.chargeMoneyIndex],from:'create'}})
      }
    },
    // 选择支付方式
    paymentFn(index) {
      this.paywayIndex=index
            this.payments.forEach((ele, i) => {
        this.payments[i].rightSrc = '/static/img/ic_check-circle_violet_not@2x.png';
        if (index == i) {
          this.payments[index].rightSrc = '/static/img/ic_check-circle_violet@2x.png';
        }
      });

    },
    // 选择充值金额
    chargeMoneyFn(index) {
      this.chargeMoneyIndex = index;
          

    }
  }
};
</script>