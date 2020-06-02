<template>
  <div class="wrap-white login-box">
    <ul class="form">
      <li class="form-item" :class="{focus:userName}" @click="addFocus('userName')">
        <p class="inp-title">手机号</p>
        <div class="input-box">
          <input class="inp inp-phone" type="text" id="userName" @blur="reduceFocus('userName')" v-model="form.userName" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
      </li>
      <li class="form-item" :class="{focus:password}" @click="addFocus('password')">
        <p class="inp-title">新密码</p>
        <div class="input-box">
          <input class="inp inp-password" id="password" :type="passwordType" @blur="reduceFocus('password')" v-model="form.password" />
          <img src="/static/img/hide-password.png" @click="switchPassword" alt="" class="hide-password" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
      </li>
      <li class="form-item" :class="{focus:verification}" @click="addFocus('verification')">
        <p class="inp-title">验证码</p>
        <div class="input-box">
          <input class="inp inp-password" id="verification" type="text" @blur="reduceFocus('verification')" v-model="form.verification" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
        <div v-if="!validateStatus" class="verification-box" @click="getValidate">
          获取验证码
        </div>
        <div v-else class="verification-box">剩余{{time}}秒</div>
      </li>
    </ul>
    <div class="btn primary btn-login" @click="forgetPassword">找回密码</div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
    <div class="tip-box" v-if="tipBox">
      {{copyTip}}
    </div>
  </div>
</template>

<script>
  import axios1 from '@/utils/axios1'
  export default {
    data() {
      return {
         passwordType:"password",
        showMessage: false,
        message: '',
        userName: false,
        password: false,
        verification: false,
        form: {
          userName: '',
          password: '',
          verification: ''
        },
        copyTip: "找回密码成功",
        time: null,
        validateStatus: false,
        tipBox: false
      }
    },
    methods: {
      switchPassword(){
        this.passwordType=this.passwordType=="password"?"text":"password"
      },
      forgetPassword() {
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
        if(!this.form.verification) {
          this.message = '验证码不能为空'
          this.showMessage = true
          return false
        }
        let loader = this.$loading.show();
        this.$axios({
          url: this.$http.adornUrl('/api/h5'),
          method: 'post',
          data: {
            s: "Default.ChangePwd",
            account: this.form.userName,
            pwd: this.form.password,
            code: this.form.verification
          },
        }).then((data) => {
          loader.hide();
          if(data.data.code == 200) {
            this.tipBox = true
            setTimeout(() => {
              this.$router.push({
                name: 'login'
              })
            }, 2000)
          } else {
            this.message = data.data.msg
            this.showMessage = true;
          }
        });
      },

      // 获取验证码
      getValidate() {
        //手机号
        let loader = this.$loading.show();
        axios1({
          url: this.$http.adornUrl('/app'),
          method: 'post',
          data: {
            s: "User.SendVerifyCode",
            username: this.form.userName,
            areaCode: "86"
          },
          headers: {
            "Isapp": "1"
          },
        }).then((data) => {
          loader.hide();
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
      },
      addFocus(name) {
        this[name] = true
        document.querySelector("#" + name).focus()
      },
      reduceFocus(name) {
        if(this.form[name]) {
          return;
        }
        this[name] = false
      }
    }

  }
</script>

<style>

</style>