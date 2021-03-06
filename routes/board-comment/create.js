var express = require('express');
let moment = require('moment');
var router = express.Router();
var async = require('async');
let UserData = require('../../config/user_dbconfig')
let CommentData = require('../../config/comment_dbconfig');
let BoardData = require('../../config/board_dbconfig');
let authMiddleware = require('../middleware/auth');



router.use('/', authMiddleware);
router.post('/:board_id', function (req, res, next) {
    let email = req.decoded.email
    let now = moment();
    let writetime = now.format('YYYY-MM-DD HH:mm:ss');
    let taskArray = [
        callback=>{
            BoardData.find({_id:req.params.board_id}, (err, data)=>{
                if(data){
                    callback(null);
                }else{
                    res.status(500).send({
                        stat: "fail",
                        msgs: "can't find board"
                    });
                    callback("can't find board");
                }
            })
        },
        (callback)=>{
            UserData.find({email : email}, (err, findData)=>{
                if(err){
                    res.status(500).send({
                        stat: "fail",
                        msgs: "can't find email"
                    });
                    callback("can't find email");
                }else{
                    callback(null);
                }
            })

        },
        (callback) => {
            let item = {
                board_id: req.params.board_id,
                author: req.decoded.nickname,
                content: req.body.content,
                writetime: writetime
            };
            callback(null, item);
        },
        (item, callback) => {
            let data = new CommentData(item);
            data.save((err) => {
                if (err) {
                    res.status(500).send({
                        stat: "fail",
                        message: "comment writing error"
                    });
                    callback("sign up fail" + err, null);
                } else {
                    res.status(201).send({
                        stat: "success",
                        data: {
                            _id: data._id,
                            board_id: req.params.board_id,
                            author: req.decoded.nickname,
                            content: req.body.content,
                            writetime: writetime
                        }
                    });
                    callback("comment writing success", null);
                }
            });
        }
    ];
    async.waterfall(taskArray, (err, result)=>{
        if(err) console.log(err);
        else console.log(result);
    });

});

module.exports = router;
