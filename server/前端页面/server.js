const express = require('express');
const userRouter = require('./routes/userRouter')
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

const homeRouter = require('./routes/homeRouter')




const server = express();

var store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/account',
  collection: 'session'
});

store.on('error', function (error) {
  console.log(error);
});

// 处理静态资源
server.use(express.json());
// 

// 处理post参数
server.use(express.urlencoded({
  urlencoded: false,
  extended: true
}));


// 配置session
server.use(session({
  secret: '%$#@%$#',
  name: 'sessionId',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  store: store
}))

// 处理请求
server.use('/api/user', userRouter);
server.use('/api/home', homeRouter);
server.use('/api/recommend_users', (req, res) => {
  const {
    starUsers
  } = require('./model/mockData')
  if (starUsers) {
    res.json(starUsers);
  } else {
    res.json({
      msg: 'Missing data...',
      status: -1,
      data: null
    })
  }
})

// 响应首页
// server.get('/', (req, res) => {
//   res.sendFile(__dirname + '/www/index.html');
// })

// 响应静态资源
server.use('/js', express.static('./www/js'));
server.use('/css', express.static('./www/css'));
server.use('/assets', express.static('./www/assets'));
server.use('../img', express.static('./www/img'));
server.use('/font', express.static('./www/font'));
server.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/www/favicon.ico');
})

server.use((req, res) => {
  res.sendFile(__dirname + '/www/index.html');
})


// 连接数据库，连接成功再开启服务
mongoose.connect('mongodb://127.0.0.1:27017/account', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (error) => {
  if (error) {
    console.log('连接数据库失败：');
    console.log(error);
  } else {
    console.log('连接数据成功');
    // 启动成功
server
      .listen(3000, (error) => {
        if (!error) {
          console.log('服务器启动成功');
        } else {
          console.log('服务器启动失败：');
          console.log(error);
        }
      })
  }
})