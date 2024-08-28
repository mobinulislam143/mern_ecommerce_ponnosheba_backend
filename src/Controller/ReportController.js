const ReportsModel = require('../models/ReportsModel')

exports.ReportProduct = async(req,res)=>{
    try{
        let user_id = new Object(req.headers.user_id)
        let productId = req.params.productId
        let reqBody = req.body
        reqBody.userID = user_id
        reqBody.productID = productId
        let result = await ReportsModel.create(reqBody)
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data: err.toString()})
    }
}
exports.ReportProductById = async(req,res)=>{
    try{
        let user_id = new Object(req.headers.user_id)
        let productId = req.params.productId
        let reqBody = req.body
        reqBody.userID = user_id
        reqBody.productID = productId
        let result = await ReportsModel.create(reqBody)
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data: err.toString()})
    }
}