var db=wx.cloud.database()
var app=getApp()
var data={}
Page({

  data: {
    tx:"",
    nm:""
  },
  //更新微信头像与昵称
  GetUserInfo(){
    wx.getUserProfile({
      desc: '用于获取头像与昵称', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (xx) => {
        console.log(xx)
        data=xx.userInfo
        wx.showLoading({
          title: '更新中...',
        })
        var userInfo=data
        app.userInfo.userinfo.name=userInfo.avatarUrl
        app.userInfo.userinfo.photo=userInfo.nickName
        db.collection('users').doc(app.userInfo._id).update({
          data:{
            'userinfo.userphoto':userInfo.avatarUrl,
            'userinfo.username':userInfo.nickName,
          }
        }).then((res)=>{
          this.setData({
            tx:userInfo.avatarUrl,
            nm:userInfo.nickName
          })
          wx.hideLoading({})
          wx.showToast({
            title: '更新成功',
            duration: 3000
          })
          
        })
      }
    })
  },
  //授权手机号
  phone(e){
    var s=this;
    //此处获取手机号授权，通过云调用取回手机号
    //getPhoneNumber:fail user deny
    //getPhoneNumber:ok
    //
    if(e.detail.errMsg=="getPhoneNumber:fail user deny"){
      wx.showToast({
        title: '您取消了授权',
        icon:"none",
      })
    }else if(e.detail.errMsg=="getPhoneNumber:ok"){
      //这是授权了：
      wx.showLoading({
        title: '处理中...',
        mask:true
      })
      console.log(e.detail.cloudID)
      wx.cloud.callFunction({
        name:'getphone',
        data:{
          id:e.detail.cloudID
        }
      }).then((res)=>{
        //console.log("取回：",res)
        if(res.errMsg=="cloud.callFunction:ok"){
          var phone=res.result.list[0].data.phoneNumber
          console.log(">>>",phone,"<<<")
          db.collection('users').doc(app.userInfo._id).update({
            data:{
              phone:phone
            }
          })
          wx.hideLoading({})
          wx.showToast({
            title: '绑定成功！',
            icon:"none",
            duration:5000
          })
        }else{
          wx.hideLoading({})
          wx.showToast({
            title: '获取号码错误',
            icon:"none",
          })
        }
      })
    }else{
      wx.hideLoading({})
      wx.showToast({
        title: '授权手机错误',
        icon:"none",
      })
    }
  },

  onLoad(){
    var tx=app.userInfo.userinfo.userphoto
    var nm=app.userInfo.userinfo.username
    console.log(tx)
    this.setData({
      tx:tx,
      nm:nm
    })
  }
})