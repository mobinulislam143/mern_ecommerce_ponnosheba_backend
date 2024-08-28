
const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
        productID:{type:mongoose.Schema.Types.ObjectId,required:true},
        userID:{type:mongoose.Schema.Types.ObjectId,required:true},        
      
    },
    {timestamps:true,versionKey:false}
)
const ReportsModel=mongoose.model('favourites',DataSchema)
module.exports=ReportsModel