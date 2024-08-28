const mongoose = require('mongoose')

const DataSchema = mongoose.Schema({

    title:{type:String, required:true},
    shortDes:{type:String, required:true},
    price:{type:String, required:true},
    discount:{type:Boolean},
    discountPrice:{type:String},
    star:{type:String},
    stock:{type:Boolean},
    remark:{type:String, required:true},
    negotiable: {type: String},
    categoryID:{type:mongoose.Schema.Types.ObjectId,required:true},
    subcategoryID:{type:mongoose.Schema.Types.ObjectId,required:true},
    brandID:{type:mongoose.Schema.Types.ObjectId,required:true},
    productDetailID:{type:mongoose.Schema.Types.ObjectId,required:true},
    userID:{type:mongoose.Schema.Types.ObjectId},

},{timestamps: true, versionKey: false}
)

const ProductModel = mongoose.model('products', DataSchema)

module.exports = ProductModel