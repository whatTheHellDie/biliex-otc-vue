<template>
  <div class="charge-code-wrap">
      <div class="charge-code-box clearfix">
         <p class="reminder reminder-tip">请扫该二维码或填写账户进行转账，并备注<span>{{otcOrderRemark}}<img src="/static/img/ic_copy1@2x.png" class="copy copy1" @click="copyActiveCode($event,otcOrderRemark)" alt="" />，付款成功后点击付款成功按钮</span></p>
        <div class="left">
          <div class="money">
            <p>充值金额<strong>{{payAmount}}</strong><span class="span">元</span></p>
          </div>
          <div class="qr-code">
            <img :src="qrImg" class="qr-img" alt="二维码">
          </div>
          <div class="charge-code-tip" :class="{down:payStatus==2}">提示：长按二维码识别或截图保存，打开微信或支付宝扫一扫，从相册中选取保存图片</div>
        </div>
        <div class="right">
          <div class="message" @click="getMerchantOrder" v-if="payStatus==2" style="margin-bottom: .2rem;">
            <!--v-if="payStatus!=1"-->
            <span>联系商家</span>
            <img src="/static/img/ic_message_blue@2x.png" class="ic">
          </div>
          <p class="reminder clearfix">收款账户：{{receiptAccount}}</span><img src="/static/img/ic_copy@2x.png" class="copy" @click="copyActiveCode($event,receiptAccount)" alt="" /></p>
          <p class="reminder">姓名：{{receiptName}}</p>
        </div>
      </div>
      <div class="btn-box" style="margin-bottom: .2rem;">
        <div class="btn btn-fix primary" v-if="payStatus===1&&timeFinish" :class="{down:payStatus==2}" @click="paySuccess">我已付款成功 {{payRemainTime}}</div>
        <div class="btn btn-fix info" v-if="payStatus===2" :class="{down:payStatus==2}">待收币</div>
        <div class="btn btn-fix primary" v-if="payStatus===3" :class="{down:payStatus==2}">交易完成</div>
        <div class="btn btn-fix info" v-if="payStatus===4" :class="{down:payStatus==2}">超时取消</div>
        <div class="btn btn-fix info" v-if="payStatus===5" :class="{down:payStatus==2}">交易失败</div>
        <div class="btn btn-fix primary" v-if="payStatus===6" :class="{down:payStatus==2}">提币中</div>
        <div class="btn btn-fix primary" v-if="payStatus===7" :class="{down:payStatus==2}">提币成功</div>
        <div class="btn btn-fix info" v-if="payStatus===8" :class="{down:payStatus==2}">提币失败</div>
        <div class="btn btn-fix info" v-if="payStatus===9" :class="{down:payStatus==2}">交易关闭</div>
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
</template>

<script>
  import Clipboard from 'clipboard'
  export default {
    data() {
      return {
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
      if(this.$route.params.orderSn && this.$route.params.from == 'history') {
        
        this.orderSn = this.$route.params.orderSn
        this.$cookie.set('chargeOrderSn', this.orderSn)
        this.queryChargeOrder()
        
      } 
      else if(this.$cookie.get('chargeOrderSn')) {
        this.queryChargeOrder()
      }else{
      }

    },
    watch: {
  
      orderStatus(val) {
        switch(val) {
          case "100":
            this.payStatus = 1;
            break;
          case "101":
            this.payStatus = 2;
            this.setWatchInterval();
            break;
          case "102":
            this.payStatus = 3;
            break;
          case "103":
            this.payStatus = 4;
            break;
          case "104":
            this.payStatus = 4;
            break;
        }

      }
    },
    methods: {
      queryChargeOrder(){
        //查询充币订单详情
        this.$axios({
          url: this.$http.adornUrl('/app/getRechargeOrderInfo'),
          method: 'post',
          //发送格式为json
          data: JSON.stringify({
            "orderSn": this.$cookie.get('chargeOrderSn')
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'token': this.$cookie.get('token')
          }
        }).then((data) => {
          if(data.data.code == 200) {
            if(data.data.data.receiptAccount) {
              this.receiptAccount = data.data.data.receiptAccount
            }
            if(data.data.data.receiptName) {
              this.receiptName = data.data.data.receiptName
            }
            if(data.data.data.qrUrl) {
              this.qrImg = data.data.data.qrUrl
            }
            this.payAmount = data.data.data.payAmount
            this.otcOrderRemark = data.data.data.otcOrderRemark
            this.orderSn = data.data.data.orderSn
            this.orderStatus = data.data.data.orderStatus
            var date = new Date().getTime()
            let nowTime = data.data.data.nowTime;
            nowTime = nowTime.replace(/-/g, "/");
            var gap = date - new Date(nowTime).getTime() - 1;
            this.payRemainTime = this.dateToRemainTime(data.data.data.payRemainTime, gap);
            window.RemainTimeInterval = setInterval(() => {
              var time = this.dateToRemainTime(data.data.data.payRemainTime, gap)
              if(time !== 0 && this.orderStatus == 100) {
                this.payStatus = 1
                this.payRemainTime = time;
              } else if(time === 0 && this.orderStatus == 100) {
                //              this.message2 = data.data.msg;
                //              this.showMessage2 = true
                this.payStatus = 4
              } else {
                if(this.orderStatus == 101) {
                  this.payStatus = 2
                } else if(this.orderStatus == 102) {
                  this.payStatus = 3
                } else if(this.orderStatus == 103) {
                  this.payStatus = 5
                } else if(this.orderStatus == 103) {
                  this.payStatus = 5
                } else if(this.orderStatus == 104) {
                  this.payStatus = 4
                } else if(this.orderStatus == 200) {
                  this.payStatus = 6
                } else if(this.orderStatus == 201) {
                  this.payStatus = 7
                } else if(this.orderStatus == 202) {
                  this.payStatus = 8
                } else if(this.orderStatus == 999) {
                  this.payStatus = 9
                }
                clearInterval(window.RemainTimeInterval)
              }
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
      getMerchantOrder() {
        this.$axios({
          url: this.$http.adornUrl('/app/contact'),
          method: 'post',
          //发送格式为json
          data: JSON.stringify({
            "orderSn": this.orderSn,
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'token': this.$cookie.get('token')
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
            this.message1 = data.data.msg;
            this.showMessage1 = true
          }
        });
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
          this.$axios({
            url: this.$http.adornUrl('/app/payComplete'),
            method: 'post',
            //发送格式为json
            data: JSON.stringify({
              "orderSn": this.orderSn,
            }),
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'token': this.$cookie.get('token')
            }
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
          this.$axios({
            url: this.$http.adornUrl('/app/getRechargeOrderInfo'),
            method: 'post',
            //发送格式为json
            data: JSON.stringify({
              "orderSn": this.orderSn,
            }),
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'token': this.$cookie.get('token')
            }
          }).then((data) => {
            if(data.data.code == 200) {
              var orderStatus = data.data.data.orderStatus
              if(orderStatus == '102') {
                this.payStatus = 3;
                clearInterval(window.StatusInterval)
              }
            } else {
              this.message1 = data.data.msg;
              this.showMessage1 = true
            }
          });
        }, 1000)
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