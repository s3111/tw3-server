const {Tweet, Entity} = require('../models/models')
const ApiError = require('../error/apiError')
const moment = require('moment')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('../db')

class StatController{
    async getAll(req,res){
        let {searchType, name,page,limit} = req.query
        //let personsCnt = 0
        //let entitiesCnt = 0
        //let tweetsCnt = 0
        //let result = {};
        /*
        let tweets = sequelize.query(`select count(*) as cnt from tweets`,{type: QueryTypes.SELECT});
        let persons = sequelize.query(`select count(*) as cnt from tweet_users`,{type: QueryTypes.SELECT});
        let entities = sequelize.query(`select count(*) as cnt from tweet_entities`,{type: QueryTypes.SELECT});
        let result = await Promise.all([tweets,persons,entities])

         */
        let result = await Promise.all([
            sequelize.query(`select count(*) as cnt from tweets`,{type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from tweet_users`,{type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from tweet_entities`,{type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from entities`,{type: QueryTypes.SELECT}),
            sequelize.query(`SELECT date,count FROM statistic where typeId=1`,{type: QueryTypes.SELECT}),

        ])
        //let result2 = await Promise.all([tweets,persons,entities])
        //result = {persons: personsCnt.cnt,tweets: tweetsCnt.cnt, entities: entitiesCnt.cnt}
        //console.log(result)
        //console.log({tweets: result[0][0].cnt, persons: result[1].cnt, entities: result[2].cnt})
        return res.json({
            tweets: result[0][0].cnt,
            persons: result[1][0].cnt,
            tweetEntities: result[2][0].cnt,
            entities: result[3][0].cnt,
            timeFrames: {
                tweets: Object.keys(result[4]).map(k => {return [result[4][k].date,result[4][k].count]})
            }
        })
    }
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
}
module.exports = new StatController()