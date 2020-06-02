<template>
  <div class="withdraw-choose">
    <div class="li" @click="toWithdraw">
      <div class="left">
        <div class="title">一键提现</div>
        <div class="content1">系统根据当前市场价格快速提现</div>
      </div>
      <img src="/static/img/ic_money_piture_people@2x.png" alt="" class="right" />
    </div>
    <div class="li" @click="toBiliex">
      <div class="left">
        <div class="title">自主提现</div>
        <div class="content1">自己下单提现，可自己
选择心仪价格出售提现</div>
      </div>
      <img src="/static/img/ic_money_piture2_mall@2x.png" alt="" class="right" />
    </div>
    <message-box :showMessage="showMessage" :message="message"  @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
    <message-box :showMessage="showMessage1" :message="message1" confirmWord="去添加"  @confirm="$router.push({name:'receipt'})" @cancel="showMessage1=false"></message-box>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        btcAmount: '',
        balance: '',
        notFinish: true,
        backTime: 3,
        time: null,
        validateStatus: false,
        currency: '',
        showMessage: false,
        message: "",
        showMessage1: false,
        message1: "",
        yzm: "",
        btcNum:"",
        readonly:false,
        notHistory:true,
        orderStatus:"",
        withdrawName:""
      };
    },
    created() {
      let name =this.$route.params.name
      if(name){
        this.$cookie.set('withdrawName',name)
      }
      this.withdrawName=this.$cookie.get('withdrawName')
    },
    methods:{
      toWithdraw(){
//      if(true){
//      this.message="提现需添加收款方式"
//      this.showMessage=true
//      return false
//      }
        this.$axios({
        url: this.$http.adornUrl('/app/getUserWithdrawList'),
        method: 'post',
        //发送格式为json
//      data: JSON.stringify({
//        "currency": this.currency,
//      }),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'token': this.$cookie.get('token')
        }
      }).then((data) => {
        if(data.data.code == 200) {
          data.data.data.list.map((item)=>{
            if(item.trueName){
              this.$cookie.set('withdrawCustomizeFrom','withdraw')
            this.$router.push({name: 'withdrawCustomize',params:{from:'withdraw'}})
            return ;
            }
          })
            this.message1="提现需添加收款方式"
            this.showMessage1=true
          
        } else {
          this.message = data.data.msg;
          this.showMessage = true;
        }
      });
        
      },
      toBiliex(){
//       window.open("https://www.biliex.com/otc?s=OtcAdv.ListView&m=otc&sign=e316bdbddd9aedcf5fffe58231210c24")
         window.open(process.env.biliexUrl)
      }
    }
  }
</script>