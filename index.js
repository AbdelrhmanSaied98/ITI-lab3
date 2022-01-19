const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const userRouter = require('./routers/usersRouter')

app.use(bodyParser.json())
app.use('/users',userRouter)
/*
Create Route For users 

Bonus
Edit patch end point to handle the sent data only
If age is not sent return all users

*/






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