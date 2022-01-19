require('dotenv').config()
const { validateUser } = require("../userHelpers");
const express = require("express");
var jwt = require('jsonwebtoken');
const serverConfig = require('../serverConfig')
const { auth } = require('../middlewares/auth')
const User = require('../models/User')
require('../mongoConnect')
const router = express.Router();


//Create new User
router.post("/", async (req, res, next) => {
    try {
        const { username, age, password } = req.body;
        const user = new User({username, age, password})
        await user.save()
        res.send({message: "sucess" });
    } catch (error) {
        next({ status: 500, message: error.message });
    }
  });
  
  //Log in user
  router.post("/login",async (req, res, next) => {
    const {username, password} = req.body
    try
    {
      const user = await User.findOne({ username })
      if(!user) return next({status:401, message:"username or passord is incorrect"})
      if(user.password !== password) next({status:401, message:"username or passord is incorrect"})
      const payload = {id:user.id }

      const token = jwt.sign(payload,serverConfig.secret,{expiresIn :"1h"})
      return res.status(200).send({message:"Logged in Successfully",token}) 
    }catch(error)
    {
      next({ status: 500, internalMessage: error.message });
    }
  });
  
  //Update user data
  router.patch("/:userId",auth,async (req, res, next) => {
    if(req.user.id!==req.params.userId) next({status:403, message:"Authorization error"})
    try
    {
      const {password, age} = req.body
      req.user.password = password || req.user.password
      req.user.age = age || req.user.age
      await req.user.save()
      res.send("sucess")
    }catch(error)
    {
      next({ status: 500, internalMessage: error.message });
    }
  });

  //get user document
  router.get('/:userId',auth, async (req,res,next)=>{
    if(req.user.id!==req.params.userId) next({status:403, message:"Authorization error"})
      res.send(req.user)
      
  })
  
  //Delete users
  router.delete('/:userId',auth,async (req,res,next)=>{
    try {
      if(req.user.id!==req.params.userId) next({status:403, message:"Authorization error"})
      await User.findByIdAndDelete(req.user.id)
      res.send("done")
    } catch (error) {
      next({ status: 500, internalMessage: error.message });
    }
  
  })







module.exports = router;
