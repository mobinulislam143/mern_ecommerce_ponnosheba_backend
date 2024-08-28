const CategoryModel = require('../models/CategoryModel')
const SubCategoryModel = require('../models/SubCategoryModel')
const BrandsModel = require('../models/BrandsModel')
const AdminModel = require('../models/AdminModel')
const ProductModel = require('../models/ProductModel')
const UserModel = require('../models/UserModel')
const ReportsModel = require('../models/ReportsModel')
const LocationModel = require('../models/LocationModel')
const ProductDetailsModel = require('../models/ProductDetailsModel')
const { AdminEncodeToken } = require('../utility/TokenHelper')
const mongoose  = require('mongoose')
const cloudinary = require('cloudinary').v2
const ObjectId = mongoose.Types.ObjectId
          
cloudinary.config({ 
  cloud_name: 'dmpsrcunj', 
  api_key: '368331831895173', 
  api_secret: '8P65ZkatdVy5oB4VdBa8APdY6h0' 
});

exports.login = async(req, res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

        const user = await AdminModel.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ status: "failed", message: "Email doesn't match" });
        }
        // Check if the password matches
        if (user.password !== password) {
            return res.status(400).json({ status: 'failed', message: 'Password does not match' });
        }
        let user_id = user._id.toString()
            let token = AdminEncodeToken(email,user_id)

            let CookieOption = {expires: new Date(Date.now()+24*60*60*1000), httpOnly:false}
            res.cookie('token', token, CookieOption)

            res.status(200).json({ status: "success", message: 'Admin Login success', token: token, data: user });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}

