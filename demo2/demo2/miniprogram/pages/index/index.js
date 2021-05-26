// index.js
// 获取应用实例
var QQMapWX = require('../../qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js');
var qqmapsdk;
const app = getApp()
const db = wx.cloud.database()
const CODE = db.collection('code')
Page({
  data: {
    user: {

    },
    daArr:[
      {
        date: "",
        area: ""
      },
      {
        date: "",
        area: ""
      },
    ]
  },
  login(e) {
    console.log(e)
    
    if(e.detail.userInfo) {
      
      wx.showLoading()
      wx.cloud.callFunction({
        name: 'login',
      }).then(res => {
        // debugger
        // console.log("登录",res)
        let  data = {
          imgSrc: e.detail.userInfo.avatarUrl,
          name:  e.detail.userInfo.nickName,
          openid: res.result.userInfo.openId
       }
       console.log(data)
      //  debugger
        wx.setStorage({
          key:"user",
          data: {
             imgSrc: e.detail.userInfo.avatarUrl,
             name:  e.detail.userInfo.nickName,
             openid: res.result.userInfo.openId
          }
        })
        // // debugger
        this.setData({
          user: {
            imgSrc: e.detail.userInfo.avatarUrl,
            name:  e.detail.userInfo.nickName,
            openid: res.result.userInfo.openId
          }
        })
        app.showTip("登录成功", "success")
        wx.hideLoading()
      }).catch(err=>{
        wx.hideLoading()
        app.showTip("登录失败", "error")
      })
     
    }
  },
   gettime(cc) {
    var today=new Date();
    var y=today.getFullYear();
    var m=today.getMonth();
    var d=today.getDate();
    var h=today.getHours();
    var i=today.getMinutes();
    var s=today.getSeconds();// 在小于10的数字钱前加一个‘0’
    m=m+1;
    d=this.checkTime(d);
    m=this.checkTime(m);
    i=this.checkTime(i);
    s=this.checkTime(s);
   if(cc) return y + "-" + m + "-" + d
   if(!cc)  return h+":"+i+":"+s
},
checkTime(i){
  if (i<10){
      i="0" + i;
  }
  return i;
},
getauthSetting() {
  let that = this
  wx.getSetting({
    success (res) {
      console.log(res.authSetting["scope.userLocation"])
      let a = res.authSetting["scope.userLocation"]
      if(a == false) {
         app.showTip("请授权位置", "error")
      }else{
        that.getArea()
        app.showTip("记得打开GPS", "loading")
      }
      // debugger
      // if(res.authSetting["scope.userLocation"] )
      // res.authSetting = {
      //   "scope.userInfo": true,
      //   "scope.userLocation": true
      // }
    }
  })
},
  getArea() {
    
    
    // console.log("1221")
    if(this.data.user.openid == undefined) {
      wx.clearStorage()
      app.showTip("请重新登录", "error")
      return false
    }
    wx.showLoading()
    let that = this
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        // console.log("asdasdasd",res.longitude)
        // debugger
        // if(!res.longitude) {
          
        //   return false
        // }
        qqmapsdk.reverseGeocoder({
          location: {
            latitude,
            longitude
          },
          success: function(res2) {
             console.log(res2)
             app.showTip("打卡成功", "success")
             console.log(that.data)
             var daArr = [...that.data.daArr]
             
             if(daArr[0].date == "") {
              daArr[0] = {
                  date: that.gettime(),
                  area: res2.result.address
                }
             } else {
              daArr[1] = {
                date: that.gettime(),
                area: res2.result.address
              } 
             }
             wx.hideLoading()
             that.setData({
               daArr
             })
             that.addCode(daArr)
          },
          fail: function() {
            wx.hideLoading()
             app.showTip("打卡失败", "error")
             app.showTip("请打开GPS或授权", "error")
          }
        })
      }
     })
  },
  onLoad() {
    qqmapsdk = new QQMapWX({
      key: 'SP2BZ-SHPH3-4DA3O-3RB6O-J6UGF-WBBCX'
     });
  },
  addCode(daArr) {
    let that = this
    console.log(that.data.user.openid)
    // debugger
    CODE.where({
      time: that.gettime(true),
      // _openid: that.data.user.openid
    })
    .get({
      success: function(res) {
        // res.data 是包含以上定义的两条记录的数组
        console.log("什么鬼",res.data)
         if(res.data.length > 0) {
           // 更新
           CODE.doc(res.data[0]._id).update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 done 字段置为 true
                area1: daArr[0].area,
                area2: daArr[1].area,
                date1: daArr[0].date,
                date2: daArr[1].date,
                time: that.gettime(true)
            },
            success: function(res1) {
              console.log(res1.data)
            },
            fail: function(err) {
              console.log(err)
            }
          })
         }else {
           // 添加
          //  debugger
             CODE.add({
              // data 字段表示需新增的 JSON 数据
              data: {
                // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                area1: daArr[0].area,
                area2: daArr[1].area,
                date1: daArr[0].date,
                date2: daArr[1].date,
                time: that.gettime(true)
              },
              success: function(res1) {
                // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                console.log(res1)
              },
              fail: function(err) {
                console.log(err)
              }
            })
         }
      }
    })
    


    // // let that = this
    // CODE.add({
    //   // data 字段表示需新增的 JSON 数据
    //   data: {
    //     // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
    //     area1: daArr[0].area,
    //     area2: daArr[1].area,
    //     date1: daArr[0].date,
    //     date2: daArr[1].date,
    //     time: that.gettime(true)
    //   },
    //   success: function(res) {
    //     // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
    //     console.log(res)
    //   }
    // })
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
      // wx.clearStorage()
      this.setData({
        user: {}
      })
      app.showTip("请重新登录", "error")
      return false
    }
 

  //  console.log("openid",this.data.user.openid )
    CODE.where({
      time: this.gettime(true),
      // _openid: this.data.user.openid
    }).get({
      success: function(res) {
        // res.data 包含该记录的数据
        console.log("前端",res.data)
        if(res.data.length  == 0) return false
        let data = [
          {
            date: res.data[res.data.length-1].date1,
            area: res.data[res.data.length-1].area1
          },
          {
            date: res.data[res.data.length-1].date2,
            area: res.data[res.data.length-1].area2
          },
        ]
        // debugger
        console.log("data", that.data.daArr)
        that.setData({
          daArr: data
        })
       
      },
      fail: function(err) {
        console.log(err)
      }
    })
  //   qqmapsdk.search({
  //     keyword: '酒店',
  //     success: function (res) {
  //         console.log(res);
  //     },
  //     fail: function (res) {
  //         console.log(res);
  //     },
  // complete: function (res) {
  //     console.log(res);
  // }
// })
  }
})
