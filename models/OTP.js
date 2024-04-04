const mongoose = require("mongoose");
require("dotenv").config();
const mailSender = require("../utils/mailsender.js");
const getJwtVerifiedData = require('../helpers/getJwtVerifiedData.js');
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	// Send the email using our custom mailSender Function
	try {
		const mailResponse = await mailSender(
			email,
			"Whatsapp",
			`<div style="font-family: sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; height:"400px";>
            <div
                style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-size: 20px;">Hi there!</h1>
                </div>
                <div style="text-align: center; margin-bottom: 20px;">
                    <p style="font-size: 36px; font-weight: bold; color: #007bff;">Your verification code is:</p>
                    <h2><span
                            style="display: inline-block; width: 100px; border: 1px solid #ddd; padding: 10px; text-align: center;">${otp}</span>
                    </h2>
                </div>
                <div style="font-size: 18px; line-height: 1.5; margin-bottom: 20px;">
                    <p>Enter this code in the app to verify your account.</p>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="text-align: center;">
                    <p>Need help? <a href="#" style="color: #007bff; text-decoration: none;">Contact us</a>.</p>
                </div>
            </div>
        </div>
            `,
		);
	} catch (error) {
		console.log("Error occurred while sending email: ");
	}
}

OTPSchema.pre("save", async function (next) {
	// Only send an email when a new document is created
	if (this.isNew) {
		const data = getJwtVerifiedData(this.otp)
		const { OtpDATA } = data;
		await sendVerificationEmail(this.email, OtpDATA);
	}
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
