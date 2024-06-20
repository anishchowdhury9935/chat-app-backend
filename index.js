const express = require('express'); 
const app = express(); 
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;
const connectToMongo = require("./db");
const { createServer } = require('node:http');
const server = createServer(app);
const connectSocketServer = require('./socketFiles/connectSocketServer');
const cors = require('cors'); 

app.use(cors({origin:"*"})); 
app.use(express.json())  
app.use(express.urlencoded({ extended: false }));  
connectSocketServer(server); // socket server
connectToMongo() // connect to MongoDB
app.use(cookieParser());

app.use("/users/auth",require("./routes/authentication/auth")); 
app.use("/users/auth/otp",require("./routes/authentication/otp")); 
app.use("/users/detail",require("./routes/userDetails/userProfile")); 
app.use("/users/detail",require("./routes/userDetails/userFriend")); 
app.use("/chat",require('./routes/chat/userChat'));
app.use("/notification",require("./routes/notification/notification"));
app.use("/message",require("./routes/chat/message"));
app.use("/search",require('./routes/search.js')); 





app.get('/',(req,res) => {res.status(200).json({msg:"server is running"})});



server.listen(port,() => {
    console.log(`chat app backend listening on port: http://localhost:${port}`)
}) 

