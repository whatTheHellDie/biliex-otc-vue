<template>
  <div>
  <div v-if="payStatus===5" class="fail-reason">失败原因：{{reason}}</div>
  <div class="charge-code-wrap">
      <div class="charge-code-box clearfix">
         <p class="reminder reminder-tip">转账请备注<span>{{otcOrderRemark}}<img src="/static/img/ic_copy1@2x.png" class="copy copy1" @click="copyActiveCode($event,otcOrderRemark)" alt="" /></span></p>
        <div class="left">
          <div class="money">
            <p>充值金额<strong>{{payAmount}}</strong><span class="span">元</span></p>
          </div>
          <div class="qr-code">
            <img :src="qrImg" class="qr-img" alt="二维码">
          </div>
          <div class="charge-code-tip" :class="{down:payStatus==2}">提示：截图保存，打开微信或支付宝扫一扫，从相册中选取保存图片。或长按二维码识别图片(部分手机浏览器不支持该功能)</div>
        </div>
        <div class="right">
          <p class="reminder clearfix">收款账户：{{receiptAccount}}</span><img src="/static/img/ic_copy@2x.png" class="copy" @click="copyActiveCode($event,receiptAccount)" alt="" /></p>
          <p class="reminder">姓名：{{receiptName}}</p>
        </div>
      </div>
      <div class="btn-box" style="margin-bottom: .2rem;">
        <div class="btn btn-fix primary" v-if="payStatus===1&&!hasEnd" :class="{down:payStatus==2}" @click="paySuccess">确认支付</div><!--没有倒计时时-->
        <div class="btn btn-fix primary" v-if="payStatus===1&&timeFinish&&hasEnd" :class="{down:payStatus==2}" @click="paySuccess">我已付款成功 {{payRemainTime}}</div>
        <div class="btn btn-fix info" v-if="payStatus===2" :class="{down:payStatus==2}">待确认</div>
        <div class="btn btn-fix primary" v-if="payStatus===3" :class="{down:payStatus==2}">充值成功</div>
        <div class="btn btn-fix info" v-if="payStatus===4" :class="{down:payStatus==2}">超时取消</div>
        <div class="btn btn-fix info" v-if="payStatus===5" :class="{down:payStatus==2}">充值失败</div>
      </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="confirm" @cancel="showMessage=false"></message-box>
    <message-box :showMessage="showMessage1" :message="message1" @confirm="showMessage1=false" @cancel="showMessage1=false"></message-box>
    <message-box :showMessage="showMessage2" :message="message2" @confirm="$router.go(-1)" @cancel="$router.go(-1)"></message-box>
    <transition name="fade">
      <div class="tip-box" v-if="tipBox">
        {{copyTip}}
      </div>
    </transition>
  </div>
  </div>
</template>

