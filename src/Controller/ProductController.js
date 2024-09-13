const ProductModel = require('../models/ProductModel')
const CategoryModel = require('../models/CategoryModel')
const SubCategoryModel = require('../models/SubCategoryModel')
const ProductDetailsModel = require('../models/ProductDetailsModel')
const LocationModel = require('../models/LocationModel')
const cloudinary = require('cloudinary').v2
const mongoose  = require('mongoose')
const BrandModel = require('../models/BrandsModel')
const ObjectId = mongoose.Types.ObjectId

exports.createProduct = async (req, res) => {
    try {
        const user_id = new ObjectId(req.headers.user_id);
        const reqBody = req.body;
        const uploadedImages = req.files;

        if (!uploadedImages || Object.keys(uploadedImages).length === 0) {
            return res.status(400).json({ status: "fail", data: "No images uploaded" });
        }

        const imageURLs = [];
        for (const image of uploadedImages) {
           try{
                const result = await cloudinary.uploader.upload(image.path);
                imageURLs.push(result.secure_url);
           }catch(e){
                console.error("Image upload failed:", e);
                return res.status(500).json({ status: "fail", message: "Image upload failed" });
           }
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
            material: reqBody.material,
            style: reqBody.style
        };

        const createProductDetails = await ProductDetailsModel.create(productDetails);
        
        const findCategory = async (categoryName) => {
            return await CategoryModel.findOne({ categoryName: { $regex: new RegExp('^' + categoryName + '$', 'i') } });
        };

        const findSubCategory = async (subCategoryName) => {
            return await SubCategoryModel.findOne({ subCategoryName: { $regex: new RegExp('^' + subCategoryName + '$', 'i') } });
        };

        const findBrand = async (brandName) => {
            return await BrandModel.findOne({ brandName: { $regex: new RegExp('^' + brandName + '$', 'i') } });
        };

        const [category, subcategory, brand] = await Promise.all([
            findCategory(reqBody.categoryName),
            findSubCategory(reqBody.subCategoryName),
            findBrand(reqBody.brandName)
        ]);

    
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
            categoryID: category ? category._id : null,
            productDetailID: createProductDetails._id,
            subcategoryID: subcategory ? subcategory._id : null,
            brandID: brand ? brand._id : null,
            userID: user_id,
        });

        
        // Update location (case insensitive matching)
        await LocationModel.findOneAndUpdate(
            {
                division: { $regex: new RegExp('^' + reqBody.division + '$', 'i') },
                district: { $regex: new RegExp('^' + reqBody.district + '$', 'i') }
            },
            { $push: { productIds: new ObjectId(product._id )} },
            { upsert: true, new: true }
        )
        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "fail", data: "product create failed" });
    }
}



exports.getAllBrand = async (req, res) => {
    try {
        let productCount = {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'brandID',
                as: 'products'
            }
        };
        let projectStage = {$project: {_id: 1, brandName: 1,  productCount: {$size: '$products'}}}
        let result = await BrandModel.aggregate([
            productCount,
            projectStage
        ]);

        res.status(200).json({ status: "success", data: result });
    } catch (err) {
        res.status(400).json({ status: "fail", data: err.toString() });
    }
};

exports.getAllCategory = async (req, res) => {
    try {
        let productCount = {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'categoryID',
                as: 'products'
            }
        };
        let projectStage = {$project: {_id: 1, categoryName: 1, categoryImg: 1, productCount: {$size: '$products'}}}
        let result = await CategoryModel.aggregate([
            productCount,
            projectStage
        ]);
        res.status(200).json({ status: "success", data: result });
    } catch (err) {
        res.status(400).json({ status: "fail", data: err.toString() });
    }
};
exports.getSubCategory = async (req, res) => {
    try {
        let CategoryID = new ObjectId(req.params.CategoryId)
        let MatchStage = {$match: {_id: CategoryID}}


        let JoinWithSubCategoryStage = {$lookup: {from:'subcategories', localField:'_id', foreignField: 'categoryID', as:'subCategory'}}

        let UnWindSubCategoryStage = {$unwind: '$subCategory'}
        
        let result = await CategoryModel.aggregate([
            MatchStage,
            JoinWithSubCategoryStage,
            UnWindSubCategoryStage
        ])
        res.status(200).json({ status: "success", data: result });
    } catch (err) {
        res.status(400).json({ status: "fail", data: err.toString() });
    }
};

