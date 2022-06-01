const {Bot,BotLog,User,UserSpent,ServicePrice} = require('../models/models')
const jwt = require('jsonwebtoken')
const ApiError = require('../error/apiError')
const sequelize = require('../db')
const { QueryTypes } = require('sequelize');
const {gs} = require('../models/defaultConf')
class BotController{
    async create(req,res){
        //let {server,login,pass,proxyIp,proxyPort,proxyType,proxyLogin,proxyPass} = req.body
        let {server,login,pass,proxyArr,} = req.body
        //const bot = await Bot.create({name})

        //const botCreateCost = process.env.BOT_CREATE_COST
        const botCreateCost = (await ServicePrice.findOne({where: {service: 'createBot'}})).price
        const availablePools = [6,8,9]
        const ttwarsPool = 7

        let balance = 0
        let isError = false
        let errorMsg = ''
        let botCreated = false
        //return res.json(bot)
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (token) {
                let decoded = jwt.verify(token, process.env.SECRET_KEY)
                console.log('decoded', decoded)
                if (decoded.email) {
                    const user = await User.findOne({where: {email: decoded.email}})
                    balance = user.balance
                    if (balance >= botCreateCost){
                        console.log('Current balance', balance)
                        if(user.isActivated) {
                            balance = balance - botCreateCost
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
                                    amount: - botCreateCost,
                                    balance,
                                    userId: user.id,
                                    operation: 'botCreate',
                                    operation_info:JSON.stringify({server,login})
                                })
                            }catch(e){
                                console.log(e)
                            }
                            //console.log('bot user', user.id)
                            let pools = await sequelize.query('SELECT pool,count(pool) as cnt1 FROM Bots ' +
                                'where pool not in (7) ' +
                                'group by pool ' +
                                'order by cnt1 ' +
                                'limit 1', { type: QueryTypes.SELECT })

                            let pool = availablePools[Math.floor(Math.random() * availablePools.length)]
                            if(pools) pool = pools[0].pool
                            if(server.includes('ttwars.com')) pool = ttwarsPool

                            if(server.includes('https://')) server = server.replace('https://','')
                            if(server.includes('http://')) server = server.replace('http://','')
                            if(server.includes('/')) server = server.replace(/\/.*/,'')

                            await Bot.create({ server: server, login: login, pass: pass, userId: user.id, pool,proxy: JSON.stringify(proxyArr)})
                            /*
                            console.log(proxyIp, proxyPort, proxyType, proxyIp && proxyPort && proxyType)
                            if(proxyIp && proxyPort && proxyType){
                                console.log('with proxy')
                                await Bot.create({
                                    server: server,
                                    login: login,
                                    pass: pass,
                                    userId: user.id,
                                    pool,
                                    proxy_ip: proxyIp,
                                    proxy_port: proxyPort,
                                    proxy_login: proxyLogin,
                                    proxy_pass: proxyPass,
                                    proxy_type: proxyType,
                                })
                            }else{
                                console.log('without proxy')
                                await Bot.create({ server: server, login: login, pass: pass, userId: user.id, pool } )
                            }
                            */
                            console.log('Will create bot',server,login,pass, user.id)
                            //return res.json({created: true})
                            botCreated = true
                        }
                        else {
                            console.log('account must be activated')
                            //return res.json({error:'Account must be activated'})
                            isError = true
                            errorMsg = 'Account must be activated.'
                        }
                    }
                    else {
                        console.log('low balance')
                        //return res.json({error:'Low balance'})
                        isError = true
                        errorMsg = 'Low balance.'
                    }
                }
                else {
                    //return res.json({error:'Bad request'})
                    isError = true
                    errorMsg = 'Unexpected error'
                }
            }
            else {
                //return res.json({error:'Bad request'})
                isError = true
                errorMsg = 'Unexpected error'
            }
        }catch(e){
            console.log('Bad request',e)
            //return res.json({error:'Bad request'})
            isError = true
            errorMsg = 'Bad request'
        }
        //return res.json({created: true})
        return res.json({balance,isError,errorMsg,botCreated})
    }
    async update(req,res){
        const {conf,id,proxy} = req.body
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (token) {
                let decoded = jwt.verify(token, process.env.SECRET_KEY)
                console.log('decoded', decoded)
                if (decoded.email) {
                    const user = await User.findOne({where: {email: decoded.email}})
                    console.log('bot user ff', id,user.id)
                    await Bot.update({ game_conf: JSON.stringify(conf), proxy: JSON.stringify(proxy) }, {where: {id, userId: user.id}})
                    console.log('bot user jj', id,user.id)
                    /*
                    bot = await Bot.findOne({
                        where: {userId: user.id, id},
                        attributes: ['game_conf' ],
                        raw:true,
                        //order: [['id','DESC']]
                    })
                    if(bot){
                        let presentConf = JSON.parse(bot.game_conf)
                        if(!presentConf) presentConf={
                            Account:{},
                            Bot:{},
                            Villages:{}
                        }
                        presentConf = conf
                        await Bot.update({ game_conf: presentConf }, {where: {userId: userId, id}})
                    }
                    //else bot = {}

                    */
                }
            }
        }catch(e){
            console.log('Bad request',e)
        }
        return res.json('ok')
    }
    async delete(req,res){
        //const {conf,id} = req.body
        const {id} = req.params
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (token) {
                let decoded = jwt.verify(token, process.env.SECRET_KEY)
                console.log('decoded', decoded)
                if (decoded.email) {
                    const user = await User.findOne({where: {email: decoded.email}})
                    console.log('bot user', id,user.id)
                    await Bot.destroy({where: {id, userId: user.id}})
                    console.log('bot user', id,user.id)
                }
            }
        }catch(e){
            console.log('Bad request',e)
        }
        return res.json('ok')
    }
    async getAll(req,res){
        let bots = []
        //let botsSQL =[]
        try {
            const token = req.headers.authorization.split(' ')[1]
            console.log('token', token)
            if (token) {
                let decoded = jwt.verify(token, process.env.SECRET_KEY)
                console.log('decoded', decoded)
                if (decoded.email) {
                    const user = await User.findOne({where: {email: decoded.email}})
                    console.log('bot user', user)
                    bots = await Bot.findAll({
                        where: {userId: user.id},
                        attributes: ['id','server','login','ban','game_stat','game_events','created_at','deleted_at' ],
                        raw:true,
                        order: [['id','DESC']]
                    })
                    bots = bots.map(item => {
                        //console.log(item.game_events)
                        //item.stat = JSON.parse(item.game_stat) || {}
                        //let events = JSON.parse(item.game_events) || {}
                        item.events = JSON.parse(item.game_events) || {}

                        //if(events.clubActive) item.stat.clubActive = events.clubActive
                        //else item.stat.clubActive = 0
                        //defaultBQSecondVill
                        delete(item.events.defaultBQSecondVill)
                        delete(item.events.defaultBQDef)
                        delete(item.events.defaultBQMainVill)
                        delete(item.events.defaultBQResVill)
                        delete(item.events.warehouseCap)
                        delete(item.events.BQMainVillTtwarsNor)
                        delete(item.events.BQMainVillTtwarsVip)
                        delete(item.events.Intervals)
                        delete(item.events.Resources)
                        delete(item.events.log)
                        delete(item.events.pass)
                        delete(item.events.proxy_ip)
                        delete(item.events.proxy_login)
                        delete(item.events.proxy_pass)
                        delete(item.events.proxy_port)
                        delete(item.events.login)
                        delete(item.events.server)
                        delete(item.events.activeProfileId)
                        delete(item.events.botId)
                        delete(item.events.canSpam)
                        delete(item.events.msgReadStat)
                        delete(item.events.profileLastChange)
                        delete(item.events.settlerCost)
                        delete(item.events.userAgent)

                        //delete(item.events.)
                        //delete(item.events.)
                        //delete(item.events.)

                        for(let v in item.events.Villages){
                            delete(item.events.Villages[v].currentBuildings)
                            delete(item.events.Villages[v].currentFields)
                        }

                        delete(item.game_stat)
                        delete(item.game_events)
                        return item
                    })

                }
            }
        }catch(e){
            console.log('Bad request',e)
        }
        return res.json(bots)
    }
    async getOne(req,res){
        const {id} = req.params
        let bot = {}
        let botResponse = {}
        //let botsSQL =[]
        try {
            const token = req.headers.authorization.split(' ')[1]
            if (token) {
                let decoded = jwt.verify(token, process.env.SECRET_KEY)
                console.log('decoded', decoded)
                if (decoded.email) {
                    const user = await User.findOne({where: {email: decoded.email}})
                    console.log('bot user', user)
                    bot = await Bot.findOne({
                        where: {userId: user.id, id},
                        attributes: ['id','server','login','ban','game_conf','proxy','game_stat','game_events','created_at','deleted_at' ],
                        raw:true,
                        //order: [['id','DESC']]
                    })
                    if(bot){
                        botResponse.id = bot.id
                        botResponse.server = bot.server
                        botResponse.login = bot.login
                        botResponse.ban = bot.ban
                        botResponse.Nav = {}
                        let proxy = JSON.parse(bot.proxy)
                        if(proxy) botResponse.proxy = proxy
                        else botResponse.proxy = {}

                        let events = JSON.parse(bot.game_events)
                        if(events){
                            delete(events.defaultBQSecondVill)
                            delete(events.defaultBQDef)
                            delete(events.defaultBQMainVill)
                            delete(events.defaultBQResVill)
                            delete(events.warehouseCap)
                            delete(events.BQMainVillTtwarsNor)
                            delete(events.BQMainVillTtwarsVip)
                            delete(events.Intervals)
                            delete(events.Resources)
                            //delete(events.log)
                            delete(events.pass)
                            delete(events.proxy_ip)
                            delete(events.proxy_login)
                            delete(events.proxy_pass)
                            delete(events.proxy_port)
                            delete(events.login)
                            delete(events.server)
                            delete(events.activeProfileId)
                            delete(events.botId)
                            delete(events.canSpam)
                            delete(events.msgReadStat)
                            delete(events.profileLastChange)
                            delete(events.settlerCost)
                            delete(events.userAgent)
                        }
                        //let stat = JSON.parse(bot.game_stat)
                        let race = '?'
                        if(events && events.race)   race = events.race

                        if(bot.game_conf !== null && bot.game_conf != '') botResponse.conf = JSON.parse(bot.game_conf)
                        else {
                            botResponse.conf = JSON.parse(JSON.stringify(gs))
                            /*
                            botResponse.conf = {
                                Account:{
                                    race: race,
                                },
                                Bot:{},
                                Villages:{},
                                Auction: {
                                    Sell:{Active: 1},
                                    Buy:{Active: 0},
                                    Items:[
                                        {filter:1,  needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 1, filterName: 'helmet',itemName: 'Helmet'},
                                        {filter:2,  needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 1, filterName: 'body',itemName: 'Body'},
                                        {filter:3,  needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 1, filterName: 'leftHand',itemName: 'Left hand'},
                                        {filter:4,  needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 1, filterName: 'rightHand',itemName: 'Right hand'},
                                        {filter:5,  needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 1, filterName: 'shoes',itemName: 'Shoes'},
                                        {filter:6,  needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 1, filterName: 'horse',itemName: 'Horse'},
                                        {filter:7,  needBuy:0, needSell:0, maxBid:2, counted:1, diffItems: 0, filterName: 'bandage25',itemName: 'Small bandage'},
                                        {filter:8,  needBuy:0, needSell:0, maxBid:2, counted:1, diffItems: 0, filterName: 'bandage33',itemName: 'Bandage'},
                                        {filter:9,  needBuy:0, needSell:0, maxBid:2, counted:1, diffItems: 0, filterName: 'cage',itemName: 'Cage'},
                                        {filter:10, needBuy:0, needSell:0, maxBid:2, counted:1, diffItems: 0, filterName: 'scroll',itemName: 'Scroll'},
                                        {filter:11, needBuy:0, needSell:0, maxBid:2, counted:1, diffItems: 0, filterName: 'ointment',itemName: 'Ointment'},
                                        {filter:12, needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 0, filterName: 'bucketOfWater',itemName: 'Bucket of water'},
                                        {filter:13, needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 0, filterName: 'bookOfWisdom',itemName: 'Book of wisdom'},
                                        {filter:14, needBuy:0, needSell:0, maxBid:2, counted:1, diffItems: 0, filterName: 'lawTables',itemName: 'Law tables'},
                                        {filter:15, needBuy:0, needSell:0, maxBid:2, counted:0, diffItems: 0, filterName: 'artWork',itemName: 'Art work'},
                                    ],
                                    },
                                Intervals:{
                                    resources:{relocate: 10 * 60},
                                    hero:{reface: 49},
                                    goldLists:{check: 1800, send: 12* 60},
                                    Units:{
                                        resources:{relocate: 'minutes?'},
                                        hero:{reface: 'hours'},
                                    }
                                },
                                FarmListGold:{},
                            }

                            */
                        }

                        //if(stat) botResponse.stat = stat
                        //else botResponse.stat = {}
                        //if(race) botResponse.conf.Account.race = race
                        if(events) botResponse.events = events
                        else botResponse.events = {}


                        if(events){
                            //if(events.clubActive) botResponse.stat.clubActive = events.clubActive
                            //else botResponse.stat.clubActive = 0

                            //if(events.plus) botResponse.stat.plus = events.plus
                            //else botResponse.stat.plus = 0

                            //if(events.log) botResponse.stat.log = events.log
                            //else botResponse.stat.log = []

                            if(events.FarmListGold) {
                                //if(!botResponse.conf.FarmListGold.lists) botResponse.conf.FarmListGold.lists = {}
                                for(let l in events.FarmListGold.lists){
                                    if(!botResponse.conf.FarmListGold.lists) botResponse.conf.FarmListGold.lists = {}
                                    if(!botResponse.conf.FarmListGold.lists[l]){
                                        botResponse.conf.FarmListGold.lists[l] = {}
                                        botResponse.conf.FarmListGold.lists[l].needSend = 0
                                        //botResponse.conf.Bot.FarmListGold[l].listName = events.FarmListGold[l].listName
                                        //botResponse.conf.Bot.FarmListGold[l].lastSend = events.FarmListGold[l].lastSend
                                    }
                                    //else botResponse.conf.FarmListGold.lists[l].needSend = 0
                                }
                            }
                            else botResponse.conf.FarmListGold = {}

                            if(events.Villages){
                                for (let did in events.Villages){
                                    //if(!botResponse.conf.Villages.hasOwnProperty(did))
                                    if(! botResponse.conf.Villages[did]) {
                                        botResponse.conf.Villages[did] = {}
                                        botResponse.conf.Villages[did].state = events.Villages[did].state
                                        botResponse.conf.Villages[did].order = {Barracks: [0,0],Stable: [0,0],Workshop:[0,0],Residense:[0,0]}
                                        botResponse.conf.Villages[did].BuildQueue = {}
                                        botResponse.conf.Villages[did].Smithy = {units: {u1:0,u2:0,u3:0,u4:0,u5:0,u6:0,u7:0,u8:0}}
                                    }

                                    // kostil !!!
                                    if(! botResponse.conf.Villages[did].Smithy) {
                                        botResponse.conf.Villages[did].Smithy = {units: {u1:0,u2:0,u3:0,u4:0,u5:0,u6:0,u7:0,u8:0}}
                                    }

                                    //botResponse.stat.Villages[did].currentBuildings = events.Villages[did].currentBuildings
                                }
                            }

                        }
                        // nav links
                        let bots = await Bot.findAll({
                            where: {userId: user.id},
                            attributes: ['id','server','login','ban' ],
                            raw:true,
                            order: [['id','DESC']]
                        })
                        if(bots) botResponse.Nav = bots

                        let botLog = await BotLog.findAll({
                            where: {bot_id: bot.id},
                            //attributes: ['id','date','event','webShow' ],
                            raw:true,
                            limit: 50,
                            order: [['id','DESC']]
                        })
                        if(botLog) botResponse.log = botLog
                        else botResponse.log = {}
                    }
                    else bot = {}
                }
            }
        }catch(e){
            console.log('Bad request',e)
        }
        return res.json(botResponse)
    }
}
module.exports = new BotController()