const jwt = require('jsonwebtoken')
const sequelize = require('../db')
const {Elephant,User,UserSpent,ServicePrice} = require('../models/models')
const ApiError = require('../error/apiError')
const { QueryTypes } = require('sequelize');

class CropperController{
    async getAll(req,res){
        let {server,page,x,y} = req.query
        //const searchCost = process.env.SEARCH_COST
        const searchCost = (await ServicePrice.findOne({where: {service: 'search'}})).price
        let limit = 20
        let isGood = false
        let balance = 0
        let userId
        let decoded = {}
        console.log('x,y 1',x,y)
        try{
            const token = req.headers.authorization.split(' ')[1]
            console.log('token',token)
            if(token){
                decoded = jwt.verify(token,process.env.SECRET_KEY)
                console.log('decoded',decoded)
                if(decoded.email){
                    const user = await User.findOne({where: {email: decoded.email}})
                    console.log('el user',user)
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
        if(isGood){
            page = parseInt(page) || 1
            x = parseInt(x)
            y = parseInt(y)
            if(server && (page != 1 || x != 200 || y != 200)) {
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
                        operation: 'croppers',
                        operation_info:JSON.stringify({server,x,y,page})
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
        }

        let offset = page * limit - limit

        console.log(server,limit,offset,x,y)
        console.log('x,y 3',x,y)
        let croppers = {}
        if(!server){
            croppers = []
        }
        else {
            let serverAlias = server.replace(/\./g,'_')
            croppers.rows = await sequelize.query(`SELECT *, round(sqrt(pow((x-${x}),2)+pow((y-${y}),2)),2) as distance FROM village_${serverAlias} 
                order by distance limit ${offset}, ${limit}`, { type: QueryTypes.SELECT });
            let count = await sequelize.query(`SELECT count(*) as cnt1 FROM village_${serverAlias}`, { type: QueryTypes.SELECT });

            croppers.count = count[0].cnt1
            console.log('count',count,croppers.count)
            /*
            croppers = await Elephant.findAndCountAll(
                {
                    where: {server_id: serverId},
                    attributes: {
                        include: [[sequelize.literal("round(sqrt(pow((x-"+x.toString()+"),2)+pow((y-"+y.toString()+"),2)),2)"),'distance']]
                    },
                    order: sequelize.col('distance'),
                    limit,
                    offset
                })

             */
        }
        return res.json({croppers,balance,server,x,y})
    }
}
module.exports = new CropperController()