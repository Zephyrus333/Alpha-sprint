// logs.js
const util = require('../../utils/util.js')
const db = wx.cloud.database()
const CODE = db.collection('code')
Page({
  data: {
    logs: []
  },
  onShow() {
    let that = this
    
    var value = wx.getStorageSync('user')
    if (value.openid == undefined) {
       return false
    }else {
     that.setData({
       user: value
     })
   }
    if(that.data.user.openid == undefined) {
      wx.clearStorage()
      this.setData({
        user: {}
      })
      app.showTip("请重新登录", "error")
      return false
    }


    CODE.where({
      // _openid: that.data.user.openid
    }).get({
      success: function(res) {
        console.log(res.data)
        let data = res.data.map(item => {
           let time1 = item.date1.split(":")
           let time2 = item.date2.split(":")
           let str = ""
           time1.forEach((item,index) => {
              str += time2[index] - item   + ':'
           })
           str =  str.replace(/\s/g,"").slice(0,str.length - 1)
          return {
              ...item,
              str
          }
        })
        that.setData({
          logs: data
        })
        console.log("log", that.data.logs)
      }
    })
    
  }
})
