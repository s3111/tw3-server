const {Tweet, Entity} = require('../models/models')
const ApiError = require('../error/apiError')
const moment = require('moment')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('../db')

class EntityController{
    async getAll(req,res){
        let {searchType, name,page,limit} = req.query
        let entities = {}
        let result
        if(!limit) limit = 30
        if (searchType === 'Bar'){
            /*
            entities = await sequelize.query(`select a.*,b.type,b.entity as name from (
SELECT entityId as id,count(entityId) cnt
FROM tweet_entities
group by entityId
order by cnt desc
limit 30
) a
left join entities b on a.id = b.id  `,
                { type: QueryTypes.SELECT })

             */
            entities = await sequelize.query(`SELECT id,type,entity as name,cnt FROM entities
                where show_bar=1 order by cnt desc limit 30`,{ type: QueryTypes.SELECT })

            result = entities
        }
        else if (searchType === 'One' && name) {
            console.log('need one entity', name)
            /*
            entities = await sequelize.query(`
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

             */
            entities = await sequelize.query(`SELECT id,type,entity as name,cnt as count FROM entities
                where entity = ? order by cnt desc limit 1`, {replacements: [name], type: QueryTypes.SELECT})

            result = entities
        }
        else if (searchType === 'List'){
            page = parseInt(page) || 1
            limit = parseInt(limit) || 20
            let offset = page * limit - limit
            let cnt = 0
            if (name && name !== 'All'){
                let r = await Promise.all([
                    /*
                    sequelize.query(`SELECT a.entityId as id,b.entity as name,b.type, count(a.entityId) as count
                        FROM twitter.tweet_entities a, entities b
                        where a.entityId = b.id and b.type = ?
                        group by a.entityId
                        order by count desc
                        limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT, replacements: [name],}),

                     */
                    sequelize.query(`SELECT id,type,entity as name,cnt as count FROM entities
                        where type = ? and show_list=1 and cnt>15 order by cnt desc limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT, replacements: [name],}),
                    /*
                    sequelize.query(`select count(*) as cnt from (
                            SELECT b.id FROM twitter.tweet_entities a, twitter.entities b
                            where a.entityId = b.id and b.type = ? group by b.id) x`,{type: QueryTypes.SELECT,
                            replacements: [name],})
                    */
                    sequelize.query(`SELECT count(*) as cnt FROM entities where type = ? and show_list=1 
                        and cnt is not null and cnt>15`,{type: QueryTypes.SELECT, replacements: [name],})
                ])
                result = {rows:r[0],count:r[1][0].cnt}
            }else{
                let r = await Promise.all([
                    sequelize.query(`SELECT id,type,entity as name,cnt as count FROM entities
                        where show_list=1 and cnt>15  order by cnt desc limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT}),
                    sequelize.query(`SELECT count(*) as cnt FROM entities where show_list=1 and cnt>15 
                        and cnt is not null`,{type: QueryTypes.SELECT})
                    /*
                    sequelize.query(`SELECT a.entityId as id,b.entity as name,b.type, count(a.entityId) as count
                        FROM twitter.tweet_entities a, entities b
                        where a.entityId = b.id
                        group by a.entityId
                        order by count desc
                        limit ${limit} offset ${offset}`,
                    { type: QueryTypes.SELECT }),
                    sequelize.query(`select count(*) as cnt from (
                        SELECT b.id FROM twitter.tweet_entities a, twitter.entities b
                        where a.entityId = b.id
                        group by b.id) x`,
                    {type: QueryTypes.SELECT})

                    */
                ])
                result = {rows:r[0],count:r[1][0].cnt}
            }
            //console.log('cnt',cnt)
            //result = {rows:entities,count:cnt.cnt}
        }
        return res.json(result)
    }
    async getAllTypes(req,res){
        let {searchType, name} = req.query
        let entitiesTypes = {}
        let limit = 30
        if (searchType === 'All'){
            //entitiesTypes = await sequelize.query("SELECT `type` as `name`, count(`type`) as `count` FROM twitter.entities group by `type` order by count desc limit 30",                { type: QueryTypes.SELECT })
            //entitiesTypes = await sequelize.query("SELECT @s:=@s+1 as id,`type` as `name`, count(`type`) as `count` FROM twitter.entities ,(SELECT @s:= 0) AS s group by `type` order by count desc",                { type: QueryTypes.SELECT })
            entitiesTypes = await sequelize.query("SELECT * FROM twitter.entities_types where `show`=1 order by count desc", { type: QueryTypes.SELECT })
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
module.exports = new EntityController()