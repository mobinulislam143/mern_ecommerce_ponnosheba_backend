const jwt = require('jsonwebtoken')

exports.EncodeToken = (email, user_id) =>{
    let Key = "Ramadan_Mobarok_123";
    let EXPIRE = {expiresIn: '24h'}
    let PAYLOAD = {
        email:email,
        user_id:user_id
    }
    return jwt.sign(PAYLOAD, Key, EXPIRE)
}
exports.DecodeToken = (Token) => {
    try{
        let Key = "Ramadan_Mobarok_123";
        return jwt.verify(Token,Key)
    }catch(err){
        return null
    }
}
exports.AdminEncodeToken = (email, user_id) =>{
    let Key = "Admin_Ramadan_Mobarok_123";
    let EXPIRE = {expiresIn: '24h'}
    let PAYLOAD = {
        email:email,
        user_id:user_id
    }
    return jwt.sign(PAYLOAD, Key, EXPIRE)
}
exports.AdminDecodeToken = (Token) => {
    try{
        let Key = "Admin_Ramadan_Mobarok_123";
        return jwt.verify(Token,Key)
    }catch(err){
        return null
    }
}