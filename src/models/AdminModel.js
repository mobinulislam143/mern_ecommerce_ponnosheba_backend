const mongoose = require('mongoose')

const DataSchema = mongoose.Schema({
    email:{type:String, required: true},
    password:{type:String, required: true},
    name:{type:String},
    des:{type:String},
    photo:{type:String, default: "https://www.testhouse.net/wp-content/uploads/2021/11/default-avatar.jpg"},
    mobile:{type:String},

    productID:{type:mongoose.Schema.Types.ObjectId},
    brandID:{type:mongoose.Schema.Types.ObjectId},
    categoryID:{type:mongoose.Schema.Types.ObjectId},
    userID:{type:mongoose.Schema.Types.ObjectId},
    reportID:{type:mongoose.Schema.Types.ObjectId},
    subCategoryID:{type:mongoose.Schema.Types.ObjectId},


},{timestamps: true, versionKey: false}
)

const AdminModel = mongoose.model('admins', DataSchema)

module.exports = AdminModel