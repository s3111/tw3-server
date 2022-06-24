const {QueryTypes} = require('sequelize')
const sequelize = require('../db')

class EntityController {
    async getAll(req, res) {
        let {searchType, name, page, limit} = req.query
        let entities = {}
        let result
        if (!limit) limit = 30
        if (searchType === 'Bar') {
            entities = await sequelize.query(`SELECT id,type,entity as name,cnt FROM entities
                where show_bar=1 order by cnt desc limit 30`, {type: QueryTypes.SELECT})
            result = entities
        } else if (searchType === 'One' && name) {
            console.log('need one entity', name)
            entities = await sequelize.query(`SELECT id,type,entity as name,cnt as count FROM entities
                where entity = ? order by cnt desc limit 1`, {replacements: [name], type: QueryTypes.SELECT})
            result = entities
        } else if (searchType === 'List') {
            page = parseInt(page) || 1
            limit = parseInt(limit) || 20
            let offset = page * limit - limit
            let cnt = 0
            if (name && name !== 'All') {
                let r = await Promise.all([
                    sequelize.query(`SELECT a.id,a.type,a.entity as name,a.cnt as count, b.name as typeName FROM entities a
                        left join entities_types b on a.type = b.type
                        where a.type = ? and a.show_list=1 and a.cnt>15 order by a.cnt desc
                        limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT, replacements: [name],}),
                    sequelize.query(`SELECT count(*) as cnt FROM entities where type = ? and show_list=1 
                        and cnt is not null and cnt>15`, {type: QueryTypes.SELECT, replacements: [name],})
                ])
                result = {rows: r[0], count: r[1][0].cnt}
            } else {
                let r = await Promise.all([
                    sequelize.query(`SELECT a.id,a.type,a.entity as name,a.cnt as count, b.name as typeName FROM entities a
                        left join entities_types b on a.type = b.type
                        where a.show_list=1 and a.cnt>15 and b.show=1 order by a.cnt desc
                        limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT}),
                    sequelize.query(`SELECT count(*) as cnt FROM entities a
                    inner join entities_types b on a.type = b.type
                    where show_list=1 and cnt>15 and b.show=1 and cnt is not null`, {type: QueryTypes.SELECT})
                ])
                result = {rows: r[0], count: r[1][0].cnt}
            }
        }
        return res.json(result)
    }

    async getAllTypes(req, res) {
        let {searchType, name} = req.query
        let entitiesTypes = {}
        let limit = 30
        if (searchType === 'All') {
            entitiesTypes = await sequelize.query("SELECT * FROM twitter.entities_types where `show`=1 order by count desc", {type: QueryTypes.SELECT})
        } else if (searchType === 'One' && name) {
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