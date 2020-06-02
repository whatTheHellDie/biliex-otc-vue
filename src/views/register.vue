<template>
  <div class="wrap-white login-box">
    <div class="validate-message">{{valadateMessage}}</div>
    <ul class="form">
      <li class="form-item" :class="{focus:userName}" @click="addFocus('userName')">
        <p class="inp-title">手机号</p>
        <div class="input-box">
          <input class="inp inp-phone" type="text" id="userName" @blur="reduceFocus('userName',1)" v-model="form.userName" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
      </li>
      <li class="form-item" :class="{focus:password}" @click="addFocus('password')">
        <p class="inp-title">密码</p>
        <div class="input-box">
          <input class="inp inp-password" id="password" :type="passwordType" @blur="reduceFocus('password',2)" v-model="form.password" />
          <img src="/static/img/hide-password.png" @click="switchPassword" alt="" class="hide-password" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
      </li>
      <li class="form-item" :class="{focus:verification}" @click="addFocus('verification')">
        <p class="inp-title">验证码</p>
        
        <div class="input-box">
          <input class="inp inp-password" id="verification" :type="passwordType" @blur="reduceFocus('verification',3)" v-model="form.verification" />
          <i class="ic ic_close_circle_o float-r"></i>
        </div>
        <div v-if="!validateStatus" class="verification-box" @click="getValidate">
          获取验证码
        </div>
        <div v-else class="verification-box">剩余{{time}}秒</div>
      </li>
    </ul>
    <div class="btn primary btn-login" @click="register">注册</div>
    <div class="switch-box" style="text-align: left;">
      <span class="span" @click="$router.push({name:'login'})">登录</span>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
    <div class="tip-box" v-if="tipBox">{{copyTip}}</div>
  </div>
</template>

<script>
  import axios1 from '@/utils/axios1'
  export default {
    data() {
      return {
        passwordType:"password",
        valadateMessage:"",
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
         time: null,
        validateStatus: false,
        copyTip:"注册成功",
        tipBox:false
      }
    },
    methods: {
      switchPassword(){
        this.passwordType=this.passwordType=="password"?"text":"password"
      },
      valadateInput(type){
        const userName = this.form.userName
        const phone = /^1[3456789]\d{9}$/.test(userName);
        if(!phone&&type==1) {
          this.valadateMessage = '手机号格式不正确'
          return false
        }
        const password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/.test(this.form.password);
        if(!password&&type==2) {
          this.valadateMessage = '请输入不少于8位有效数字或英文字母的密码'
          return false
        }
        if(!this.form.verification&&type==3) {
          this.valadateMessage = '验证码不能为空'
          return false
        }
        this.valadateMessage=""
      },
      register() {
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
            s: "Default.Register",
            account: this.form.userName,
            pwd: this.form.password,
            code:this.form.verification
          },
        }).then((data) => {
          loader.hide();
          if(data.data.code == 200) {
            this.tipBox = true
            setTimeout(()=>{
              this.$router.push({name:'login'})
            },2000)
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
      reduceFocus(name,type) {
        this.valadateInput(type)
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