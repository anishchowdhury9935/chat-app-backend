const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 5000;
const connectToMongo = require("./db") 
const { createServer } = require('node:http');
const server = createServer(app);
const connectSocketServer = require('./socketFiles/connectSocketServer');
const chatData = require('./routes/chat/chatData');
const cors = require('cors'); 

app.use(cors()); 
app.use(express.json())  
connectSocketServer(server); // socket server
connectToMongo() // connect to MongoDB


app.use("/users/auth",require("./routes/authentication/auth")); // auth routes for authentication
app.use("/users/auth/otp",require("./routes/authentication/otp")); // OTP routes for authentication
app.use("/users/detail",require("./routes/userDetails/userProfile")); // user details
app.use("/users/detail",require("./routes/userDetails/userFriend")); // user friend details
app.use("/users/chat",chatData.router); // chat api




server.listen(port,() => {
    console.log(`inotebook backend listening on port:${port}`)
}) 

