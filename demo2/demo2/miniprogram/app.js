// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 ')
    } else {
      // debugger
      wx.cloud.init({
        env:'dev-4g0whq6w5cd8bbd4',
        traceUser: true,
      })
    }
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  },
  showTip(title, icon) {
    wx.showToast({  
        title: title,  
        icon: icon,  
        duration: 2000  
    }) 
  }
})
