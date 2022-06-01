//import * as sequelize from "sequelize";
//const { sequelize } = require('sequelize')
const jwt = require('jsonwebtoken')

const sequelize = require('../db')
const { Op } = require('sequelize')
const {Elephant,User,UserSpent,Server,ServicePrice} = require('../models/models')
const ApiError = require('../error/apiError')

class ElephantController{
    async getAll(req,res){
        let {server,page,x,y,filter} = req.query
        //const searchCost = process.env.SEARCH_COST
        const searchCost = (await ServicePrice.findOne({where: {service: 'search'}})).price
        let limit = 20
        let isGood = false
        let balance = 0
        let userId
        let decoded = {}
        if(JSON.parse(filter)) filter = JSON.parse(filter)
        else filter = {with:[40],without:[]}
        console.log('x,y,filter ',x,y,filter)
        try{
            const token = req.headers.authorization.split(' ')[1]
            console.log('token',token)
            if(token){
                decoded = jwt.verify(token,process.env.SECRET_KEY)
                console.log('decoded',decoded)
                if(decoded.email){
                    const user = await User.findOne({where: {email: decoded.email}})
                    //console.log('el user',user)
                    balance = user.balance
                    userId = user.id
                    if (balance >= searchCost){
                        console.log('Current balance', balance)
                        if(user.isActivated) isGood = true
                        else console.log('account must be activated')
                    }
                    else {
                        console.log('low balance')
                    }
                }
                else{
                    console.log('cant decode token')
                }
            }
            else{
                console.log('is no token')
            }
        }catch(e){
            console.log('Bad request',e)
        }
        console.log('x,y 2',x,y)
        const serverObj = await Server.findOne({where: {server: server}})
        if(isGood){
            page = parseInt(page) || 1
            x = parseInt(x)
            y = parseInt(y)
            if(server && (page != 1 || x != 200 || y != 200 || filter.without.length || filter.with.join() != '40')) {
                balance = balance - searchCost
                console.log('new balance',balance)
                //await User.update({where: {email: decoded.user.email}})
                await User.update({ balance: balance }, {
                    where: {
                        email: decoded.email
                    }
                });
                try{

                    await UserSpent.create({
                        email: decoded.email,
                        amount: - searchCost,
                        balance,
                        userId,
                        operation: 'elephants',
                        operation_info:JSON.stringify({server: serverObj.server ,x,y,page})
                    })
                }catch(e){
                    console.log(e)
                }
            }
        }
        else{
            page = 1
            x = 200
            y = 200
            filter = {with:[40],without:[]}
        }
        let offset = page * limit - limit

        console.log(server,limit,offset,x,y)
        console.log('x,y 3 filter',x,y,filter)
        let elephants
        if(!serverObj.id){
            elephants = []
        }
        else {
            let flWithArr = []
            if(!filter.with.length) filter.with = [40]
            for(let w in filter.with){
                flWithArr.push(' t'+ filter.with[w] +'>0 ')
            }
            let flWith = flWithArr.join(' or ')
            let flWithout = '1=1'
            if(filter.without.length){
                for(let w in filter.without){
                    flWithout = flWithout + ' and t'+ filter.without[w] +'=0 '
                }
            }
            console.log('flWith',flWith)
            elephants = await Elephant.findAndCountAll(
                {
                    where: {
                        server_id: serverObj.id,
                        [Op.and]:[sequelize.literal(`(${flWith}) and (${flWithout})`)],
                        //[Op.and]:[sequelize.literal(flWithout)]
                        //elephants: {
                        //    [Op.gt]: 0
                        //},
                    },
                    attributes: {
                        include: [[sequelize.literal("round(sqrt(pow((x-"+x.toString()+"),2)+pow((y-"+y.toString()+"),2)),2)"),'distance']]
                    },
                    order: sequelize.col('distance'),
                    limit,
                    offset
                })
        }
        return res.json({elephants,balance,serverId:serverObj.id,server,x,y})
    }
}
module.exports = new ElephantController()