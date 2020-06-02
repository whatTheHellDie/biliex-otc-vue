<template>
  <div class="receipt-edit-wrap wrap-white">
    <template>
      <div v-if="receiveType === 1 || receiveType === 2" class="receipt-edit-box">
        <div class="head">
          <div class="receipt-edit">
            <h1>收款方式</h1>
            <span>{{receiveType === 1 ? '支付宝' : '微信'}}</span>
          </div>
          <div class="receipt-edit name">
            <h1>姓名</h1>
            <input type="text" v-model="trueName" placeholder="请输入姓名">
          </div>
        </div>
        <div class="body">
          <div class="receipt-edit">
            <h1>{{receiveType === 1 ? '支付宝账号' : '微信支付账号'}}</h1>
            <div class="cont">
              <input type="text" v-model="account" :placeholder="receiveType === 1 ? '请输入支付宝账号' : '请输入微信支付账号'">
            </div>
          </div>
          <div class="receipt-edit verify-code">
            <h1>验证码</h1>
            <div class="cont">
              <input type="text" v-model="verifyCode" placeholder="请输入账号验证码">
              <span v-if="!validateStatus" @click="getValidate">获取验证码</span>
              <span v-else>剩余{{time}}秒</span>
            </div>
          </div>
          <div class="receipt-edit qr-code">
            <h1>上传收款二维码</h1>
            <div class="cont">
              <img v-if="this.receivePicUrl" :src="receivePicUrl" />
              <img v-else class="add" src="/static/img/ic_add_icon@2x.png" />
              <input @change='add_img($event,0)' accept="image/*;capture=camera" type="file" id="saveImage">
            </div>
          </div>
        </div>
      </div>
      <div v-else class="receipt-edit-box">
        <div class="head">
          <div class="receipt-edit">
            <h1>收款方式</h1>
            <span>银行转账</span>
          </div>
          <div class="receipt-edit name">
            <h1>姓名</h1>
            <input type="text" v-model="trueName" placeholder="请输入姓名">
          </div>
        </div>
        <div class="body">
          <div class="receipt-edit">
            <h1>开户银行</h1>
            <div class="cont">
              <input type="text" v-model="bankName" placeholder="请输入开户银行">
            </div>
          </div>
          <div class="receipt-edit">
            <h1>开户支行</h1>
            <div class="cont">
              <input type="text" v-model="bankBranchName" placeholder="请输入开户支行">
            </div>
          </div>
          <div class="receipt-edit">
            <h1>银行卡账号</h1>
            <div class="cont">
              <input type="text" v-model="account" placeholder="请输入银行卡账号">
            </div>
          </div>
          <div class="receipt-edit verify-code">
            <h1>验证码</h1>
            <div class="cont">
              <input type="text" style="height: .64rem;" v-model="verifyCode" placeholder="请输入账号验证码">
              <span v-if="!validateStatus" style="overflow: hidden;" @click="getValidate">获取验证码</span>
              <span v-else>剩余{{time}}秒</span>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="btn-box bottom1">
      <div class="btn primary" @click="confirmEdit">确认</div>
    </div>
    <message-box :showMessage="showMessage" :message="message" @confirm="showMessage=false" @cancel="showMessage=false"></message-box>
  </div>
</template>

