const nodemailer = require('nodemailer')
const fs = require('fs');
const registrationTemplate = fs.readFileSync("service/emailTemplates/registration1.html","utf8");
const resetPassTemplate =    fs.readFileSync("service/emailTemplates/resetPass.html","utf8");
class MailService{
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            sequre: 'ssl',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        })
    }
    async sendActivationMail(to,link,isGoodUser) {
        console.log('Activation email send to', to)
        let info ={
            good: 'Please confirm your email to activate account. Upon activation, you will receive 10 points for free.',
            bad:  'Please confirm your email to activate account. But we can\'t add the free points to it because it looks like you already have another account. Please buy points on your profile page after activation.',
            other: 'Please confirm your email to activate account. You can add points on your profile page after activation.',
        }

        let html = registrationTemplate.replace('###link###',link)
        if(isGoodUser) html = html.replace('###text###',info.other)
        else html = html.replace('###text###',info.other)
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Web2UA account activation`,
            text: `Thank you for registering with Web2UA.
                Please activate your account.
                ${link}`,
            html: html
        })
    }
    async sendResetPassMail(to,link) {
        console.log('Reset pass email send to', to)
        let info ={
            good: '',
            bad:  '',
            other: 'Someone has requested a password reset for your account. If it wasn\'t you, just ignore this letter.\n' +
                'If it was you - follow the link to reset your password',
        }

        let html = resetPassTemplate.replace('###link###',link)
        //if(isGoodUser) html = html.replace('###text###',info.other)
        //else
        html = html.replace('###text###',info.other)
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Web2UA reset password`,
            text: `To reset your password on Web2UA please follow link 
            ${link}`,
            html: html
        })
    }
}
/*
                <div>
                    <h1>Thank you for registering with Cells</h1>
                    <p>Please activate your account.</p>
                    <a href="${link}">Activate</a>
                </div>

 */
module.exports = new MailService()