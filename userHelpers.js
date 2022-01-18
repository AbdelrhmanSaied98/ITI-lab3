const fs = require('fs')
// some
// find
const validateUser = async (req, res, next) =>{
    try {
        const {username , password} = req.body;
        if(!username) return next({status:422, message:"username is requird"})
        if(!password) return next({status:422, message:"password is requird"})
        const data = await fs.promises.readFile('./user.json',{encoding:'utf8'})
        const users = JSON.parse(data)
        const isUsernameExists = users.some(user=>user.username===username)
        const [,,rootName] = req.url.split('/');
        if(isUsernameExists && req.method == "POST" && !rootName) return next({status:422, message:"username is used"})
        if(isUsernameExists)
        {
            return next()
        }else
        {
            return next({status:403, message:"Not in our users"})
        }
        next()
    } catch (error) {
        next({status:500, internalMessage:error.message})
    }
}

module.exports = {
    validateUser
}