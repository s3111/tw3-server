const {Tweet, Entity} = require('../models/models')
const ApiError = require('../error/apiError')
const moment = require('moment')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('../db')

class PersonController{
    async getAll(req,res){
        let {searchType, name,page,limit,order,verified} = req.query
        let persons = {}
        let result = {rows: [], count: 0}
        if(!limit) limit = 30

        if (searchType === 'Bar'){

        }
        else if (searchType === 'One' && name) {

        }
        else if (searchType === 'List'){
            page = parseInt(page) || 1
            limit = parseInt(limit) || 20
            //let orderSql = 'statuses_capt_count'
            let orderSql = 'followers_count'
            if(order === 'followers') orderSql = 'followers_count'
            else if(order === 'statuses') orderSql = 'statuses_count'
            else if(order === 'statusesCapt') orderSql = 'statuses_capt_count'
            else if(order === 'friends') orderSql = 'friends_count'
            else if(order === 'favourites') orderSql = 'favourites_count'



            let verifiedSql = ''
            console.log(verified)
            if (verified === '1') verifiedSql = ' and verified=1 '

            let offset = page * limit - limit
            let cnt = 0

            if(!tweetStat.hasOwnProperty('personsStat')) tweetStat.personsStat = {updatedAt: 0}
            let statInterval = 10 // minutes
            console.log(tweetStat.personsStat.updatedAt < Date.now() - statInterval * 60 * 1000)
            console.log(tweetStat.personsStat.updatedAt, Date.now() - statInterval * 60 * 1000)
            if(tweetStat.personsStat.updatedAt < Date.now() - statInterval * 60 * 1000){
                let [row] = await sequelize.query('SELECT \n' +
                    'max(followers_count) as maxFollowers,\n' +
                    'max(favourites_count) as maxFavourites,\n' +
                    'max(statuses_count) as maxStatuses,\n' +
                    'max(statuses_capt_count) as maxStatusesCapt,\n' +
                    'max(friends_count) as maxFriends\n' +
                    'FROM twitter.tweet_users')
                //console.log(row)
                tweetStat.personsStat = {
                    updatedAt: Date.now(),
                    maxFollowers: row[0].maxFollowers,
                    maxFavourites: row[0].maxFavourites,
                    maxStatuses: row[0].maxStatuses,
                    maxStatusesCapt: row[0].maxStatusesCapt,
                    maxFriends: row[0].maxFriends,
                }

            }

            if (name && name !== 'All'){
                let r = await Promise.all([
                    sequelize.query(`SELECT a.entityId as id,b.entity as name,b.type, count(a.entityId) as count
                        FROM twitter.tweet_entities a, entities b where a.entityId = b.id and b.type = ?
                        group by a.entityId  order by count desc limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT, replacements: [name]}),
                    sequelize.query(`select count(*) as cnt from (SELECT b.id
                        FROM twitter.tweet_entities a, twitter.entities b where a.entityId = b.id and b.type = ?
                        group by b.id) x`,
                        {type: QueryTypes.SELECT, replacements: [name]})
                ])
                result = {rows:r[0],count:r[1][0].cnt}

            }
            else{
                let r = await Promise.all([
                    sequelize.query(`SELECT * FROM tweet_users
                        where statuses_capt_count is not null ${verifiedSql}
                        order by ${orderSql} desc limit ? offset ?`,
                        { type: QueryTypes.SELECT,replacements: [limit, offset] }),
                    sequelize.query(`select count(*) as cnt from tweet_users where statuses_capt_count is not null ${verifiedSql}`,
                        {type: QueryTypes.SELECT})
                ])
                result = {rows:r[0],count:r[1][0].cnt}
            }
            result.stat = tweetStat.personsStat
        }
        //console.log(result)

        return res.json(result)
    }
    async getOne(req,res){
        let {name} = req.params
        //name = name.replace(/@(.+)/, '$1');
        let result = ''
        let r = await Promise.all([
            sequelize.query(`SELECT * 
                        FROM tweet_users a
                        where screen_name = ?
`,
                { type: QueryTypes.SELECT, replacements: [name] }),

        ])
        //result = {rows:r[0],count:r[1][0].cnt}
        //console.log(r[0][0])
        if(r[0][0]) result = r[0][0]
        return res.json(result)
    }
    /*
    async getAllTypes(req,res){
        let {searchType, name} = req.query
        let entitiesTypes = {}
        let limit = 30
        if (searchType === 'All'){
            //entitiesTypes = await sequelize.query("SELECT `type` as `name`, count(`type`) as `count` FROM twitter.entities group by `type` order by count desc limit 30",                { type: QueryTypes.SELECT })
            entitiesTypes = await sequelize.query("SELECT @s:=@s+1 as id,`type` as `name`, count(`type`) as `count` FROM twitter.entities ,(SELECT @s:= 0) AS s group by `type` order by count desc",                { type: QueryTypes.SELECT })
        }
        else if (searchType === 'One' && name) {
            console.log('need one entity', name)
            entitiesTypes = await sequelize.query(`
                SELECT a.entityId as id,b.entity as name,b.type, count(a.entityId) as count
                    FROM twitter.tweet_entities a, entities b
                    where a.entityId = b.id and b.entity = ?
                    group by a.entityId
                    order by count desc
                    limit 1`,
                {
                    replacements: [name],
                    type: QueryTypes.SELECT
                })
        }
        console.log(entitiesTypes)
        return res.json(entitiesTypes)
    }

    */
}
module.exports = new PersonController()