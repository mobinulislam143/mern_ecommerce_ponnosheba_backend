const LocationModel = require('../models/LocationModel')

exports.getdistricts = async(req,res)=>{
    try{
        let division = req.params.division
        let regex = new RegExp(division, 'i')
        let result = await LocationModel.find({division:regex})
        res.status(200).json({status: "success", data: result})
    }catch(err){
        res.status(400).json({status:"fail",data:err.toString()})

    }
}
exports.getdivision = async (req, res) => {
    try {
        // Fetch all locations
        let locations = await LocationModel.find();


        // Extract unique divisions
        let uniqueDivisions = {};
       locations.forEach(location => {
        if(!uniqueDivisions[location.division]){
            uniqueDivisions[location.division] = location
        }
       })
       let uniqueDivisionsArray = Object.values(uniqueDivisions)
        // Send the response with unique divisions
        res.status(200).json({ status: "success", data: uniqueDivisionsArray });
    } catch (err) {
        // Handle any errors that occur and send an error response
        res.status(400).json({ status: "fail", data: err.toString() });
    }
};


exports.ProductByDivision = async (req, res) => {
    try {
        let division = req.params.division;

        let searchQuery = {
            division: { $regex: new RegExp(division, "i") },
            productIds: { $exists: true, $ne: [] }
        };

        let matchStage = { $match: searchQuery };
        let unwindProductStage = { $unwind: "$productIds" };
        let joinProductStage = {
            $lookup: {
                from: "products",
                localField: "productIds",
                foreignField: "_id",
                as: "product"
            }
        };
        let unwindProductDetailsStage = { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } };
        let joinProductDetailsStage = {
            $lookup: {
                from: "productdetails",
                localField: "product.productDetailID",
                foreignField: "_id",
                as: "details"
            }
        };
        let unwindProductDetailsAgainStage = { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } };
        let groupStage = {
            $group: {
                _id: "$_id",
                division: { $first: "$division" },
                district: { $first: "$district" },
                productIds: { $push: "$productIds" },
                product: { $push: "$product" },
                details: { $push: "$details" }
            }
        };
        let unwindProductArrayStage = { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } };
        let projectStage = {
            $project: {
                division: 1,
                district: 1,
                productIds: 1,
                product: {
                    _id: "$product._id",
                    title: "$product.title",
                    shortDes: "$product.shortDes",
                    price: "$product.price",
                    remark: "$product.remark",
                    categoryID: "$product.categoryID",
                    subcategoryID: "$product.subcategoryID",
                    brandID: "$product.brandID",
                    productDetailID: "$product.productDetailID",
                    userID: "$product.userID",
                    createdAt: "$product.createdAt",
                    updatedAt: "$product.updatedAt",
                    details: {
                        _id: "$details._id",
                        img1: "$details.img1",
                        img2: "$details.img2",
                        img3: "$details.img3",
                        img4: "$details.img4",
                        img5: "$details.img5",
                        img6: "$details.img6",
                        color: "$details.color",
                        model: "$details.model",
                        age: "$details.age",
                      
                    }
                }
            }
        };

        let data = await LocationModel.aggregate([
            matchStage,
            unwindProductStage,
            joinProductStage,
            unwindProductDetailsStage,
            joinProductDetailsStage,
            unwindProductDetailsAgainStage,
            groupStage,
            unwindProductArrayStage,
            projectStage
        ]);

        if (data.length === 0) {
            return res.status(404).json({ status: "fail", message: "No data found for the specified division." });
        }

        res.status(200).json({ status: "success", data: data });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
exports.ProductByDistrict = async (req, res) => {
    try {
        let district = req.params.district;

        let searchQuery = {
            district: { $regex: new RegExp(district, "i") },
            productIds: { $exists: true, $ne: [] }
        };

        let matchStage = { $match: searchQuery };
        let unwindProductStage = { $unwind: "$productIds" };
        let joinProductStage = {
            $lookup: {
                from: "products",
                localField: "productIds",
                foreignField: "_id",
                as: "product"
            }
        };
        let unwindProductDetailsStage = { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } };
        let joinProductDetailsStage = {
            $lookup: {
                from: "productdetails",
                localField: "product.productDetailID",
                foreignField: "_id",
                as: "details"
            }
        };
        let unwindProductDetailsAgainStage = { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } };
        let groupStage = {
            $group: {
                _id: "$_id",
                division: { $first: "$division" },
                district: { $first: "$district" },
                productIds: { $push: "$productIds" },
                product: { $push: "$product" },
                details: { $push: "$details" }
            }
        };
        let unwindProductArrayStage = { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } };
        let projectStage = {
            $project: {
                division: 1,
                district: 1,
                productIds: 1,
                product: {
                    _id: "$product._id",
                    title: "$product.title",
                    shortDes: "$product.shortDes",
                    price: "$product.price",
                    remark: "$product.remark",
                    categoryID: "$product.categoryID",
                    subcategoryID: "$product.subcategoryID",
                    brandID: "$product.brandID",
                    productDetailID: "$product.productDetailID",
                    userID: "$product.userID",
                    createdAt: "$product.createdAt",
                    updatedAt: "$product.updatedAt",
                    details: {
                        _id: "$details._id",
                        img1: "$details.img1",
                        img2: "$details.img2",
                        img3: "$details.img3",
                        img4: "$details.img4",
                        img5: "$details.img5",
                        img6: "$details.img6",
                        color: "$details.color",
                        model: "$details.model",
                        age: "$details.age",
                      
                    }
                }
            }
        };

        let data = await LocationModel.aggregate([
            matchStage,
            unwindProductStage,
            joinProductStage,
            unwindProductDetailsStage,
            joinProductDetailsStage,
            unwindProductDetailsAgainStage,
            groupStage,
            unwindProductArrayStage,
            projectStage
        ]);

        if (data.length === 0) {
            return res.status(404).json({ status: "fail", message: "No data found for the specified division." });
        }

        res.status(200).json({ status: "success", data: data });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};