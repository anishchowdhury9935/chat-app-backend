const express = require("express");
const tryCatch = require("../../helpers/trycatch");
const router = express.Router();

const allRoutes = (io) => {
    tryCatch(()=>{io.on('connection',(socket)=>{
        console.log(socket.id);
    })})
    router.get('/', (req, res) => {
        tryCatch(() => {
            return res.status(200).json({ message: 'hello' })
        }, res)
    });
}

module.exports = {router, allRoutes};