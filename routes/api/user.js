const express = require('express')
const router = express.Router()
const { checkUserID } = require('../../middleware/auth')
const { grantAccess } = require('../../middleware/roles')

require('dotenv').config()

const { User } = require('../../models/user-model')

router.route('/register')
    .post(async (req, res)=>{
        try{
            ///checking email
            if (await User.emailTaken(req.body.email)){
                return res.status(400).json({message:'Email already existed!!!'})
            }

            ///create User model
            const user = new User({
                email: req.body.email,
                password: req.body.password
            })

            ///generate token
            const token = user.generateToken()
            const doc = await user.save()

            res.cookie('myToken', token).status(200).send(getUserInfo(doc))
        } catch (error){
            res.status(400).json({message:'Error',error: error})
        }
    })

router.route('/signin')
    .post(async (req, res)=>{
        try {
            
            //find user
            let user = await User.findOne({email: req.body.email})

            if (!user) {
                return res.status(400).json({message:"Email doesn't exist"})
            }

            //check password
            const checkPasswordResult = await user.checkPassword(req.body.password)
            if (!checkPasswordResult) {
                return res.status(400).json({message: "Incorrect password"})
            }

            //generate token
            const token = user.generateToken()


            res.cookie('myToken',token).status(200).send(getUserInfo(user))

        } catch (error){
            res.status(400).json({message:'Error',error: error})
        }
    })

router.route('/profile')
    // .get(checkUserID,grantAccess('action','resource') ,async (req, res)=>{
    .get(checkUserID,grantAccess('readOwn','profile') ,async (req, res)=>{
        try {
            // console.log(req.user);
            const permission = res.locals.permission
            const user = await User.findById({_id: req.user.id})
            if (!user) return res.status(400).json({message: 'User not found !!!'})
            // res.status(200).json(getUserInfo(user))
            res.status(200).json(permission.filter(user._doc))
        } catch (error){
            return res.status(400).send(error)
        }
    })
    .patch(checkUserID, grantAccess('updateOwn','profile'), async(req, res)=>{
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    "$set":{
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        age: req.body.age
                    }
                },
                { new: true}
                )
            
            if (!user) return res.status(400).json({message: 'User not found'})

            res.status(200).json(getUserInfo(user))
        } catch (error){
            return res.status(400).send(error)
        }
    })

router.route('/isAuth')
    .get(checkUserID, async (req, res)=>{
        res.status(200).send(getUserInfo(req.user))
    })

router.route("/update_email")
    .patch(checkUserID, grantAccess('updateOwn','profile'), async (req, res)=>{
        try {
            if (await User.emailTaken(req.body.newEmail)){
                return res.status(400).json({message:'Email already existed !!!'})
            }

            const user = await User.findOneAndUpdate(
                { _id : req.user._id, email: req.body.oldEmail},
                {
                    "$set": {
                        email: req.body.newEmail
                    }
                }, 
                { new: true}
            )

            if (!user) return res.status(400).json({message:'User not found'})

            const token = user.generateToken()
            res.cookie('x-access-token', token).status(200).send({email: user.email})

        } catch (error){
            res.status(400).send(error)
        }
    })

const getUserInfo = (user) => {
    return {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        age: user.age,
        date: user.date,
        role: user.role,
    }
}
module.exports = router
