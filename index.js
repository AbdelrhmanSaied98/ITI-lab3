const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const userRouter = require('./routers/usersRouter')
const {logRequest} = require('./generalHelpers')
const { v4: uuidv4 } = require("uuid");
const {validateUser} = require('./userHelpers')

app.use(bodyParser.json())
/*
Create Route For users 

Bonus
Edit patch end point to handle the sent data only
If age is not sent return all users

*/

//Create new User

app.post("/users", validateUser, async (req, res, next) => {
  try {
      const { username, age, password } = req.body;
      const data = await fs.promises
          .readFile("./user.json", { encoding: "utf8" })
          .then((data) => JSON.parse(data));
      const id = uuidv4();
      data.push({ id, username, age, password });
      await fs.promises.writeFile("./user.json", JSON.stringify(data), {
          encoding: "utf8",
      });
      res.send({ id, message: "sucess" });
  } catch (error) {
      next({ status: 500, internalMessage: error.message });
  }
});

//Log in user
app.post("/users/login",async (req, res, next) => {
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
app.patch("/users/:userId", validateUser, async (req, res, next) => {
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
        return {username, age,password,"id":user.id}
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
app.get('/users', async (req,res,next)=>{
  try {
  const age = Number(req.query.age)
  const users = await fs.promises
  .readFile("./user.json", { encoding: "utf8" })
  .then((data) => JSON.parse(data));
  const filteredUsers = users.filter(user=>user.age===age)
  res.send(filteredUsers)
  } catch (error) {
  next({ status: 500, internalMessage: error.message });
  }

})

//get all user depending on ID
app.get('/users/:userId', async (req,res,next)=>{
  try {
  const users = await fs.promises
  .readFile("./user.json", { encoding: "utf8" })
  .then((data) => JSON.parse(data));
  let isUser = false;
  const filteredUsers = users.filter(user=>{
    if(user.id===req.params.userId)
    {
      isUser = true
    }
  })
  if(isUser)
  {
    res.status(200).send(filteredUsers)
  }else
  {
    next({ status: 403, message: "ID isnt valid" });
  }
  
  } catch (error) {
    next({ status: 500, internalMessage: error.message });
  }

})

//Delete users
app.delete('/users/:userId', async (req,res,next)=>{
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


//Error handeler
app.use((err,req,res,next)=>{
  if(err.status >= 500)
  {
    res.status(err.status).send("Error in the system")
  }else
  {
    res.status(err.status).send(err.message)
  }

})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})