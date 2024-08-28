
const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
        productID:{type:mongoose.Schema.Types.ObjectId,required:true},
        userID:{type:mongoose.Schema.Types.ObjectId,required:true},        
        reason:{type:String,required:true},
        message:{type:String,required:true}
    },
    {timestamps:true,versionKey:false}
)
const ReportsModel=mongoose.model('reports',DataSchema)
module.exports=ReportsModel