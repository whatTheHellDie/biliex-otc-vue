<template>
  <div class="property-wrap wrap-white">
    <div class="assets-show-box">
      <h1><span>￥</span>{{allCoinTotal}}</h1>
      <p>总资产</p>
    </div>
    <div class="property-box">
      <div class="property">
        <div class="cont">
          <div class="left">
            <img src="/static/img/ic_btc_coin_charging@2x.png" class="ic">
            <span>BTC</span>
          </div>
          <div class="right">
            <P>{{btcNum}}</P>
            <span>≈￥{{btcTotal}}</span>
          </div>
        </div>
        <div class="operation">
          <span @click="openMessageBox('btc')">转入</span>
          <span class="blue" @click="toWithdraw('btc')">提现</span>
        </div>
      </div>
      <div class="property">
        <div class="cont">
          <div class="left">
            <img src="/static/img/ic_icon_usdt@2x.png" class="ic">
            <span>USDT</span>
          </div>
          <div class="right">
            <P>{{usdtNum}}</P>
            <span>≈￥{{usdtTotal}}</span>
          </div>
        </div>
        <div class="operation">
          <span @click="openMessageBox('usdt')">转入</span>
          <span class="blue" @click="toWithdraw('usdt')">提现</span>
        </div>
      </div>
    </div>
    <div class="message-box" v-show="showMessageBox">
      <div class="message-main">
        <div class="reminder">
          <p>请将BTC充值到如下地址</p>
          <img src="/static/img/ic_close@2x.png" class="close" @click="closeMessageBox">
        </div>
        <div class="qr-code">
          <canvas id="canvas"></canvas>
        </div>
        <div class="text-code">
          <p>{{btcAddress}}<img src="/static/img/ic_copy@2x.png" class="ic" @click="copyActiveCode($event,btcAddress)"></p>
        </div>
      </div>
    </div>
    <div class="message-box" v-show="showMessageBox1">
      <div class="message-main">
        <div class="reminder">
          <p>请将USDT充值到如下地址</p>
          <img src="/static/img/ic_close@2x.png" class="close" @click="closeMessageBox">
        </div>
        <div class="qr-code">
          <canvas id="canvas1"></canvas>
        </div>
        <div class="text-code">
          <p>{{usdtAddress}}<img src="/static/img/ic_copy@2x.png" class="ic" @click="copyActiveCode($event,usdtAddress)"></p>
        </div>
      </div>
    </div>
    <transition name="fade">
    <div class="tip-box" v-if="tipBox">
      {{copyTip}}
    </div>
    </transition>
  </div>
</template>

<script>
  import QRCode from 'qrcode'
  import Clipboard from 'clipboard'
export default {
  data() {
    return {
      copyTip:"复制成功",
      tipBox:false,
      showMessageBox: false,
      showMessageBox1:false,
      btcNum:'',
      usdtNum:'',
      btcTotal:'',
      usdtTotal:'',
      allCoinTotal:'',
      btcAddress:'',
      usdtAddress:'',
    };
  },
  components: {
      QRCode: QRCode
  },
  created(){
    this.$http({
          url:this.$http.adornUrl('/app/getUserAssets'),
          method:'POST',
//        params:this.$http.adornParams({
//          "id":e.id
//        })
        }).then(({data})=>{
          if(data.code==200){
            this.btcNum=data.data.btcNum
            this.$cookie.set("btcBalance",data.data.OtcBtcNum)
            this.usdtNum=data.data.usdtNum
            this.$cookie.set("usdtBalance",data.data.OtcUsdtNum)
            this.allCoinTotal=data.data.digitalInfo.total_cny
            var coinsArray=data.data.digitalInfo.coins;
            
            for(var i=0;i<coinsArray.length;i++){
              if(coinsArray[i].name==="BTC"){
                this.btcAddress=coinsArray[i].address
               this.btcTotal=coinsArray[i].total_cny
               
              }else if(coinsArray[i].name==="USDT"){
               this.usdtAddress=coinsArray[i].address;
               this.usdtTotal=coinsArray[i].total_cny;
               
              }
            }
          }
            
          
        })
  },
  methods: {
    toWithdraw(name){
//    window.open("https://www.biliex.com/otc?s=OtcAdv.ListView&m=otc&sign=e316bdbddd9aedcf5fffe58231210c24")
      this.$router.push({name:'withdraw',params:{name:name}})
    },
    openMessageBox(type) {
      if(type=="btc"){
          var canvas=document.getElementById("canvas")
          QRCode.toCanvas(canvas, this.btcAddress, function (error) {
            if (error) console.error(error)
          })
        this.showMessageBox = true;
      }else if(type=="usdt"){
        var canvas=document.getElementById("canvas1")
          QRCode.toCanvas(canvas, this.usdtAddress, function (error) {
            if (error) console.error(error)
          })
          this.showMessageBox1 = true;
      }
      
      
    },
    closeMessageBox() {
      this.showMessageBox = false;
      this.showMessageBox1 = false;
    },
    copyActiveCode(e, text) {
      const clipboard = new Clipboard(e.target, { text: () => text })
      clipboard.on('success', e => {
        this.copyTip="复制成功"
        this.tipBox=true;
        setTimeout(()=>{
          this.tipBox=false;
        },3000)
//      this.$message({ type: 'success', message: '复制成功' })
        // 释放内存
        clipboard.off('error')
        clipboard.off('success')
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        this.copyTip="复制失败，"+e
        this.tipBox=true
        // 不支持复制
//      this.$message({ type: 'waning', message: '该浏览器不支持自动复制' })
        // 释放内存
        clipboard.off('error')
        clipboard.off('success')
        clipboard.destroy()
      })
      clipboard.onClick(e)
    }
  }
};
</script>

<style scoped="scoped">
</style>