<template>
  <div class="wrap" :class="{wrap1:isContactMerchant}">
  <div class="navbar" v-if="navbar" :class="{bgw:activeBackground}"><!--白色背景还是灰色背景-->
      <img class="back" src="/static/img/ic_arrowleft@2x.png" @click="go"/>
      <div class="title">{{title}}</div>
      <div class="message" v-if="showUnread" @click="$router.push({name:'messageCenter'})">
        <img src="/static/img/ic_message@2x.png" alt="" class="img" />
        <div class="red-m">{{unreadNumber}}</div>
      </div>
      <div class="message message1" v-if="$route.name=='property'" @click="$router.push({name:'withdrawRecord'})" style="font-size: .28rem;">提现记录</div>
    </div>
    <router-view></router-view>
    <!--<message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>-->
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    data() {
      return {
        navbar:true,
        activeBackground:false,
        showMessage: false,
        message: "",
        unreadNumber:null,
        showUnread:false
      }
    },
    watch:{
      '$route':{
        handler:function(val){
          if(val.name=='index'||val.name=='orderManagement'){
            this.showUnread=true
          }else{
            this.showUnread=false
          }
        if(val.name=='messageCenter'){
          this.activeBackground=true
        }else{
          this.activeBackground=false
        }
//      if(val.name=='login'){
//        this.navbar=false
//      }else{
//        this.navbar=true
//      }
        if(val.name=='index'){
        }
        if(window.socket){
          window.socket.on('disconnect', (timeout) => {
  // ...
  console.log("断开连接"+timeout)
});
        this.disconnect()
        
        }
      },
        immediate:true
    },
      },
    computed:mapState({
      title(){
        return this.$route.meta.title
      },
      isContactMerchant(){
        return this.$route.name=='contactMerchant'
      }
    }),
    methods:{
      getMessage(){
        var val=this.$route
        if(val.name=='index'||val.name=='orderManagement'){
        
        this.$http({
          data: {
            s:'Merchant.GetMsgList',
            offset:0,
            limit:1
          },
        }).then((data) => {
          if(data.data.code == 200) {
            this.unreadNumber=data.data.data.total_num
          } else {
            this.message2 = data.data.msg;
            this.showMessage2 = true
          }
        });
        }
      },
      disconnect(){
         window.socket.disconnect()
      },
      go(){
        
        if(this.$route.name=="index"){
          if(this.$cookie.get("backPage")){
            window.open(this.$cookie.get("backPage"),'_self')
          }else{
//          self.location=document.referrer
            history.go(-1)
          }
          
        }else{
          this.$router.go(-1)
        }
//      self.location=document.referrer
//        this.$router.go(-1)
      },
    },
    created(){
      this.getMessage()
      setInterval(()=>{
        if(this.$cookie.get('token')&&this.$route.name=="index"){
          this.getMessage()
        }
      },5000)
      
    }
  }
</script>

<style type="text/css">
</style>