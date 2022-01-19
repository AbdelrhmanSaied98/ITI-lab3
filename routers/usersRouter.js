require('dotenv').config()
const { validateUser } = require("../userHelpers");
const express = require("express");
var jwt = require('jsonwebtoken');
const serverConfig = require('./serverConfig')
const { auth } = require('./middlewares/auth')
const User = require('./models/User')
require('./mongoConnect')
const router = express.Router();


//Create new User
router.post("/", validateUser, async (req, res, next) => {
    try {
        const { username, age, password } = req.body;
        const user = new User({username, age, password})
      await user.save()
        res.send({ id, message: "sucess" });
    } catch (error) {
        next({ status: 500, internalMessage: error.message });
    }
  });
  
  //Log in user
  router.post("/login",async (req, res, next) => {
    const { username, password } = req.body;
    if(!username) return next({status:422, message:"username is requird"})
    if(!password) return next({status:422, message:"password is requird"})
    try {
      const users = await fs.promises
      .readFile("./user.json", { encoding: "utf8" })
      .then((data) => JSON.parse(data));
      const isUser = users.some(user=>user.username===username && user.password ===password)
      if(isUser)
      {
        res.status(200).send({message: "you are with us"});
      }else
      {
        next({status:403, message:"you are not with us"})
      }
      } catch (error) {
      next({ status: 500, internalMessage: error.message });
      }
  });
  
  //Update user data
  router.patch("/:userId", validateUser, async (req, res, next) => {
    const { username, age, password } = req.body;
    try
    {
      const data = await fs.promises
          .readFile("./user.json", { encoding: "utf8" })
          .then((data) => JSON.parse(data));
      let isUser = false
      let newDate = data.map((user)=>{
        if(user.id != req.params.userId)
        {
            return user
        }else
        {
            isUser = true;
            let newObject = 
            {
                id:user.id,
                username:"",
                age:0,
                password:""
            };
            if(typeof username == 'undefined')
            {
                newObject.username = user.username
            }else
            {
                newObject.username = username
            }

            if(typeof age == 'undefined')
            {
                newObject.age = user.age
            }else
            {
                newObject.age = age
            }

            if(typeof password == 'undefined')
            {
                newObject.password = user.password
            }else
            {
                newObject.password = password
            }
            return newObject
        }
      });
      if(isUser)
      {
        await fs.promises.writeFile("./user.json", JSON.stringify(newDate), {
          encoding: "utf8",
        });
        res.send({message: "sucess" });
      }else
      {
        next({ status: 403, message: "ID isnt valid" });
      }
  
    }catch(error)
    {
      next({ status: 500, internalMessage: error.message });
    }
  });
  
  //get all user depending on age
  router.get('/', async (req,res,next)=>{
    try {
    if(typeof req.query.age == 'undefined')
    {
      const users = await fs.promises
      .readFile("./user.json", { encoding: "utf8" })
      .then((data) => JSON.parse(data));
      res.send(users)
    }else
    {
      const age = Number(req.query.age)
      const users = await fs.promises
      .readFile("./user.json", { encoding: "utf8" })
      .then((data) => JSON.parse(data));
      const filteredUsers = users.filter(user=>user.age===age)
      res.send(filteredUsers)
    }
    
    } catch (error) {
    next({ status: 500, internalMessage: error.message });
    }
  
  })
  
  //get all user depending on ID
  router.get('/:userId', async (req,res,next)=>{
    try {
    const users = await fs.promises
    .readFile("./user.json", { encoding: "utf8" })
    .then((data) => JSON.parse(data));
    let isUser = false;
    const filteredUsers = users.filter(user=>{
      if(user.id===req.params.userId)
      {
        isUser = true
        return user
      }
    })
    if(isUser)
    {
      res.status(200).send(filteredUsers)
    }else
    {
      next({ status: 404, message: "ID isnt valid" });
    }
    
    } catch (error) {
      next({ status: 500, internalMessage: error.message });
    }
  
  })
  
  //Delete users
  router.delete('/:userId', async (req,res,next)=>{
    try {
    const users = await fs.promises
    .readFile("./user.json", { encoding: "utf8" })
    .then((data) => JSON.parse(data));
    let isUser = false
    const filteredUsers = users.filter(user=>{
      if(user.id != req.params.userId)
      {
        return user
      }else
      {
        isUser = true
      }
    })
    if(isUser)
    {
      await fs.promises.writeFile("./user.json", JSON.stringify(filteredUsers), {
        encoding: "utf8",
      });
      res.status(200).send("Done delete")
    }else
    {
      next({ status: 404, message: "ID isnt valid" });
    }
    
    } catch (error) {
      next({ status: 500, internalMessage: error.message });
    }
  
  })







module.exports = router;