exports.ProductListByCategory = async(req,res)=>{
    try{
        let CategoryID = new ObjectId(req.params.CategoryId)
        let MatchStage = {$match: {categoryID: CategoryID}}

        let JoinWithBrandStage = {$lookup:{from:'brands',localField:'brandID', foreignField:'_id', as:'brands'}}
        let JoinWithProductDetailsStage = { $lookup: { from: 'productdetails',localField: 'productDetailID', foreignField: '_id', as: 'details' }}

        let JoinWithLocationStage = { $lookup: { from: 'locations', localField: '_id', foreignField: 'productIds', as: 'locations' } };

        let UnwindLocationStage = { $unwind: { path: '$locations', preserveNullAndEmptyArrays: true } };


        let JoinWithCategoryStage = {$lookup:{from:'categories',localField:'categoryID', foreignField:'_id', as:'categorys'}}

        
        let UnWindBrandStage = {$unwind:'$brands'}
        let UnwindDetailsStage = {$unwind: '$details'}
        let UnwindCategoryStage = {$unwind: '$categorys'}

        let result= await  ProductModel.aggregate([
            MatchStage,
            JoinWithBrandStage,
            JoinWithCategoryStage,
            JoinWithLocationStage,
            UnWindBrandStage,
            UnwindCategoryStage,
            UnwindLocationStage,
            JoinWithProductDetailsStage,
            UnwindDetailsStage
        ])
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data: err.toString()})
    }
}



