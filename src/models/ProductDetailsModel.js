const mongoose = require('mongoose')

const DataSchema = mongoose.Schema({
    img1:{type:String, required:true},
    img2:{type:String, required:true},
    img3:{type:String, required:true},
    img4:{type:String, required:true},
    img5:{type:String},
    img6:{type:String},
    color:{type:String, required:true},
    size:{type:String},
    model:{type:String},
    features:{type:String},
    age:{type:String},
    edition:{type:String},
    material:{type:String},
    style:{type:String},


},{timestamps: true, versionKey: false}
)

const ProductDetailModel = mongoose.model('productdetails', DataSchema)

module.exports = ProductDetailModel