<script>
  import Clipboard from 'clipboard'
  export default {
    data() {
      return {
        hasEnd:true,
        reason:"",
        timeFinish:false,
        btcNum: '',
        usdtNum: '',
        btcTotal: '',
        usdtTotal: '',
        allCoinTotal: '',
        btcAddress: '',
        usdtAddress: '',
        receiptAccount: '',
        receiptName: '',
        copyTip: "复制成功",
        tipBox: false,
        orderSn: '',
        showMessage: false,
        showMessage1: false,
        showMessage2: false,
        message: '',
        message1: "",
        message2: "",
        payStatus: null,
        code: 0,
        payWay: null,
        payAmount: null,
        qrImg: '',
        otcOrderRemark: '',
        payRemainTime: '',
        orderStatus: '',
        nowTime: ''
      }
    },
    created() {
      if(this.$route.params.payWay && this.$route.params.from == 'create') {
          this.payWay = this.$route.params.payWay
          this.$cookie.set('payWay', this.payWay)
          this.payAmount = this.$route.params.payAmount
          let code=this.$route.params.payWay==1?'alipay':'wechat'
//      localStorage.payWay = this.payWay = this.$route.params.payWay
//      localStorage.payAmount = this.payAmount = this.$route.params.payAmount
        //创建充币订单
        this.$http({
          data: {
            s:'OtcMerchantRecharge.Create',
            amount:this.payAmount,
            code:code
          },
        }).then((data) => {

          if(data.data.code == 200) {
            this.hasEnd=data.data.data.predict_valid===0?false:true 
            if(data.data.data.account) {
              this.receiptAccount = data.data.data.account

              this.$cookie.set('receiptAccount', this.receiptAccount)
//            localStorage.receiptAccount = this.receiptAccount
            }
            if(data.data.data.realname) {
              this.receiptName = data.data.data.realname
              this.$cookie.set('receiptName', this.receiptName)
//            localStorage.receiptName = this.receiptName
            }
            if(data.data.data.pic) {
              this.qrImg = data.data.data.pic
            }
            this.payAmount=data.data.data.recharge
            var sn=data.data.data.sn
            this.otcOrderRemark = sn.substr(sn.length-6)
            
            this.orderSn = data.data.data.sn
            this.$cookie.set('chargeOrderSn', this.orderSn)
//          localStorage.chargeOrderSn = this.orderSn = data.data.data.orderSn
            var date = new Date().getTime()
            let nowTime = data.data.data.server_time;
            nowTime = nowTime.replace(/-/g, "/");
            var gap = date - new Date(nowTime).getTime() - 1;
            this.payRemainTime = this.dateToRemainTime(data.data.data.predict_end_time, gap);
            this.orderStatus = data.data.data.status
            this.reason=data.data.data.reason;
            window.RemainTimeInterval = setInterval(() => {
              var time = this.dateToRemainTime(data.data.data.predict_end_time, gap)
              this.changeStatus(time,data.data.data.predict_end_time)
            }, 1000)
          } else {
            this.message2 = data.data.msg;
            this.showMessage2 = true
          }
        });
      } else if(this.$route.params.orderSn && this.$route.params.from == 'history') {
        this.$cookie.set('chargeOrderSn', this.$route.params.orderSn)
        this.getChargeInfo()
      } 
      else if(this.$cookie.get('payWay')) {
        this.payWay = this.$cookie.get('payWay')
        this.getChargeInfo()
      }else{
      }

    },
    methods: {
      changeStatus(time,endTime){
        if(!this.hasEnd&&endTime!==""){
          this.payStatus = 1
          return ;
        }
        if(time !== 0 && this.orderStatus === 0) {
                this.payStatus = 1
                this.payRemainTime = time;
              } else if(time === 0 && this.orderStatus === 0) {
                this.payStatus = 4
              } else {
                if(this.orderStatus == 1) {
                  this.payStatus = 2
                } else if(this.orderStatus == 2) {
                  this.payStatus = 3
                } else if(this.orderStatus == 3) {
                  this.payStatus = 4
                }  else if(this.orderStatus == 4) {
                  this.payStatus = 5
                } 
                clearInterval(window.RemainTimeInterval)
              }
      },
      getChargeInfo(){
        //查询充币订单详情
        this.$http({
            data: {
              "s":"OtcMerchantRecharge.GetInfo",
              "sn":this.$cookie.get('chargeOrderSn')
            }
        }).then((data) => {
          if(data.data.code == 200) {
            if(data.data.data.account) {
              this.hasEnd=data.data.data.predict_valid===0?false:true 
              this.receiptAccount = data.data.data.account

              this.$cookie.set('receiptAccount', this.receiptAccount)
            }
            if(data.data.data.realname) {
              this.receiptName = data.data.data.realname
              this.$cookie.set('receiptName', this.receiptName)
            }
            if(data.data.data.pic) {
              this.qrImg = data.data.data.pic
            }
            this.payAmount=data.data.data.recharge
            var sn=data.data.data.sn
            this.otcOrderRemark = sn.substr(sn.length-6)
            
            this.orderSn = data.data.data.sn
            this.$cookie.set('chargeOrderSn', this.orderSn)
            var date = new Date().getTime()
            let nowTime = data.data.data.server_time;
            nowTime = nowTime.replace(/-/g, "/");
            var gap = date - new Date(nowTime).getTime() - 1;
            this.payRemainTime = this.dateToRemainTime(data.data.data.predict_end_time, gap);
            this.orderStatus = data.data.data.status
            this.reason=data.data.data.reason;
            window.RemainTimeInterval = setInterval(() => {
              var orderStatus = data.data.data.status;
              var time = this.dateToRemainTime(data.data.data.predict_end_time, gap)
              console.log(this.hasEnd)
              this.changeStatus(time,data.data.data.predict_end_time)
            }, 1000)
          } else {
            this.message1 = data.data.msg;
            this.showMessage1 = true
          }
        });
      },
      copyActiveCode(e, text) {
        const clipboard = new Clipboard(e.target, {
          text: () => text
        })
        clipboard.on('success', e => {
          this.copyTip = "复制成功"
          this.tipBox = true;
          setTimeout(() => {
            this.tipBox = false;
          }, 3000)
          //      this.$message({ type: 'success', message: '复制成功' })
          // 释放内存
          clipboard.off('error')
          clipboard.off('success')
          clipboard.destroy()
        })
        clipboard.on('error', e => {
          this.copyTip = "该浏览器不支持自动复制，请长按对应数字进行复制" 
          this.tipBox = true
          // 不支持复制
          //      this.$message({ type: 'waning', message: '该浏览器不支持自动复制' })
          // 释放内存
          clipboard.off('error')
          clipboard.off('success')
          clipboard.destroy()
        })
        clipboard.onClick(e)
      },
      paySuccess() {
        this.showMessage = true
        this.message = `是否确认已经成功转账，并已备注六位数字，
        <span style="color:#1B82D1;">付款成功请联系商家，提交转账截图。</span>`
      },
      confirm(val) {
        if(val) {
          clearInterval(window.RemainTimeInterval)
          let loader = this.$loading.show();
          this.$http({
            data:{
              "s":"OtcMerchantRecharge.Comfirm",
              "order_sn":this.orderSn
            },
          }).then((data) => {
            loader.hide()
            if(data.data.code == 200) {
              this.payStatus = 2;
              this.showMessage = false;
              this.setWatchInterval()
            } else {
              this.message2 = data.data.msg;
              this.showMessage2 = true
            }
          });

        }
      },
      setWatchInterval() {
        window.StatusInterval = setInterval(() => {
          this.$http({
            data: {
              "s":"OtcMerchantRecharge.GetStatus",
              "order_sn":this.orderSn
            }
          }).then((data) => {
            if(data.data.code == 200) {
              var orderStatus = data.data.data.status
              if(orderStatus == '2') {
                this.payStatus = 3;
                clearInterval(window.StatusInterval)
              }else if(orderStatus == '3'){
                this.payStatus = 4;
                clearInterval(window.StatusInterval)
              }else if(orderStatus == '4'){
                this.payStatus = 5;
                clearInterval(window.StatusInterval)
              }
              this.reason=data.data.data.reason
            } else {
              this.message1 = data.data.msg;
              this.showMessage1 = true
            }
          });
        }, 10000)
      },
      dateToRemainTime(s, gap) {
        s = s.replace(/-/g, "/");
        var date = new Date(s).getTime();
        var nowDate = new Date().getTime()
        var s1 = date - nowDate + gap;
        if(s1 <= 0) {
          //如果超时
          return 0
        }
        var time = parseFloat(s1) / 1000;
        if(null != time && "" != time) {
          time = parseInt(time / 3600.0) + ":" + parseInt((parseFloat(time / 3600.0) -
              parseInt(time / 3600.0)) * 60) + ":" +
            parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) -
              parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60);
              if(time==="NaN:NaN:NaN"){
                clearInterval(window.RemainTimeInterval)
                return 1;
              }
              this.timeFinish=true
        }
        return time;

      }
    },
    destroyed() {
      clearInterval(window.RemainTimeInterval)
      clearInterval(window.StatusInterval)
    }

  }
</script>