<script>
  import axios1 from '@/utils/axios1'
  import md5 from 'js-md5';
  import qs from 'qs'
  import axios from 'axios'
  import http1 from '@/utils/httpRequest1'
  export default {
    data() {
      return {
        receiveType: 1, // 收款方式
        receiveTypeWay: '', //收款方式名
        receiveTypeName: '', // 收款名
        trueName: '', // 真实姓名
        account: '', // 收款账号
        bankName: '', // 开户银行
        bankBranchName: '', // 开户支行
        receivePicUrl: '', //收款二维码图片 
        verifyCode: '', // 验证码
        time: '', // 验证码剩余时间
        validateStatus: false,
        showMessage: false,
        message: '',
        method: '', // add or edit
      };
    },
    created() {
      this.getRouteParams();
      if(this.method === 'edit') {
        this.findReceipt();
      }
    },
    methods: {
      // 获取路由参数
      getRouteParams() {
        let params = this.$route.params;
        if(Object.keys(params).length !== 0 || this.$cookie.get('receiptEditParams')) {
          if(this.$cookie.get('receiptEditParams') && Object.keys(params).length === 0) {
            params = JSON.parse(this.$cookie.get('receiptEditParams'))
          } else {
            this.$cookie.set('receiptEditParams', JSON.stringify(params))
          }
          this.receiveType = params.receiveType;
          let receiveType = ''
          switch(this.receiveType) {
            case 1:
              this.receiveTypeWay = 'alipay';
              break;
            case 2:
              this.receiveTypeWay = 'wechat';
              break;
            case 3:
              this.receiveTypeWay = 'bank';
              break;
          }
          this.method = params.method;

        }
      },
      // 查询收款
      findReceipt() {

        this.$http({
          data: {
            "s": "OtcUserPayment.GetInfo",
            "code": this.receiveTypeWay
          },
        }).then(data => {
          if(data.data.code == 200) {
            const res = data.data.data;
            this.receiveTypeName = res.receiveTypeName;
            this.trueName = res.realname;
            this.account = res.account;
            this.bankBranchName = res.bankaddress;
            this.bankName = res.bankname;
            let pic=res.pic
//          let index=pic.indexOf('/static')+8
//          pic=pic.substr(index)
            this.receivePicUrl = pic;
          } else {
            this.message = data.data.msg;
            this.showMessage = true;
          }
        });
      },
      // 更新收款
      updateReceipt() {
        let memo={}
        switch(this.receiveTypeWay){
          case 'alipay':
            memo={"realname":this.trueName,"account":this.account,"pic":this.upload_url}
          break;
          case 'wechat':
            memo={"realname":this.trueName,"account":this.account,"pic":this.upload_url}
          break;
          case 'bank':
            memo={"realname":this.trueName,"bankname":this.bankName,"bankaddress":this.bankBranchName,"account":this.account}
          break;
        }
        memo=JSON.stringify(memo)
        console.log(memo)
        this.$http({
          data: {
            "s":"OtcUserPayment.Save",
            "code":this.receiveTypeWay,
            "verify":this.verifyCode,
            "memo":memo
          }
        }).then(data => {
          if(data.data.code == 200) {
            this.$router.replace({
              name: 'index'
            });
          } else {
            this.message = data.data.msg;
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
            username: this.$cookie.get('userNumber'),
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
      // 确认编辑
      confirmEdit() {
        if(!this.trueName) {
          this._showMessage('请填写姓名');
          return;
        }
        if(this.receiveType === 3 && !this.bankName) {
          this._showMessage('请填写开户银行');
          return;
        }
        if(this.receiveType === 3 && !this.bankBranchName) {
          this._showMessage('请填写开户支行');
          return;
        }
        const account = this.account;
        const phone = /^1[3456789]\d{9}$/.test(account);
        const email = /[\w]+(\.[\w]+)*@[\w]+(\.[\w])+/.test(account);
        const zfb = phone || email;
        const wx = /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(account);
        const card = /^([1-9]{1})(\d{14,18})$/.test(account);
        if(!account) {
          this._showMessage('请填写账号');
          return;
        } else if(this.receiveType === 1 && !zfb) {
          this._showMessage('账号格式不正确');
          return;
        } else if(this.receiveType === 2 && !wx) {
          this._showMessage('账号格式不正确,微信号应为英文开头，只可以使用6-20个子母,数字,和下划线和减号;');
          return;
        } else if(this.receiveType === 3 && !card) {
          this._showMessage('账号格式不正确');
          return;
        }
        if(!this.verifyCode) {
          this._showMessage('请填写验证码');
          return;
        }
        if(this.receiveType !== 3 && !this.receivePicUrl) {
          this._showMessage('请上传收款二维码');
          return;
        }
        this.updateReceipt();
      },
      // 上传图片
      add_img(event, index) {
        var img1 = event.target.files[0]
        if(index == 0) {
          let x = document.getElementById('saveImage').files[0];
          let params = new FormData()
          params.append('file', x)
          console.log(params)
          params.append('type', this.receiveTypeWay)
          params.append('s', 'Default.UploadImage')
          let instance = axios.create({
          })
          var myData = {
            'type':this.receiveTypeWay,
            's':'Default.UploadImage'
          }
          const Sign=this.toSign(myData)
          instance.post(this.$http.adornUrl('/api/h5'), params, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Sign":Sign,
              "Token":this.$cookie.get('token')
            }
          }).then(({
            data
          }) => {
            if(data.code == 200) {
              console.log(data.data.url)
              this.receivePicUrl = data.data.real_url;
              this.upload_url=data.data.url

            } else {
              this.message = data.msg;
              this.showMessage = true
            }
          }).catch(({
            error
          }) => {

          })
        }
      },
      toSign(obj, signKey) {
        let nameArray = []
        for(let item in obj) {
          nameArray.push(item)
        }
        nameArray.sort(function(a, b) {
          if(a.toString().toLowerCase() > b.toString().toLowerCase())
            return 1;
          return -1;
        })
        let md5Before = ""
        nameArray.map((item) => {
          md5Before += obj[item].toString()
        })
        //if(!signKey){
        md5Before += "qk7frbjpl9gnx8qqsfzkzsomxcrl88uc"
        //}else{
        //md5Before+=signKey
        //}
        return md5(md5Before)
      },
      _showMessage(msg) {
        this.message = msg;
        this.showMessage = true;
      }
    }
  };
</script>