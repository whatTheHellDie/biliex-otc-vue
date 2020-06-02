<template>
  <div class="charge-pay-wrap wrap-white">
    <div class="money-box">
      <div>
        <h1>充值金额</h1>
        <p><strong>{{payAmount}}</strong>CNY</p>
      </div>
      <div>
        <h1>支付金额</h1>
        <p><strong>{{needPayAmount}}</strong>BTC</p>
      </div>
      <div v-if="notFinish">
        <h1>验证码</h1>
        <div class="code">
          <input type="text" placeholder="请输入手机验证码" v-model="yzm">
          <span v-if="!validateStatus" @click="getValidate">获取验证码</span>
          <span v-else>剩余{{time}}秒</span>
        </div>
      </div>
    </div>
    <div class="btn-box bottom1">
      <div class="btn primary" v-if="notFinish" @click="confirmPay">确认支付</div>
      <div class="btn primary" v-else>交易成功</div>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        payWay: null,
        payAmount: null,
        needPayAmount: null,
        memberAccount: null,
        time: null,
        validateStatus: false,
        notFinish: true,
        backTime: 3,
        showMessage: false,
        message: "",
        yzm: ""
      };
    },
    created() {
      if(this.$route.params.from=="history"){
        this.notFinish=false;
        this.payAmount=this.$route.params.payAmount
        this.needPayAmount=this.$route.params.needPayAmount
      }else{
      this.memberAccount = this.$cookie.get('memberAccount')
//    this.memberAccount = localStorage.memberAccount
      this.payWay = this.$route.params.payWay
      this.payAmount = this.$route.params.payAmount
      this.$nextTick(() => {
        this.$axios({
          url: this.$http.adornUrl('/app/getBtcNum'),
          method: 'post',
          //发送格式为json
          data: JSON.stringify({
            "cny": this.payAmount,
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'token': this.$cookie.get('token')
          }
        }).then((data) => {
          
          if(data.data.code == 200) {
            this.needPayAmount = data.data.data.btcNum
          }else{
             this.message=data.data.msg
        this.showMessage=true
          }
        });

      })
      }
    },
    methods: {
      confirmPay() {
        if(!this.yzm) {
          this.message = "请先填写验证码"
          this.showMessage = true
          return false
        }
        let loader = this.$loading.show();
        this.$axios({
          url: this.$http.adornUrl('/app/createRechargeOrder'),
          method: 'post',
          //发送格式为json
          data: JSON.stringify({
            "payWay": 3,
            "payAmount": this.payAmount,
            "verifyCode": this.yzm
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'token': this.$cookie.get('token')
          }
        }).then((data) => {
          loader.hide()
          if(data.data.code == 200) {
            this.notFinish = false
          } else {
            this.message = data.data.msg
            this.showMessage = true
          }
        });

      },
      getValidate() {
          //手机号
          let loader = this.$loading.show();
          this.$axios({
            url: this.$http.adornUrl('/app/getSmsCode'),
            method: 'post',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'token': this.$cookie.get('token')
            }
          }).then((data) => {
            loader.hide()   
            if(data.data.code == 200) {
              this.validateStatus = true;
              this.time = 60;
              window.validateInterval = setInterval(() => {
                if(this.time > 0) {
                  this.time--;
                } else {
                  this.validateStatus = false;
                  clearInterval(window.validateInterval)
                }
              }, 1000)
            } else {
              this.message = data.data.msg
              this.showMessage = true;
            }
          });

      }
    },
    destroyed() {
      clearInterval(window.validateInterval)
    }
  }
</script>