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
Create server with the following end points :
POST /users with uuid, unique username 
PATCH /users/id 
GET /users with age filter 
Create Error handler 
POST /users/login /sucess 200 , error:403
GET /users/id   200,   eror:404
DELETE users/id  200,    error:404
complete middleware for validating user
Create Route For users 

Bonus
Edit patch end point to handle the sent data only
If age is not sent return all users

*/

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

app.patch("/users/:userId", validateUser, async (req, res, next) => {
  const { username, age, password } = req.body;
  try
  {
    const data = await fs.promises
        .readFile("./user.json", { encoding: "utf8" })
        .then((data) => JSON.parse(data));
    let newDate = data.map((user)=>{
      if(user.id != req.params.userId)
      {
        return user
      }else
      {
        return {username, age,password,"id":user.id}
      }
    });
    console.log(newDate);
    await fs.promises.writeFile("./user.json", JSON.stringify(newDate), {
        encoding: "utf8",
    });
    res.send({message: "sucess" });

  }catch(error)
  {
    next({ status: 500, internalMessage: error.message });
  }
});


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

app.use((err,req,res,next)=>{
  if(err.status >= 500)
  {
    res.send("Error in system")
  }else
  {
    res.send(err.message)
  }

})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})