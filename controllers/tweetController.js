const {Tweet, Entity} = require('../models/models')
const ApiError = require('../error/apiError')
const moment = require('moment')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('../db')

class TweetController{
    async getAll(req,res){
        //const {zone} = req.params
        let {entity,limit,page,searchType} = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let offset = page * limit - limit
        let tweets
        let count = 0
        let result
        if (searchType === 'All'){
            entity = parseInt(entity) || 0
            if(entity){
                let r = await Promise.all([

                    sequelize.query(`SELECT b.*, c.name,c.screen_name,c.profile_image_url_https
                        FROM tweet_entities a, tweets b
                        left join tweet_users c on b.user_id = c.tw_id
                        where a.tweetId = b.tw_id and a.entityId =  ${entity}
                        order by b.tw_id desc
                        limit ${limit} offset ${offset}`,
                    { type: QueryTypes.SELECT }),

                    sequelize.query(`SELECT count(*) as cnt
                        FROM tweet_entities where entityId = ${entity}`,
                    { type: QueryTypes.SELECT })
                ])
                //console.log('cnt',cnt)
                //count = cnt.cnt
                result = {rows:r[0],count:r[1][0].cnt}
            }else{
                let r = await Promise.all([
                    sequelize.query(`SELECT *, c.name,c.screen_name,c.profile_image_url_https
                        from tweets a 
                        left join tweet_users c on a.user_id = c.tw_id
                        order by a.tw_id desc
                        limit ${limit} offset ${offset}`,
                    { type: QueryTypes.SELECT }),
                    sequelize.query(`SELECT count(*) as cnt from tweets`,
                    { type: QueryTypes.SELECT })
                ])
                //count = cnt.cnt
                result = {rows:r[0],count:r[1][0].cnt}
            }
        }
        else if (searchType === 'Person'){
            console.log()
            let person_id = entity
            if(person_id){
                let r = await Promise.all([
                    sequelize.query(`SELECT * FROM twitter.tweets where user_id=?
                        order by tw_id desc
                        limit ${limit} offset ${offset}`,
                        { type: QueryTypes.SELECT,replacements: [person_id] }),
                    sequelize.query(`SELECT count(*) as cnt
                        FROM twitter.tweets where user_id=?`,
                        { type: QueryTypes.SELECT,replacements: [person_id] })
                ])
                //console.log('cnt',cnt)
                //count = cnt.cnt
                result = {rows:r[0],count:r[1][0].cnt}
            }else{
                /*
                let r = await Promise.all([
                    sequelize.query(`SELECT *, c.name,c.screen_name,c.profile_image_url_https
                        from tweets a
                        left join tweet_users c on a.user_id = c.tw_id
                        order by a.tw_id desc
                        limit ${limit} offset ${offset}`,
                        { type: QueryTypes.SELECT }),
                    sequelize.query(`SELECT count(*) as cnt from tweets`,
                        { type: QueryTypes.SELECT })
                ])

                 */
                //count = cnt.cnt
                result = {rows:[],count:0}
            }
        }
        else if (searchType === 'Entity'){
            if(entity && entity !== 'All'){
                let r = await Promise.all([
                    /*
                    sequelize.query(`SELECT b.*, c.name, c.screen_name, c.profile_image_url_https
                        FROM tweet_entities a, tweets b, entities d, tweet_users c
                        where a.tweetId = b.tw_id and 
                        d.id = a.entityId and 
                        c.tw_id = b.user_id and
                        d.entity = ?
                        order by b.tw_id desc
                        limit ${limit} offset ${offset}`,
                        { type: QueryTypes.SELECT, replacements: [entity]}),

                     */
                    sequelize.query(`select b.* , c.name, c.screen_name, c.profile_image_url_https
from (SELECT b.* FROM tweet_entities a, tweets b
where a.tweetId = b.tw_id and
a.entityId = (SELECT id FROM twitter.entities
where entity = ? limit 1)
order by b.tw_id desc
limit ${limit} offset ${offset}) b,
tweet_users c
where c.tw_id = b.user_id`, {type: QueryTypes.SELECT, replacements: [entity]}),
/*
                    sequelize.query(`SELECT count(a.entityId) as cnt
                        FROM tweet_entities a, entities d
                        where d.id = a.entityId and 
                        d.entity = ?`,
                        { type: QueryTypes.SELECT, replacements: [entity]})

 */
                    sequelize.query(`SELECT count(b.tw_id) as cnt FROM tweet_entities a, tweets b
where a.tweetId = b.tw_id and
a.entityId = (SELECT id FROM twitter.entities
where entity = ? limit 1)`,
                        { type: QueryTypes.SELECT, replacements: [entity]})

                ])
                //console.log('cnt',cnt)
                //count = cnt.cnt
                result = {rows:r[0],count:r[1][0].cnt}
            }else{
                let r = await Promise.all([
                    sequelize.query(`SELECT *, c.name,c.screen_name,c.profile_image_url_https
                        from tweets a 
                        left join tweet_users c on a.user_id = c.tw_id
                        order by a.tw_id desc
                        limit ${limit} offset ${offset}`,
                        { type: QueryTypes.SELECT }),
                    sequelize.query(`SELECT count(*) as cnt from tweets`,
                        { type: QueryTypes.SELECT })
                ])
                //count = cnt.cnt
                result = {rows:r[0],count:r[1][0].cnt}
            }
        }
        return res.json(result)
    }
    /*
    async getEntities(req,res){
        let {searchType} = req.query
        let entities = {}
        let limit = 30
        if (searchType === 'All'){
            entities = await sequelize.query(`
                SELECT a.entityId,b.entity,b.type, count(a.entityId) as c1
                    FROM twitter.tweet_entities a, entities b
                    where a.entityId = b.id
                    group by a.entityId
                    order by c1 desc
                    limit 30`,
                { type: QueryTypes.SELECT })

        }
        return res.json(entities)
    }
*/
}
module.exports = new TweetController()