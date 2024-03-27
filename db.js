const mongoose = require('mongoose');
const host_url ='mongodb://127.0.0.1:27017/whatsapp_database';
// const host_url ='mongodb+srv://anish:anish9935@cluster1.qcwsrsy.mongodb.net/?retryWrites=true&w=majority"';

const connectToMongo = ()=>{
    mongoose.connect(host_url).then(()=>{
        console.log('connected to mongoose ✅');
    }).catch(()=>{
        console.log('error connecting to mongoose❌');
    })
}
module.exports = connectToMongo;