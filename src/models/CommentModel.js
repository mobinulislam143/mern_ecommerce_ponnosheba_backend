
const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
        productID:{type:mongoose.Schema.Types.ObjectId,required:true},
        userID:{type:mongoose.Schema.Types.ObjectId,required:true},        
        message:{type:String,required:true}
    },
    {timestamps:true,versionKey:false}
)
const CommentModel=mongoose.model('comments',DataSchema)
module.exports=CommentModel