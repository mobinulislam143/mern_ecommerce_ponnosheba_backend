const mongoose  = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const FavouriteModel = require('../models/FavouriteModel')

exports.AddFavourite = async(req,res)=>{
    try{
        let productId = new ObjectId(req.params.productId);
        let user_id = new ObjectId(req.headers.user_id);
        let reqBody = req.body
        reqBody.productID = productId
        reqBody.userID = user_id
        let result = await FavouriteModel.create(reqBody)
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}
exports.getFavoriteProduct = async(req,res)=>{
    try{
        let user_id = new ObjectId(req.headers.user_id);
        let MatchUserStage = {$match:{userID: user_id} }

        let JoinStageWithProduct = {$lookup: {from: 'products', localField: 'productID', foreignField: '_id', as: 'product'}}

        let JoinStageWithProductDetail = {$lookup: {from: 'productdetails', localField: 'product.productDetailID', foreignField: '_id', as: 'productDetail'}}

        let unwindProductStage = {$unwind: "$product"}
        let unwindProductDetailStage = {$unwind: "$productDetail"}
       
        let result = await FavouriteModel.aggregate([
            MatchUserStage,
            JoinStageWithProduct,
            JoinStageWithProductDetail,
            unwindProductStage,
            unwindProductDetailStage
        ])
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}

exports.RemoveFavourite = async(req,res)=>{
    try{
        let user_id = new ObjectId(req.headers.user_id);
        let reqBody = req.body
        reqBody.userID = user_id
        await FavouriteModel.deleteOne(reqBody)
        res.status(200).json({status: "success", data: "Favourite Product Remove Successfully."})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}