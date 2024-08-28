const CommentModel = require('../models/CommentModel')
const ProductModel = require('../models/ProductModel')
const mongoose  = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

exports.CommentProduct = async(req,res)=>{
    try{
        let user_id = new Object(req.headers.user_id)
        let productId = req.params.productId
        let reqBody = req.body
        reqBody.userID = user_id
        reqBody.productID = productId
        let result = await CommentModel.create(reqBody)
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data: err.toString()})
    }
}

exports.getCommentByProduct = async(req,res)=>{
    try{
        let productId = new ObjectId(req.params.productId)
        let MatchProductStage = {$match: {productID: productId}}
        let JoinWithUserStage = { $lookup: { from: 'users',localField: 'userID', foreignField: '_id', as: 'user' }};
        
        let UnwindproductUserStage = {$unwind: '$user'}
        let ProjectionStage = {$project: {'user._id': 0,'user.age': 0,'user.mobile': 0,'user.address': 0,'user.createdAt': 0,'user.updatedAt': 0,'user.password': 0,'user.confirmPassword': 0,  }}
        let AddFieldStage = {
            $addFields: {
                createdAt: {
                    $dateToString:{
                        date: "$createdAt",
                        format: "%d-%m-%Y"
                    }
                }
            }
        }

        let result = await CommentModel.aggregate([
            MatchProductStage,
            JoinWithUserStage,
            UnwindproductUserStage,
            ProjectionStage,
            AddFieldStage
        ])
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data: err.toString()})
    }
}