const ApiError = require('../error/apiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const {User, Payment,ClientID,ServicePrice} = require('../models/models')
const mailService = require('../service/mail-service')
const fetch = require('node-fetch');

const Products = [
    // {id: 1, price: 1.99,  points:   60,  pointsOld:  30, name: 'Lite',item_number: 'item-1'},
    {id: 1, price: 2.99,  points:   90,  pointsOld:  45, name: 'Lite',item_number: 'item-1'},
    {id: 2, price: 4.99,  points:  200,  pointsOld: 100,name: 'Standard',item_number: 'item-2'},
    {id: 3, price: 9.99,  points:  500,  pointsOld: 250,name: 'Plus',item_number: 'item-3'},
    {id: 4, price: 19.99, points: 1200,  pointsOld: 600,name: 'Large',item_number: 'item-4'},
]

const generateJwt = (id,email,role) => {
    //console.log(id,email,role)
    return jwt.sign(
        {id,email,role},
        process.env.SECRET_KEY,
        {expiresIn: '48h'}
    )
}
const storePayment = async (p) => {
    try{
        if(p.payment_status == 'paid' && p.metadata.seller == 'cells'){
            let userId,productId,product,points
            const email = p.customer_email
            const amount = p.amount_total/100
            const item_number = p.metadata.item_number
            const user = await User.findOne({where: {email}})
            const verification = p.id

            if(user){
                userId = user.id
                if(item_number == 'item-1') productId = 1
                else if(item_number == 'item-2') productId = 2
                else if(item_number == 'item-3') productId = 3
                else if(item_number == 'item-4') productId = 4

                product = Products.find(product => {if(product.id == productId) return product })
                if(product){
                    points = product.points
                    let balance = user.balance + points
                    const payment = await Payment.create({email, amount,item_number,userId,points,verification })
                    if(payment) await User.update({ balance }, {where: {id: userId}})
                }
                else{
                    const payment = await Payment.create({email, amount,item_number,userId,verification })
                }
            }
            else {
                userId = 0
                const payment = await Payment.create({email, amount,userId,verification })
            }
        }
        else console.log('Wrong payment status',p)
    }
    catch(e){
        console.log('error',e)
    }
}

class UserController{
    async registration(req,res,next){
        const {email,password,role} = req.body
        if(!email || !password){
            return next(ApiError.badRequest('Incorrect email or password'))
        }
        const candidate = await User.findOne({where: {email}})
        if(candidate){
            return next(ApiError.badRequest('User with this email already exist'))
        }
        let isGoodUser = true
        //const {_ga} = req.cookies
        /*
        if(_ga){
            const gaCID = await ClientID.findAll({
                where: { gaCID: _ga },
                group: ['userId']
            })
            if(gaCID.length){
                for(let i in gaCID){
                    const previousReg = await User.findOne({where: {id:gaCID[i].userId, isActivated: 1}})
                    if(previousReg) {
                        isGoodUser = false
                        break
                    }
                }
                //return next(ApiError.badRequest('It looks like you already have an account. Please login.'))
            }
        }
        */
        const hashPassword = await bcrypt.hash(password,3)
        const activationLink = uuid.v4()
        let user
        if(isGoodUser){
            user = await User.create({email,role,password:hashPassword,activationLink,balance: 0})
            //await ClientID.create({ gaCID: _ga, userId: user.id,email,seen: 'register' })
        }
        else{
            user = await User.create({email,role,password:hashPassword,activationLink,balance: 0})
        }
        await mailService.sendActivationMail(email,`${process.env.SERVER_DOMAIN}api/user/activation/${activationLink}`,isGoodUser)
        //const basket = await Basket.create({userId:user.id})
        //console.log(user.id,user.email,user.role)
        const token = generateJwt(user.id,user.email,user.role)
        return res.json({token})
    }
    async activate(req,res,next){
        try{
            const activationLink = req.params.link
            console.log('link',activationLink)
            const user = await User.findOne({where: {activationLink}})
            if(!user){
                throw ApiError.badRequest('Invalid activation link')
            }
            user.isActivated = true
            await user.save()
            return res.redirect(process.env.CLIENT_DOMAIN)
        }catch(e){
            next(e)
        }
    }
    async login(req,res,next){
        const {email,password} = req.body
        const user = await User.findOne({where: {email}})
        if(!user){
            return next(ApiError.badRequest('Wrong email or password'))
        }
        let comparePassword = bcrypt.compareSync(password,user.password)
        if(!comparePassword){
            return next(ApiError.badRequest('Wrong password'))
        }
        const token = generateJwt(user.id,user.email,user.role)
        //const {_ga} = req.cookies
        //await ClientID.create({ gaCID: _ga, userId: user.id,email: user.email,seen: 'login' })
        return res.json({token})
    }
    async check(req,res,next){
        const token = generateJwt(req.user.id,req.user.email,req.user.role)
        return res.json({token})
    }
    async info(req,res,next){
        //const token = generateJwt(req.user.id,req.user.email,req.user.role)
        //const email = req.user.email
        //const {_ga} = req.cookies
        const user = await User.findOne({where: {email: req.user.email}})
        const servicePrice = await ServicePrice.findAll()
        //const clientID = await ClientID.create({ gaCID: _ga, userId: user.id,email: req.user.email,seen: 'info' })
        const {email,balance,isActivated} = user
        let prices = {}
            //createBot: process.env.BOT_CREATE_COST,
            //createBotTtwars: process.env.BOT_CREATE_COST,
            //search: process.env.SEARCH_COST

        for(let i in servicePrice){
            prices[servicePrice[i].service] = servicePrice[i].price
        }
        return res.json({email,balance,isActivated,prices})
    }
    async payment(req,res,next){
        const event = req.body;
        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const p = event.data.object;
                //console.log(`PaymentIntent for ${p.amount} was successful!`);
                console.log('payment',p)
                await storePayment(p)
                break;
            default:
                // Unexpected event type
                console.log(`Unhandled event type ${event.type}.`);
        }
        // Return a 200 response to acknowledge receipt of the event
        res.send();

        //const token = generateJwt(req.user.id,req.user.email,req.user.role)
        //const email = req.user.email
        //const user = await User.findOne({where: {email: req.user.email}})
        //const {email,balance} = user
        //return res.json({email,balance})

    }
    async checkout(req,res,next){
        const stripe = require('stripe')(process.env.STRIPE_KEY);
        const user = await User.findOne({where: {email: req.user.email}})
        const {productId} = req.body
        let product

        const {email,balance} = user
        console.log('product',productId)
        product = Products.find(product => {if(product.id == productId) return product })
        if(!product) product = Products[0];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount:   parseInt(product.price * 100),
                    product_data: {
                        name:   `Elephants & croppers finder  - ${product.name} (${product.points} points) for ${user.email}`,
                        images:   ['https://travibot.com/img/travibot-logo-256.png'],
                    },
                },
                quantity: 1,
            }],
            customer_email: user.email,
            mode: 'payment',
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
            metadata: {
                seller: 'cells',
                item_number: product.item_number,
                email: user.email,
                name: product.name,
            }
        });
        //console.log(session.url)
        //res.redirect(303, session.url)
        return res.json({url: session.url,status: 303})
    }
    async resetPassReq(req,res,next){
        const {email,captchaToken} = req.body
        console.log(email,captchaToken)
        if(captchaToken === undefined || captchaToken === '' || captchaToken === null){
            return res.json({errors: true, msg: 'Please select captcha'})
        }

        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA_SECRET}&response=${captchaToken}`;
        let captchaSolved = false
        try{
            let googleResp = await fetch(url, {method: "post",}).then((response) => response.json())
            console.log('googleResp',googleResp)
            if (googleResp.success == true) {
                captchaSolved = true
                //return res.json({errors: false, msg: 'Captcha success'})
            }
        }catch(e){
            console.log(e)
        }
        if(!captchaSolved){
            return res.json({errors: true, msg: 'Please try to solve captcha again'})
        }

        const user = await User.findOne({where: {email}})
        if(!user){
            return res.json({errors: true, msg: 'Wrong email'})
        }

        let resetPassLink = uuid.v4()
        user.resetPassLink = resetPassLink
        user.save()
        await mailService.sendResetPassMail(email,`${process.env.CLIENT_DOMAIN}new-pass/${resetPassLink}`)
        return res.json({errors: false,msg: 'Please check your email to reset password'})
    }
    async newPassReq(req,res,next){
        const {password,passToken} = req.body
        if(!passToken || !password){
            //return next(ApiError.badRequest('Incorrect password or password token'))
            return res.json({errors: true, msg:'Incorrect password or password token'})
        }
        const user = await User.findOne({where: {resetPassLink: passToken}})
        if(!user){
            //return next(ApiError.badRequest('Incorrect password token'))
            return res.json({errors: true, msg:'Incorrect password token'})
        }
        const hashPassword = await bcrypt.hash(password,3)
        user.password = hashPassword
        user.resetPassLink = null
        user.save()
        return res.json({errors: false, msg:'Password changed'})
    }
}
module.exports = new UserController()