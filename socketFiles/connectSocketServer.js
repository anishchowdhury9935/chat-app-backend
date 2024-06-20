const socketEvents = require("../socketFiles/socketEvents");
const { Server } = require('socket.io');
const ServerIo =  (server) => {
	const io = new Server(server,{
        cors:"*",
    });
	return io;
}
const connectSocketServer = async (server) => {
	const io = await ServerIo(server); // socket.io server function
	return socketEvents(io);
};
module.exports = connectSocketServer;
