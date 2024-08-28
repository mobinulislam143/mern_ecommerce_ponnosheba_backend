const fs = require('fs');
const nodemailer = require('nodemailer');
require("dotenv").config();
let pass = process.env.SMTP_PASS;
let smtpTransport = require("nodemailer-smtp-transport");

const EmailSend = async (EmailTo, templateVars, EmailSubject) => {

    let transporter = nodemailer.createTransport(
        smtpTransport({
            service: "Gmail",
            auth: {
                user: "mobinulislammahi@gmail.com",
                pass: pass
            },
        })
    );

    // Read the HTML template
    let emailTemplate = fs.readFileSync('./EmailTemplate.html', 'utf-8');
    
    // Replace placeholders with actual values
    let htmlContent = emailTemplate
        .replace(/{{firstName}}/g, templateVars.firstName)
        .replace(/{{verificationCode}}/g, templateVars.verificationCode)
        .replace(/{{year}}/g, new Date().getFullYear());

    let mailOptions = {
        from: 'E-commerce Solution <mobinulislammahi@gmail.com>',
        to: EmailTo,
        subject: EmailSubject,
        html: htmlContent,
    }
    return await transporter.sendMail(mailOptions);
}

module.exports = EmailSend;
