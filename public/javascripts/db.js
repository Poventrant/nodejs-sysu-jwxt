// the middleware function
module.exports = function() {
    var mongoose = require('mongoose');

    var connect = function() {
        var options = {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        }
        var connUrl = 'mongodb://localhost/pwqSysu';

        mongoose.connect(connUrl, options, function(err) {
            if (err) {
                console.log("mongodb connect error!");
                throw err;
            }
        })
    }

    connect();  //连接

    var conn = mongoose.connection;

    conn.on('error', function(err) {
        console.log(err);
        process.exit();
    })
    conn.on('connected', function() {
        console.log("mongodb is connected!");
    })
    conn.on('disconnected', function() {
        console.log("mongodb is connected! try to reconnect...");
        connect();
    })

    var model_schema = mongoose.Schema({
        key: {
            type: String,
            required: true
        },
        value: {
            type: String
        },
        createTime: Date,
        modifyTime: Date
    }, {
        strict: false,
        collection: 'cookie'
    });

    model_schema.pre('save', function(next) {
        this.createTime = new Date();
        next();
    });
    model_schema.pre('update', function(next) {
        this.modifyTime = new Date();
        next();
    });

    var CollectionModel = mongoose.model('cookie', model_schema);
    //在这个数据库表里面，查找是否已经存在jsessionid这个字段了，如果存在就更新，否则添加记录
    CollectionModel.findOne({
        key: "jsessionid"
    }, function(err, submit) {
        if (err) throw err;
        if (submit == null) {
            var temp = new CollectionModel({
                key: "jsessionid"
            });
            temp.save(function(err) {
                if (err) {
                    console.log("mongodb model save error!")
                    throw err;
                }
            })
        }
    })

    return function(req, res, next) {
        req.mongo = conn;
        req.cookieColect = CollectionModel;
        next();
    }

};