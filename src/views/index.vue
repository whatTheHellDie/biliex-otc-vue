<template>
  <div class="index-wrap wrap-white">
    <div class="assets-show-box">
      <h1>{{balance}}</h1>

      <select class="select" v-model="selectVal" @change="online">
        <option value="0">下线</option>
        <option value="1">上线</option>
      </select>
      <div class="user-right-box">
        <span class="span" @click="toWithdraw">提现</span>
        <span class="span" @click="$router.push({name: 'chargeCoin'})">充值</span>
      </div>
      <p>可用额度</p>
    </div>
    <div class="menu-box">
      <div class="menu" @click="$router.push({name: 'orderManagement'})">
        <img class="ic-left" src="/static/img/ic_home_coin_charging@2x.png">
        <span>订单管理</span>
        <img class="ic-right" src="/static/img/ic_right@2x.png">
      </div>
      <div class="menu" @click="$router.push({name: 'incomeExpenses'})">
        <img class="ic-left" src="/static/img/ic_icon_orang@2x.png">
        <span>资金明细</span>
        <img class="ic-right" src="/static/img/ic_right@2x.png">
      </div>
      <div class="menu" @click="$router.push({name: 'receipt'})">
        <img class="ic-left" src="/static/img/ic_money@2x.png">
        <span>收款方式</span>
        <img class="ic-right" src="/static/img/ic_right@2x.png">
      </div>
      <div class="menu" @click="quit">
        <img class="ic-left" src="/static/img/quit.png">
        <span>退出登录</span>
        <img class="ic-right" src="/static/img/ic_right@2x.png">
      </div>
      <!--<div class="menu" @click="$router.push({name: 'incomeExpenses'})">
        <img class="ic-left" src="/static/img/ic_money_red@2x.png">
        <span>收支明细</span>
        <img class="ic-right" src="/static/img/ic_right@2x.png">
      </div>-->
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
    <message-box :showMessage="showMessage1" :message="message1" confirmWord="确认退出" @confirm="forceQuit" @cancel="showMessage1=false"></message-box>
    <transition name="fade">
    <div class="tip-box" v-if="tipBox">{{copyTip}}</div>
    </transition>
  </div>
</template>

<script>
  import http1 from '@/utils/httpRequest1'
  export default {
    data() {
      return {
        showMessage: false,
        message: '',
        showMessage1: false,
        message1: '',
        selectVal: null,
        balance: '',
        showMessage: false,
        message: '',
        copyTip:"上线成功",
        tipBox:false,
      }
    },
    created() {
      this.getAmountLimit()
    },
    methods: {
      forceQuit(){
        this.$cookie.set('token',null)
        this.$router.push({name:"login"})
      },
      quit(){
        this.$http({
        data: {
          s: "Merchant.Logout",
        }
      }).then(({
        data
      }) => {
        if(data.code == 200) {
          this.$cookie.set('token',null)
        this.$router.push({name:"login"})
        } else {
          this.message1 = data.msg;
          this.showMessage1 = true
        }
        
      })
        
      },
      getAmountLimit(){
        this.$http({
        data: {
          s: "Merchant.GetAmountLimit",
        }
      }).then(({
        data
      }) => {
        if(data.code == 200) {
          this.balance = data.data.limit
          this.$cookie.set("MerchantQuota",this.balance)
          this.selectVal=data.data.is_h5_online.toString()
        } else {
          this.message = data.msg;
          this.showMessage = true
        }
        
      })
      },
      toWithdraw() {
        http1({
        data:{
          s:"OtcUserPayment.GetList"
        }
      }).then((data) => {
        if(data.data.code == 200) {
          if(data.data.data.list.length===0){
            this.message="提现需添加收款方式"
            this.showMessage=true
            return false
          }
              this.$cookie.set('withdrawCustomizeFrom','withdraw')
            this.$router.push({name: 'withdrawCustomize',params:{from:'withdraw'}})
        } else {
          this.message = data.data.msg;
          this.showMessage = true;
        }
      });
        
      },
      online() {
        if(this.selectVal === '1') {
          this.$http({
            data: {
              s: "OtcAdv.Online",
            }
          }).then(({
            data
          }) => {
            if(data.code == 200) {
              this.getAmountLimit()
              this.copyTip="上线成功"
              this.tipBox=true;
              setTimeout(()=>{this.tipBox=false},3000)
            } else {
              this.message = data.msg;
              this.showMessage = true;
              this.selectVal='0'
            }
          })
        } else {
          this.$http({
            data: {
              s: "OtcAdv.Offline",
            }
          }).then(({
            data
          }) => {
            if(data.code == 200) {
              this.getAmountLimit()
              this.copyTip="下线成功"
              this.tipBox=true;
              setTimeout(()=>{this.tipBox=false},3000)
            } else {
              this.message = data.msg;
              this.showMessage = true;
              this.selectVal='1'
            }
          })
        }
      }
    }
  }
</script>