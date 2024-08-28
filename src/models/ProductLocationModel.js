
const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
        userID:{type:mongoose.Schema.Types.ObjectId,required:true},
        division:{type:String,required:true},
        district:{type:String,required:true},
        area:{type:String}
    },
    {timestamps:true,versionKey:false}
)
const ProductLocationModel=mongoose.model('productLocations',DataSchema)
module.exports=ProductLocationModel