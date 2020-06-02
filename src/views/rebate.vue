<template>
  <div class="withdraw-coin-wrap wrap-white">
    <div class="money-box">
      <div>
        <h1>返佣金额</h1>
        <p>{{commission}}</p>
      </div>
      <div>
        <h1>订单号</h1>
        <p>{{sn}}</p>
      </div>
      <div>
        <h1>订单金额</h1>
        <p>{{amount}}</p>
      </div>
      <div>
        <h1>时间</h1>
        <p>{{add_time}}</p>
      </div>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        add_time:'',
        amount:'',
        commission:'',
        sn:"",
        message:'',
        showMessage:false
      };
    },
    created() {
      var params=this.$route.params
      if(params.obj){
        this.$cookie.set('rebateOrderSn',params.obj.sn)
      }
      this.getRebateInfo()
    },
    methods: {
      getRebateInfo(){
        //查询充币订单详情
        this.$http({
            data: {
              "s":"OtcMerchantCommission.GetInfo",
              "sn":this.$cookie.get('rebateOrderSn')
            }
        }).then((data) => {
          console.log(data)
          if(data.data.code == 200) {
            this.add_time=data.data.data.add_time
            this.amount=data.data.data.amount
            this.commission=data.data.data.commission
            this.sn=data.data.data.sn
          } else {
            this.message = data.data.msg;
            this.showMessage = true
          }
        });
      },
    }
  }
</script>