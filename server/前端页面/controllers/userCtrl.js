const {
    Email
} = require('../utils/config')

// 引入用户表操作对象
var User = require('../model/userForm')

var login = async (req, res, next) => {

    const {
        email,
        password
    } = req.body;

    var exist = await User.findByEmail(email);

    if (!exist) {
        res.json({
            msg: '用户名不存在',
            status: -2
        })
    } else {
        User.findByEmailAndPsd(email, password)
            .then(result => {
                if (result) {
                    req.session.userInfo = result;
                    res.json({
                        status: 0,
                        msg: 'ok'
                    });
                } else {
                    res.json({
                        status: -1,
                        msg: '账号或密码不正确'
                    });
                }
            })
            .catch(error => {
                // 数据库错误
                res.json({
                    status: -3,
                    msg: error.message
                });
            })
    }

}

var emailVerify = async (req, res, next) => {

    var {
        email
    } = req.query;

    var code = Email.code;
    console.log(code);
    console.log(req.session);

    // 验证码保存在session里
    req.session.code = code;
    req.session.email = email;
    // console.log(req.session);


    // 要发送的字段
    var mailOptions = {
        from: '[PXC] <blossomyclover@163.com>',
        to: email,
        // 标题
        subject: '[PXC]验证码',
        // 内容
        text: '验证码为：' + code
    }

    Email.transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log(error);
            res.json({
                msg: '验证码发送失败：' + error,
                status: -1
            })
        } else {
            res.json({
                msg: '验证码发送成功',
                status: 0,
                id: req.session._id
            })
        }
    })

}
var telVerify = async (req, res, next) => {

    var {
        email
    } = req.query;

    const sendCode = require("../utils/sendCode");
    // 发送验证码
    let code = "";
    for (var i = 1; i <= 6; i++) {
        code += Math.floor(Math.random() * 10);
    }
    console.log(code);
    console.log(req.session);

    // 验证码保存在session里
    req.session.code = code;
    req.session.email = email;
    // console.log(req.session);

    sendCode(email, code)
        .then(function (response) {
            let {
                Code
            } = response
            if (Code === 'OK') {
                res.json({
                    msg: '验证码发送成功',
                    status: 0,
                    id: req.session._id
                })
            }
        }, function (err) {
            res.json({
                msg: '验证码发送失败：' + error,
                status: -1
            })
        })


}

// 注册控制
var regiester = async (req, res, next) => {

    // 前端传输的参数，邮箱、密码、验证码
    // console.log(req.body);

    var {
        username,
        email,
        password,
        code
    } = req.body;
    // console.log(req.session);

    // console.log(req.session.email);
    // console.log(req.session.code);

    if ((email !== req.session.email) || (code !== req.session.code)) {
        res.json({
            message: '验证码错误',
            status: -1
        })
    } else {
        User.add(username, email, password)
            .then(() => {
                res.json({
                    msg: '注册成功',
                    status: 0
                })
            })
            .catch((err) => {
                res.json({
                    msg: '注册失败: ' + err.message,
                    status: -2
                })
            })
    }
}


// 登录是否过期
var checkLogin = async (req, res) => {
    if (req.session.userInfo && req.session.userInfo.email) {
        res.json({
            status: 0,
            msg: '没有过期'
        })
    } else {
        res.json({
            status: -1,
            msg: '请重新登录'
        })
    }
}

var logout = async (req, res) => {
    delete req.session.userInfo;
    res.json({
        status: 0,
        msg: '退出登录成功'
    })
}

var userInfo = async (req, res) => {
    if (req.session.userInfo) {
        res.json({
            status: 0,
            msg: 'ok',
            data: req.session.userInfo
        })
    } else {
        res.json({
            status: -1,
            msg: '请重新登录',
            data: null
        })
    }
}
// 编辑资料
var modify = async (req, res) => {
    var {
        _id,
        username,
        sexID,
        birthday,
        desc
    } = req.body;
    User.update(_id, username, sexID, birthday, desc)
        .then(() => {
            User.findByUsername(username)
                .then(result => {
                    if (result) {
                        req.session.userInfo = result;
                    }
                    res.json({
                        msg: '更新成功',
                        status: 0
                    })
                });

        })
        .catch((err) => {
            res.json({
                msg: '更新失败: ' + err.message,
                status: -1
            })
        })
}

module.exports = {
    login,
    regiester,
    emailVerify,
    checkLogin,
    logout,
    userInfo,
    modify,
    telVerify
}