exports.createCategory= async(req,res)=>{
    try{
        let categoryName = req.body.categoryName
        const result = await cloudinary.uploader.upload(req.file.path)
        const newCategory = new CategoryModel({
            categoryName: categoryName,
            categoryImg: result.secure_url
        })
        await newCategory.save()
        res.status(200).json({status:"success",data:newCategory})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}
exports.removeCategory= async(req,res)=>{
    try{
        let categoryID = req.params.categoryID
        await CategoryModel.deleteOne({_id: categoryID})
      
        res.status(200).json({status:"success",data: "Category Delete Successfully"})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}
exports.createBrand= async(req,res)=>{
    try{
        let reqBody = req.body
        const result = await BrandsModel.create(reqBody)
        res.status(200).json({status:"success",data:result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.createSubCategory = async(req,res)=>{
    try{
       let reqBody = req.body
       reqBody.categoryID= new ObjectId()
       let result = await SubCategoryModel.create(reqBody)

        res.status(200).json({status:"success",data:result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.createSubCategory = async(req,res)=>{
    try{
       let reqBody = req.body
       reqBody.categoryID= new ObjectId()
       let result = await SubCategoryModel.create(reqBody)

        res.status(200).json({status:"success",data:result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.createProduct = async (req, res) => {
    try {
        const user_id = new Object(req.headers.user_id);
        const reqBody = req.body;
        const uploadedImages = req.files;

        if (!uploadedImages || Object.keys(uploadedImages).length === 0) {
            return res.status(400).json({ status: "fail", data: "No images uploaded" });
        }

        const imageURLs = [];
        for (const image of uploadedImages) {
            const result = await cloudinary.uploader.upload(image.path);
            imageURLs.push(result.secure_url);
        }

        // Create product details
        const productDetails = {
            img1: imageURLs[0] || "",
            img2: imageURLs[1] || "",
            img3: imageURLs[2] || "",
            img4: imageURLs[3] || "",
            img5: imageURLs[4] || "",
            img6: imageURLs[5] || "",
            color: reqBody.color,
            size: reqBody.size,
            model: reqBody.model,
            features: reqBody.features,
            age: reqBody.age,
            edition: reqBody.edition,
            placeOfOrigin: reqBody.placeOfOrigin,
            material: reqBody.material,
            style: reqBody.style
        };

        const createProductDetails = await ProductDetailsModel.create(productDetails);

        // Find category by name (case insensitive matching)
        let category = await CategoryModel.findOne({ categoryName: { $regex: new RegExp('^' + reqBody.categoryName + '$', 'i') } });
        const categoryID = category ? category._id : null;

        // Find subcategory by name (case insensitive matching)
        let subcategory = await SubCategoryModel.findOne({ subCategoryName: { $regex: new RegExp('^' + reqBody.subCategoryName + '$', 'i') } });
        const subcategoryID = subcategory ? subcategory._id : null;

        // Find brand by name (case insensitive matching)
        let brand = await BrandsModel.findOne({ brandName: { $regex: new RegExp('^' + reqBody.brandName + '$', 'i') } });
        const brandID = brand ? brand._id : null;

        // Create product
        const product = await ProductModel.create({
            title: reqBody.title,
            shortDes: reqBody.shortDes,
            price: reqBody.price,
            discount: reqBody.discount,
            discountPrice: reqBody.discountPrice,
            stock: reqBody.stock,
            remark: reqBody.remark,
            negotiable: reqBody.negotiable,
            categoryID,
            productDetailID: createProductDetails._id,
            subcategoryID,
            brandID,
            userID: user_id,
        });

        // Update location (case insensitive matching)
        await LocationModel.findOneAndUpdate(
            {
                division: { $regex: new RegExp('^' + reqBody.division + '$', 'i') },
                district: { $regex: new RegExp('^' + reqBody.district + '$', 'i') }
            },
            { $push: { productIds: product._id } },
            { upsert: true, new: true }
        );

        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "fail", data: "product create failed" });
    }
}

exports.getAllProduct = async(req,res) => {
    try{
        let JoinWithBrandStage = {$lookup:{from:'brands', localField:'brandID',foreignField: '_id', as:'brand'}}        
        let JoinWithCategoryStage = { $lookup: { from: 'categories',localField: 'categoryID', foreignField: '_id', as: 'category' }};
        let JoinWithSubCategoryStage = { $lookup: { from: 'subcategories',localField: 'subcategoryID', foreignField: '_id', as: 'subcategory' }};
        let JoinWithProductDetailsStage = { $lookup: { from: 'productdetails',localField: 'productDetailID', foreignField: '_id', as: 'details' }};
        let JoinWithUserStage = { $lookup: { from: 'admins',localField: 'userID', foreignField: '_id', as: 'user' }};


        let UnWindBrandStage = {$unwind:'$brand'}
        let UnwindCategoryStage = {$unwind: '$category'}
        let UnwindSubCategoryStage = {$unwind: '$subcategory'}
        let UnwindproductDetailsStage = {$unwind: '$details'}
        let UnwindproductUserStage = {$unwind: '$user'}

        let ProjectionStage = {$project: {'brand._id':0, 'category._id': 0, 'subcategory._id':0, 'subcategory.categoryID': 0 }}

        let data = await ProductModel.aggregate([
            JoinWithBrandStage,
            JoinWithCategoryStage,
            JoinWithSubCategoryStage,
            JoinWithUserStage,
            JoinWithProductDetailsStage,
            
            UnWindBrandStage,
            UnwindSubCategoryStage,
            UnwindproductDetailsStage,
            UnwindCategoryStage,
            UnwindproductUserStage,
            ProjectionStage
        ])
        res.status(200).json({status:"success",data:data})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}
exports.deleteProduct = async(req,res) => {
    try{
        let productId = req.body.productId
        let productDetailId = req.body.productDetailId
        await ProductModel.deleteOne({_id:productId})
        await ProductDetailsModel.deleteOne({_id: productDetailId})
        res.status(200).json({ status: "success", message: "Product and its details deleted successfully" });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}
exports.getallUser = async(req,res) => {
    try{
        let userCount = await UserModel.find().count()
        let result = await UserModel.find()
        
        res.status(200).json({ status: "success", totalUser: userCount, data: result });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}
exports.removeUser = async(req,res) => {
    try{
        let user_id = req.params.userId
        await UserModel.deleteOne({_id: user_id})
        
        res.status(200).json({ status: "success", message: "User delete successfully" });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.getAllReport = async(req,res) => {
    try{
      
        let result = await ReportsModel.find()

        res.status(200).json({ status: "success", data: result });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.getReportById = async(req,res) => {
    try{
        let productId = req.params.productId
        let MatchProductStage = {$match: {productID: productId}}

        let JoinWithUserStage = { $lookup: { from: 'users',localField: 'userID', foreignField: '_id', as: 'user' }};
        let UnwindUserStage = {$unwind: '$user'}

        let result = await ReportsModel.aggregate([
            MatchProductStage,
            JoinWithUserStage,
            UnwindUserStage
        ])
        res.status(200).json({ status: "success", data: result });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

///location set

exports.AddLocation = async(req,res) => {
    try{
        let reqBody = req.body
        let result = await LocationModel.create(reqBody)
        // write all code how to add location
        res.status(200).json({ status: "success", data: result });
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.removeLocation = async(req,res) => {
    try{
        let LocId = new ObjectId(req.params.locId)

         await LocationModel.deleteOne({_id: LocId})

        res.status(200).json({ status: "success", data: "Location Delete Successfully" });
    }catch(err){
        res.status(400).json({ status: "fail", message: err.toString() });

    }
}
