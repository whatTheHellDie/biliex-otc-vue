<template>
    <div class="wrap-white login-box">
      <div class="switch-box">
        <span class="span" @click="$router.push({name:'register'})">注册</span>|<span class="span" @click="$router.push({name:'forgetPassword'})">忘记密码？</span>
      </div>
    <h1 class="title">OTC商家登录</h1>
    <ul class="form">
      <li class="form-item" :class="{focus:userName}" @click="addFocus('userName')" >
        <p class="inp-title">手机号</p>
        <div class="input-box">
          <input class="inp inp-phone" type="text" id="userName" @blur="reduceFocus('userName')" v-model="form.userName"/>
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
      </li>
      <li class="form-item" :class="{focus:password}" @click="addFocus('password')">
        <p class="inp-title">密码</p>
        <div class="input-box">
          <input class="inp inp-password" id="password" :type="passwordType" @blur="reduceFocus('password')" v-model="form.password" />
          <img src="/static/img/hide-password.png" @click="switchPassword" alt="" class="hide-password" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
      </li>
    </ul>
      <div class="btn primary btn-login" @click="login">登录</div>
      
      <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
  </div>
</template>

<script>
  export default {
      data() {
      return {
        passwordType:"password",
          userName:false,
          password:false,
          form:{
            userName:'',
          password:'',
          },
          showMessage: false,
        message: '',
       }
      },
    methods:{
      switchPassword(){
        this.passwordType=this.passwordType=="password"?"text":"password"
      },
      login() {
        const userName = this.form.userName
        const phone = /^1[3456789]\d{9}$/.test(userName);
        if(!phone) {
          this.message = '手机号格式不正确'
          this.showMessage = true;
          return false
        }
        if(!this.form.password) {
          this.message = '密码不能为空'
          this.showMessage = true
          return false
        }
        let loader = this.$loading.show();
        this.$axios({
          url: this.$http.adornUrl('/api/h5'),
          method: 'post',
          data: {
            s: "Default.Login",
            account: this.form.userName,
            pwd: this.form.password,
          },
        }).then((data) => {
          loader.hide();
          if(data.data.code == 200) {
            this.$cookie.set('token', data.data.data.token)
            this.$cookie.set('userNumber', this.form.userName)
            this.$router.push({name:'index'})
          } else {
            this.message = data.data.msg
            this.showMessage = true;
          }
        });
      },
      addFocus(name){
        this[name]=true
        document.querySelector("#"+name).focus()
      },
      reduceFocus(name){
         if(this.form[name]){
          return;
        }
        this[name]=false
      }
    }
    
  }
</script>

<style>

</style>