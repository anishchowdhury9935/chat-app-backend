const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
    host: process.env.REACT_APP_HOST_NAME,
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.REACT_APP_USER_NAME,
        pass: process.env.REACT_APP_USER_PASS,
    },
});

async function mailSender(email, text, body) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `${process.env.REACT_APP_USER_NAME}`, // sender address
        to: email, // list of receivers
        text: text, // plain text body
        html: body, // html body
        subject:'This is the otp from scribble chat'
    });
};
module.exports =  mailSender;