exports.usersProduct = async(req,res)=>{
    try{
        const user_id = new ObjectId(req.headers.user_id);
        let MatchStage = {$match: {userID: user_id}}

        let JoinWithProductDetailsStage = { $lookup: { from: 'productdetails',localField: 'productDetailID', foreignField: '_id', as: 'details' }};
        
        let UnwindproductDetailsStage = {$unwind: '$details'}

        let result = await ProductModel.aggregate([
            MatchStage,
            JoinWithProductDetailsStage,
            UnwindproductDetailsStage

        ])
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}


exports.productDetailsById = async(req,res)=>{
    try{
        let productId = new ObjectId(req.params.productId);
        let MatchProductStage = { $match: { _id: productId } };
        
        let JoinWithBrandStage = {$lookup:{from:'brands', localField:'brandID',foreignField: '_id', as:'brand'}}        
        let JoinWithCategoryStage = { $lookup: { from: 'categories',localField: 'categoryID', foreignField: '_id', as: 'category' }};
        let JoinWithSubCategoryStage = { $lookup: { from: 'subcategories',localField: 'subcategoryID', foreignField: '_id', as: 'subcategory' }};
        let JoinWithProductDetailsStage = { $lookup: { from: 'productdetails',localField: 'productDetailID', foreignField: '_id', as: 'details' }};
        let JoinWithUserStage = { $lookup: { from: 'users',localField: 'userID', foreignField: '_id', as: 'user' }};
        let JoinWithLocationStage = { $lookup: { from: 'locations', localField: '_id', foreignField: 'productIds', as: 'locations' } };

        let AddFieldStage = {
            $addFields: {
              createdAt: {
                $dateToString: {
                  date: "$createdAt",
                  format: "%d-%m-%Y %H:%M:%S",
                },
              },
              "user.createdAt": {
                $dateToString: {
                  date: "$user.createdAt",
                  format: "%d-%m-%Y", 
                },
              },
            },
          };


        let UnWindBrandStage = {$unwind:'$brand'}
        let UnwindCategoryStage = {$unwind: '$category'}
        let UnwindSubCategoryStage = {$unwind: '$subcategory'}
        let UnwindDetailsStage = {$unwind: '$details'}
        let UnwindUserStage = {$unwind: '$user'}
        let UnwindLocationStage = { $unwind: { path: '$locations', preserveNullAndEmptyArrays: true } };

        

        let ProjectionStage = {$project: {'brand._id':0, 'category._id': 0, 'subcategory.categoryID': 0 , 'user._id':0, 'subcategory._id': 0, 'category.createdAt': 0, 'category.updatedAt': 0, 'details.updatedAt': 0, 'details.createdAt': 0, 'user.updatedAt': 0, }}

        let data = await ProductModel.aggregate([
            MatchProductStage,
            JoinWithBrandStage,
            JoinWithCategoryStage,
            JoinWithSubCategoryStage,
            JoinWithProductDetailsStage,
            JoinWithUserStage,
            JoinWithLocationStage,
            
            UnWindBrandStage,
            UnwindCategoryStage,
            UnwindSubCategoryStage,
            UnwindDetailsStage,
            UnwindUserStage,
            UnwindLocationStage,
            AddFieldStage,
            ProjectionStage
        ])
        res.status(200).json({status: "success", data: data})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}

exports.deleteUserproduct = async(req,res)=>{
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
// product Searching
exports.searchProductbyKeyword = async(req,res)=>{
    try{
        let SearchRegex = {$regex: req.params.keyword, "$options": 'i'}
        let SearchParams = [{title: SearchRegex}, {shortDes: SearchRegex}]
        let SearchQuery = {$or: SearchParams}
        let MatchStage = {$match: SearchQuery}

        let JoinWithBrandStage = {$lookup:{from:'brands', localField:'brandID',foreignField: '_id', as:'brand'}}        
        let JoinWithCategoryStage = { $lookup: { from: 'categories',localField: 'categoryID', foreignField: '_id', as: 'category' }};
        let JoinWithSubCategoryStage = { $lookup: { from: 'subcategories',localField: 'subcategoryID', foreignField: '_id', as: 'subcategory' }};
        let JoinWithProductDetailsStage = { $lookup: { from: 'productdetails',localField: 'productDetailID', foreignField: '_id', as: 'details' }};


        let UnWindBrandStage = {$unwind:'$brand'}
        let UnwindCategoryStage = {$unwind: '$category'}
        let UnwindSubCategoryStage = {$unwind: '$subcategory'}
        let UnwindDetailsStage = {$unwind: '$details'}

        let ProjectionStage = {$project: {'brand._id':0, 'category._id': 0, 'subcategory.categoryID': 0 , 'user._id':0, 'subcategory._id': 0, 'category.createdAt': 0, 'category.updatedAt': 0, 'details.updatedAt': 0, 'details.createdAt': 0, }}

        let data = await ProductModel.aggregate([
            MatchStage,
            JoinWithBrandStage,
            JoinWithCategoryStage,
            JoinWithSubCategoryStage,
            JoinWithProductDetailsStage,
            
            UnWindBrandStage,
            UnwindCategoryStage,
            UnwindSubCategoryStage,
            UnwindDetailsStage,
            ProjectionStage
        ]) 
        res.status(200).json({status: "success", data: data})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}

exports.getAllProduct = async (req, res) => {
    try {
        let JoinWithBrandStage = { $lookup: { from: 'brands', localField: 'brandID', foreignField: '_id', as: 'brand' } };
        let JoinWithCategoryStage = { $lookup: { from: 'categories', localField: 'categoryID', foreignField: '_id', as: 'category' } };
        let JoinWithSubCategoryStage = { $lookup: { from: 'subcategories', localField: 'subcategoryID', foreignField: '_id', as: 'subcategory' } };
        let JoinWithProductDetailsStage = { $lookup: { from: 'productdetails', localField: 'productDetailID', foreignField: '_id', as: 'details' } };
        let JoinWithUserStage = { $lookup: { from: 'users', localField: 'userID', foreignField: '_id', as: 'user' } };
        let JoinWithLocationStage = { $lookup: { from: 'locations', localField: '_id', foreignField: 'productIds', as: 'locations' } };

        let UnWindBrandStage = { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } };
        let UnwindCategoryStage = { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } };
        let UnwindSubCategoryStage = { $unwind: { path: '$subcategory', preserveNullAndEmptyArrays: true } };
        let UnwindproductDetailsStage = { $unwind: { path: '$details', preserveNullAndEmptyArrays: true } };
        let UnwindproductUserStage = { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } };
        let UnwindLocationStage = { $unwind: { path: '$locations', preserveNullAndEmptyArrays: true } };

        let ProjectionStage = { $project: { 'brand._id': 0, 'category._id': 0, 'subcategory._id': 0, 'subcategory.categoryID': 0 , } };

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
        
        let allproduct = await ProductModel.find().count()
        let data = await ProductModel.aggregate([
            JoinWithBrandStage,
            JoinWithCategoryStage,
            JoinWithSubCategoryStage,
            JoinWithUserStage,
            JoinWithProductDetailsStage,
            JoinWithLocationStage,

            UnWindBrandStage,
            UnwindCategoryStage,
            UnwindSubCategoryStage,
            UnwindproductDetailsStage,
            UnwindproductUserStage,
            UnwindLocationStage,
            AddFieldStage,
            ProjectionStage
        ]);

        res.status(200).json({ status: "success", Allproduct: allproduct, data: data });
    } catch (err) {
        res.status(400).json({ status: "fail", data: err.toString() });
    }
}


exports.getdivisions = async(req,res)=>{
    try{
        let result = LocationModel.find()
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}
exports.getdistrictsbyDivision = async(req,res)=>{
    try{
        let division = req.params.division
        let result = LocationModel.find({division: new RegExp(division, "i")})
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}

exports.ProductListByFilter = async (req, res) => {
    try {
        let matchConditions = {};
        if (req.body['categoryID']) {
            matchConditions.categoryID = new ObjectId(req.body['categoryID']);
        }
        if (req.body['subcategoryID']) {
            matchConditions.subcategoryID = new ObjectId(req.body['subcategoryID']);
        }
        if (req.body['brandID']) {
            matchConditions.brandID = new ObjectId(req.body['brandID']);
        }

        let locationMatchCondition = {};
        if (req.body['division']) {
            locationMatchCondition.division = req.body['division'];
        }
        if (req.body['district']) {
            locationMatchCondition.district = req.body['district'];
        }

        let LocationLookupStage = {
            $lookup: {
                from: 'locations',
                let: { productId: "$_id" },
                pipeline: [
                    {
                        $match: locationMatchCondition 
                    },
                    {
                        $match: {
                            $expr: { $in: ["$$productId", "$productIds"] } // Match product IDs
                        }
                    },
                    {
                        $project: { division: 1, district: 1 } // Project only the necessary fields from the location
                    }
                ],
                as: 'location'
            }
        };
        let ExcludeNoLocationStage = {
            $match: {
                location: { $ne: [] } 
            }
        };

        let MatchStage = { $match: matchConditions };

        let AddFieldStage = {
            $addFields: { numericPrice: { $toInt: '$price' } }
        };

        let minPrice = parseInt(req.body['minPrice']);
        let maxPrice = parseInt(req.body['maxPrice']);

        let PriceMatchCondition = {};

        if (!isNaN(minPrice)) {
            PriceMatchCondition['numericPrice'] = { $gte: minPrice };
        }
        if (!isNaN(maxPrice)) {
            PriceMatchCondition['numericPrice'] = { ...(PriceMatchCondition['numericPrice'] || {}), $lte: maxPrice };
        }

        let PriceMatchStage = { $match: PriceMatchCondition };

        let JoinWithBrandStage = { $lookup: { from: "brands", localField: "brandID", foreignField: "_id", as: 'brand' } };
        let JoinWithSubCategoryStage = { $lookup: { from: "subcategories", localField: "subcategoryID", foreignField: "_id", as: 'subCategory' } };
        let JoinWithCategoryStage = { $lookup: { from: 'categories', localField: 'categoryID', foreignField: '_id', as: 'category' } };

        let UnwindBrandStage = { $unwind: "$brand" };
        let UnwindSubCategoryStage = { $unwind: "$subCategory" };
        let UnwindCategoryStage = { $unwind: '$category' };
        let UnwindLocationStage = {
            $unwind: {
                path: '$location',
                preserveNullAndEmptyArrays: true
            }
        };

        let data = await ProductModel.aggregate([
            LocationLookupStage,
            ExcludeNoLocationStage, 
            MatchStage,
            AddFieldStage,
            PriceMatchStage,
            JoinWithBrandStage,
            JoinWithSubCategoryStage,
            JoinWithCategoryStage,
            UnwindLocationStage,
            UnwindCategoryStage,
            UnwindSubCategoryStage,
            UnwindBrandStage
        ]);

        res.status(200).json({ status: "success", data: data });
    } catch (err) {
        res.status(400).json({ status: "fail", data: err.toString() });
    }
};

exports.LocationCategorySearch = async (req, res) => {
    try {
        let division = req.params.division;
        let district = req.params.district;
        let category = req.params.category;

        // Regular expressions for case-insensitive matching
        let divisionRegex = new RegExp(division, 'i');
        let districtRegex = new RegExp(district, 'i');
        let categoryRegex = new RegExp(category, 'i');

        // Match condition using regular expressions
        let locationMatchCondition = {
            $match: {
                division: { $regex: divisionRegex },
                district: { $regex: districtRegex }
            }
        };

        // Pipeline for location lookup
        let locationLookupStage = {
            $lookup: {
                from: 'locations',
                let: { productId: "$_id" },
                pipeline: [
                    locationMatchCondition,
                    {
                        $match: {
                            $expr: { $in: ["$$productId", "$productIds"] }
                        }
                    }
                ],
                as: 'location'
            }
        };

        // Unwind location array
        let unwindLocationStage = {
            $unwind: '$location'
        };
        let categoryMatchCondition = {
            'category.categoryName': { $regex: categoryRegex }
        };

        let categoryLookupStage = {
            $lookup: {
                from: 'categories',
                localField: 'categoryID',
                foreignField: '_id',
                as: 'category'
            }
        };

        let unwindCategoryStage = {
            $unwind: '$category'
        };

        let pipeline = [
            locationLookupStage,
            unwindLocationStage,
            categoryLookupStage,
            unwindCategoryStage,
            { $match: categoryMatchCondition }
        ];

        // Execute the aggregation pipeline
        let result = await ProductModel.aggregate(pipeline);

        res.status(200).json({ status: "success", data: result });
    } catch (err) {
        res.status(400).json({ status: "fail", data: err.toString() });
    }
};

exports.userTotalProduct = async(req,res)=>{
    try{
        let userid = new ObjectId(req.headers.user_id)

        let result = await ProductModel.find({userID: userid}).count()

        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})
    }
}


// exports.AllProduct = async(req,res)=>{
//     try{

//         res.status(200).json({status: "success", data: result})
//     }catch(err){
//         res.status(400).json({status:"fail",data:err.toString()})

//     }
// }