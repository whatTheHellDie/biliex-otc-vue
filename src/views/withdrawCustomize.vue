<template>
  <div class="withdraw-coin-wrap withdraw-customize">
    <div v-if="orderStatus=='驳回'" class="fail-reason">失败原因：{{reason}}</div>
    <div class="money-box">
      <div>
        <h1>提现数量</h1>
        <div class="rela-box">
        <input type="text" v-if="notFinish" placeholder="请输入提现数量" v-model="currency" :readonly="readonly"  @blur="getArrivalAmount">
        <input type="text" v-else  v-model="currency" :readonly="readonly">
        <div class="withdraw-all" @click="withdrawAll" v-if="notFinish">全部提现</div>
        
        </div>
      </div>
      <div class="mention" v-if="notFinish">可提现金额：{{balance}}</div>
    </div>
     <div class="money-box money-box1">
       <div class="shou clearfix">收款方式<div class="edit" v-if="edit" @click="$router.push({name:'receipt'})">编辑</div></div>
      <div class="way-wrap">
        <div class="way" v-if="aliInfo.trueName" :class="{active:payWay==1}" @click="chooseWay(1)"><img src="/static/img/ic_order_pay@2x (2).png" class="img"/>支付宝</div>
        <div class="way weixin" v-if="weiXinInfo.trueName" :class="{active:payWay==2}" @click="chooseWay(2)"><img src="/static/img/ic_order_chart@2x (2).png" class="img"/>微信</div>
        <div class="way bank" v-if="bankInfo.trueName" :class="{active:payWay==3}" @click="chooseWay(3)"><img src="/static/img/ic_order_card@2x.png" class="img"/>银行转账</div>
      </div>
      <div class="info">
        <div class="detail clearfix" v-if="payWay===1">收款账户：{{aliInfo.account}}</div>
        <div class="detail clearfix" v-else-if="payWay===2">收款账户：{{weiXinInfo.account}}</div>
        <div class="detail clearfix" v-else-if="payWay===3">银行卡号：{{bankInfo.account}}</div>
        <div v-if="payWay===1">姓名：{{aliInfo.trueName}}</div>
        <div v-if="payWay===2">姓名：{{weiXinInfo.trueName}}</div>
        <div v-if="payWay===3">姓名：{{bankInfo.trueName}}</div>
      </div>
    </div>
    
    <div class="money-box" v-if="notFinish&&smsActive">
      <div>
        <h1>验证码</h1>
        <div class="code">
          <input type="text" placeholder="请输入手机验证码" v-model="yzm">
          <span v-if="!validateStatus" @click="getValidate">获取验证码</span>
          <span v-else>剩余{{time}}秒</span>
        </div>
      </div>
    </div>
    <div class="btn-box bottom1">
      <div class="btn primary" v-if="notFinish" @click="confirmWithdraw">确认提现</div>
      <div v-else>
      <div class="btn primary" v-if="orderStatus=='待打款'" >待收款</div>
      <div class="btn info" v-if="orderStatus=='超时取消'" >超时取消</div>
      <div class="btn primary" v-if="orderStatus=='已打款'" >提现成功</div>
      <div class="btn info" v-if="orderStatus=='驳回'" >提现失败</div>
      </div>
     
      
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
  </div>
</template>

