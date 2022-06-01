const jwt = require('jsonwebtoken')

module.exports = function(req,res,next){
    if (req.method === 'OPTIONS'){
        next()
    }
    try{
        const token = req.headers.authorization.split(' ')[1]
        console.log('token',token)
        if(!token){
            res.status(200).json({message:'Not authorized1'})
        }
        const decoded = jwt.verify(token,process.env.SECRET_KEY)
        console.log('decoded',decoded)
        req.user = decoded
        next()
    }catch (e) {
        console.log(e)
        res.status(200).json({message:'Not authorized'})
    }
}