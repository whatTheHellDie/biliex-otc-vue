<template>
  <div class="message-box message-box2" v-if="showMessage" >
    <div class="reminder">
    </div>
      <div class="message-main"> 
       <!--<div class="title reminder">提示<img src="/static/img/ic_close@2x.png" class="close" @click="closeMessageBox"></div>-->
    
        <div class="content" v-html="message"></div>
        <div class="btn-group">
          <div class="btn btn-cancel" @click="closeMessageBox">取消</div>
          <div class="btn" v-if="!confirmWord" @click="confirmMessage">确认</div>
          <div class="btn" v-if="confirmWord" @click="confirmMessage">{{confirmWord}}</div>
        </div>
      </div>
    </div>
</template>

<script>
  export default {
    data(){
      return {
      }
    },
    props:{
      showMessage:{
        type:Boolean,
        default:false
      },
      message:{
        type:String
      },
      confirmWord:{
        type:String,
        default:''
      }
      
    },
    
    methods:{
      closeMessageBox() {
      this.$emit('cancel',true)
    },
    confirmMessage(){
      this.$emit('confirm',true)
    }
    }
    
  }
</script>

<style>
</style>