<script>
  import axios1 from '@/utils/axios1'
  import http1 from '@/utils/httpRequest1'
  export default {
    data() {
      return {
        reason:"",
        receiveTypeName:null,
        edit:true,
        aliInfo:{},
        weiXinInfo:{},
        bankInfo:{},
        payWay:null,
        btcAmount: '',
        balance: '',
        notFinish: true,
        backTime: 3,
        time: null,
        validateStatus: false,
        currency: '',
        showMessage: false,
        message: "",
        yzm: "",
        readonly:false,
        notHistory:true,
        orderStatus:"",
        withdrawName:"",
        orderSn:"",
        smsActive:true
      };
    },
    created() {
      this.$http({
        data: {
          s: "Merchant.GetAmountLimit",
        }
      }).then(({
        data
      }) => {
        if(data.code == 200) {
          this.balance = data.data.limit
        } else {
          this.message = data.msg;
          this.showMessage = true
        }
        
      })
      if(this.$route.params.obj||this.$cookie.get('withdrawCustomizeFrom')=="history"){
        
        var obj={};
        if(!this.$route.params.obj){
          //来自列表
          obj=JSON.parse(this.$cookie.get('withdrawCustomizeObj'))
        }else{
          //来自资金明细
        obj=this.$route.params.obj;
        this.$cookie.set('withdrawCustomizeObj',JSON.stringify(obj))
        }
        this.setWithdrawDefault(obj)
        return false
      }else if(this.$cookie.get('withdrawCustomizeFrom')=="withdrawNow"){
        
        //刚提现刷新后
            var obj=JSON.parse(this.$cookie.get('withdrawCustomizeObj'))
            this.setWithdrawDefault(obj)
        return false
      }
      if(this.$cookie.get('withdrawName')){
        
        this.withdrawName=this.$cookie.get('withdrawName')
      }
      
      this.balance=this.$cookie.get("MerchantQuota")//得到可提现金额
      http1({
        data:{
          s:"OtcUserPayment.GetList"
        }
      }).then(data => {
        if(data.data.code == 200) {
          let showList=[{receiveType:1},{receiveType:2},{receiveType:3}]
          let list=data.data.data.list
          this.reason=data.data.data.comment;
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
           showList.map((item)=>{
            switch(item.receiveType){
             case 1: this.aliInfo=item;break;
             case 2: this.weiXinInfo=item;break;
             case 3: this.bankInfo=item;break;
            }
          })
           
          this.accountList = showList;
        } else {
          this.message = data.data.msg;
          this.showMessage = true;
        }
      })
    },
    watch:{
      currency(val,oldVal){
        if(isNaN(Number(val))){
          this.currency=oldVal
        }
      }
    },
    destroyed(){
      clearInterval(window.withdrawInterval)
    },
    methods: {
       withdrawAll(){
          this.currency=this.balance
          this.getArrivalAmount()
        },
            getArrivalAmount(){
        if(this.readonly){
          //如果输入框只能看
          return false
        }
        if(Number(this.currency)-Number(this.balance)>0){
          this.currency=this.balance;
          return;
        }
      },

      setWithdrawDefault1(obj){
        this.orderSn=obj.sn;
        this.notFinish=false
        this.currency=obj.num
        this.orderStatus='待打款';
          window.withdrawInterval=setInterval(()=>{
            this.$http({
        //发送格式为json
        data: {
          s:"OtcMerchantWithdraw.GetInfo",
          sn:this.orderSn
        }
      }).then((data) => {
        if(data.data.code==200){
          this.reason=data.data.data.comment;
          this.orderStatus=data.data.data.status
          if(this.orderStatus!='待打款'){
            clearInterval(window.withdrawInterval)
          }
        }else{
          this.message = data.data.msg;
            this.showMessage = true
        }
      });
          },1000)
        let userInfo={}
        this.edit=false
        this.readonly=true
      },
      setWithdrawDefault(obj){
        this.orderSn=obj.sn;
        this.notFinish=false
        this.currency=obj.num
        this.orderStatus='待打款';
          window.withdrawInterval=setInterval(()=>{
            this.$http({
        //发送格式为json
        data: {
          s:"OtcMerchantWithdraw.GetInfo",
          sn:this.orderSn
        }
      }).then((data) => {
        if(data.data.code==200){
          this.reason=data.data.data.comment;
          this.orderStatus=data.data.data.status
          if(this.orderStatus!='待打款'){
            clearInterval(window.withdrawInterval)
          }
          var obj=data.data.data.payment_memo
          let userInfo={}
        userInfo.trueName=obj.realname;
          userInfo.account=obj.account;
          var receiveType=null;
          switch(obj.pay_code){
            case 'alipay':receiveType=1;break;
            case 'wechat':receiveType=2;break;
            case 'bank':receiveType=3;break;
            
          }
        this.payWay=receiveType
        switch(receiveType){
          case 1:
            this.aliInfo=userInfo;
            
          break;
          case 2:
            this.weiXinInfo=userInfo;
          break;
          case 3:
            this.bankInfo=userInfo;
          break;
        }
        }else{
          this.message = data.data.msg;
            this.showMessage = true
        }
      });
          },1000)
        
        this.edit=false
        this.readonly=true
      },
      chooseWay(type){
        if(this.receiveTypeName){
          return ;
        }
        this.payWay=type
      },
      
      confirmWithdraw() {
        
        if(!this.currency) {
          this.message = "请输入提现数量"
          this.showMessage = true
          return false 
        }
        if(this.smsActive){
          if(!this.yzm) {
            this.message = "请先填写验证码"
            this.showMessage = true
            return false
          }
        }
        if(!this.payWay){
          this.message = "请先选择收款方式"
          this.showMessage = true
          return false
        }
        let payWay=null
        switch(this.payWay){
          case 1:payWay="alipay";break;
          case 2:payWay="wechat";break;
          case 3:payWay="bank";break;
        }
        let loader = this.$loading.show();
        this.$http({
          //发送格式为json
          data: {
            "s":"OtcMerchantWithdraw.Create",
            "amount":this.currency,
            "code":payWay,
            "verify":this.yzm
          }
        }).then((data) => {
          loader.hide()
          if(data.data.code == 200) {
            this.$cookie.set('withdrawCustomizeFrom',"withdrawNow")
            this.$cookie.set('withdrawCustomizeObj',JSON.stringify(data.data.data))
            this.setWithdrawDefault1(data.data.data)
          } else {
            this.message = data.data.msg
            this.showMessage = true
          }
        });

      },
      getValidate() {
        //手机号
        if(!this.currency) {
          this.message = "请输入提现数量"
          this.showMessage = true
          return false
        }
        let loader = this.$loading.show();
        axios1({
          url: this.$http.adornUrl('/app'),
          method: 'post',
          data: {
            s: "User.SendVerifyCode",
            username: this.$cookie.get('userNumber'),
            areaCode: "86"
          },
          headers: {
            "Isapp": "1"
          },
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
    }
  }
</script>