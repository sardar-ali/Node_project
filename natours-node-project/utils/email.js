const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: option?.email,
        subject: option?.subject,
        text: option?.message
    }

    await transport.sendMail(mailOptions)
}

module.exports = sendEmail;