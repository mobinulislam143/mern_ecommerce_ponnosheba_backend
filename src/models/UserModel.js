
const mongoose=require('mongoose');
const DataSchema=mongoose.Schema({
        email:{type:String,unique:true,required:true},
        firstName:{type:String,required:true},
        lastName:{type:String,required:true},
        age:{type:String,required:true},
        mobile:{type:String,required:true},
        address:{type:String,required:true},
        profileImg:{type:String, default: "https://www.testhouse.net/wp-content/uploads/2021/11/default-avatar.jpg"},
        password:{type:String,required:true},
        confirmPassword:{type:String,required:true},
    },
    {timestamps:true,versionKey:false}
)

const UserModel=mongoose.model('users',DataSchema)
module.exports=UserModel