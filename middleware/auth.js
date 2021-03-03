const { User } = require('../models/user-model')
const jwt = require('jsonwebtoken')

require('dotenv').config()

exports.checkToken = async (req, res, next) => {
    try {
        if (req.headers['myToken']) {
            const token = req.headers['myToken']
            const { id, email, exp} = jwt.verify(token, process.env.DB_SECRET)
            res.locals.userData = await User.findOne({_id: id})
            console.log(id, email, exp);
            next()
        } else {
            next()
        }
    } catch (error){
        return res.status(401).json({message:'Token is invalid', errors: error})
    }
}

exports.checkUserID = (req, res, next) => {
    try {
        const user = res.locals.userData;
        if (!user){
            return res.status(401).json({message: 'User not found'})
        }
        req.user = user
        next()
    } catch (error){
        next()
    }
}