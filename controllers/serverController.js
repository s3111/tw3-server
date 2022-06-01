const {Server} = require('../models/models')
const ApiError = require('../error/apiError')
const moment = require('moment')
const { Op } = require('sequelize')

class ServerController{
    /*
    async getServers(req,res){
        //const {zone} = req.params
        let {zone,limit,page,searchType} = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let offset = page * limit - limit
        let servers
        if (searchType === 'Croppers'){
            if(zone){
                servers = await Server.findAll({
                    where: {
                        scan_status: 1,
                        start_date: {
                            [Op.gte]: moment().subtract(200, 'days').toDate()
                        },
                        from_zone: zone
                    },
                    limit,
                    offset
                })
            }
            else{
                servers = await Server.findAll({
                    where: {
                        scan_status: 1,
                        start_date: {
                            [Op.gte]: moment().subtract(200, 'days').toDate()
                        }
                    },
                    order: [['start_date', 'DESC']],
                    limit,
                    offset
                })
            }
        }
        else if (searchType === 'Oases'){
            if(zone){
                servers = await Server.findAll({
                    where: {
                        scan_status: 1,
                        start_date: {
                            [Op.gte]: moment().subtract(200, 'days').toDate()
                        },
                        from_zone: zone
                    },
                    limit,
                    offset
                })
            }
            else{
                servers = await Server.findAll({
                    where: {
                        scan_status: 1,
                        start_date: {
                            [Op.gte]: moment().subtract(200, 'days').toDate()
                        }
                    },
                    order: [['start_date', 'DESC']],
                    limit,
                    offset
                })
            }
        }
        else if(searchType === 'Elephants'){
            if(zone){
                servers = await Server.findAll({
                    where: {
                        elephants_date: { [Op.gte]: moment().subtract(7, 'days').toDate()},
                        from_zone: zone
                    },
                    attributes: {
                        include:[['elephants_date','lastScan'],['elephants','elephantsCount']],
                    },
                    limit,
                    offset
                })
            }
            else{
                servers = await Server.findAll({
                    where: {
                        elephants_date: { [Op.gte]: moment().subtract(7, 'days').toDate()},
                    },
                    attributes: {
                        include:[['elephants_date','lastScan'],['elephants','elephantsCount']],
                    },
                    limit,
                    offset
                })
            }
        }
        else { // searchType === 'Servers'
            if(zone){
                servers = await Server.findAndCountAll({
                    where: {
                        //elephants_date: { [Op.gte]: moment().subtract(7, 'days').toDate()},
                        start_date: {
                            [Op.gte]: moment().subtract(400, 'days').toDate()
                        },
                        from_zone: zone
                    },
                    attributes: {
                        include:[['elephants_date','lastScan'],['elephants','elephantsCount'],['scan_status','scanStatus'],['signup_closed','closed'],['end','ended']],
                    },
                    order: [['start','DESC']],
                    limit,
                    offset
                })
            }
            else{
                servers = await Server.findAndCountAll({
                    where: {
                        //elephants_date: { [Op.gte]: moment().subtract(7, 'days').toDate()},
                        start_date: {
                            [Op.gte]: moment().subtract(400, 'days').toDate()
                        },

                    },
                    attributes: {
                        include:[['elephants_date','lastScan'],['elephants','elephantsCount'],['scan_status','scanStatus'],['signup_closed','closed'],['end','ended']],
                    },
                    order: [['start','DESC']],
                    limit,
                    offset
                })
            }

        }
        return res.json(servers)
    }
    async getZones(req,res){
        let {searchType} = req.query
        let zones
        if (searchType === 'Croppers'){
            zones = await Server.findAll({
                attributes: [['from_zone','zone']],
                where: {
                    scan_status: 1,
                    start_date: {
                        [Op.gte]: moment().subtract(200, 'days').toDate()
                    }
                },
                group: ['from_zone']
            })

        }
        else if (searchType === 'Oases'){
            zones = await Server.findAll({
                attributes: [['from_zone','zone']],
                where: {
                    scan_status: 1,
                    start_date: {
                        [Op.gte]: moment().subtract(200, 'days').toDate()
                    }
                },
                group: ['from_zone']
            })
        }
        else if(searchType === 'Elephants'){ // elephants
            zones = await Server.findAll({
                attributes: [['from_zone','zone']],
                where: {
                    elephants_date: {
                        [Op.gte]: moment().subtract(7, 'days').toDate()
                    }

                },
                group: ['from_zone']
            })
        }
        else { // searchType === 'Servers'
            zones = await Server.findAll({
                attributes: [['from_zone','zone']],
                where: {
                    start_date: {
                        [Op.gte]: moment().subtract(300, 'days').toDate()
                    }
                },
                group: ['from_zone'],
            })
        }
        return res.json(zones)
    }

    */

}
module.exports = new ServerController()