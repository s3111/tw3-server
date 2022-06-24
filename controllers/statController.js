const {QueryTypes} = require('sequelize')
const sequelize = require('../db')

class StatController {
    async getAll(req, res) {
        //let {searchType, name, page, limit} = req.query
        let result = await Promise.all([
            sequelize.query(`select count(*) as cnt from tweets`, {type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from tweet_users`, {type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from tweet_entities`, {type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from entities`, {type: QueryTypes.SELECT}),
            sequelize.query(`SELECT date,count FROM statistic where typeId=1`, {type: QueryTypes.SELECT}),
        ])
        return res.json({
            tweets: result[0][0].cnt,
            persons: result[1][0].cnt,
            tweetEntities: result[2][0].cnt,
            entities: result[3][0].cnt,
            timeFrames: {
                tweets: Object.keys(result[4]).map(k => {
                    return [result[4][k].date, result[4][k].count]
                })
            }
        })
    }

    async getReport(req, res) {
        //let {searchType, name, page, limit} = req.query
        let rows = await sequelize.query(`SELECT a.id,a.entityId,b.entity,b.type,a.countTotal,a.countCurrent,a.countTweets,date_format(date,"%Y-%m-%d") as date
            FROM statistic_entities a
            left join entities b on a.entityId = b.id
            where date >= date_add(now(), interval -10 day) and
            entityId in (select a.entityId from
            (SELECT entityId,max(date) as max_date, round(avg(entityWeight)) as avgWeight
            FROM statistic_entities
            where date >= date_add(now(), interval -10 day)
            group by entityId) as a
            inner join statistic_entities b on a.entityId = b.entityId and a.max_date=b.date
            where entityWeight/avgWeight > 1.2 
            and max_date >= date_add(now(), interval -2 day))`, {type: QueryTypes.SELECT})
        let types = {}
        let result = {charts: {}, entitiesChanges: {}}
        if (rows.length) {
            for (let r in rows) {
                if (!types[rows[r].type]) {
                    types[rows[r].type] = {names: {}, dates: {}, namesArr: ['Day'], datesArr: []}
                }
                if (!types[rows[r].type].names[rows[r].entityId]) {
                    types[rows[r].type].names[rows[r].entityId] = rows[r].entity
                    types[rows[r].type].namesArr.push(rows[r].entity)
                }

                if (!types[rows[r].type].dates[rows[r].date]) {
                    types[rows[r].type].dates[rows[r].date] = {}
                }
                types[rows[r].type].dates[rows[r].date][rows[r].entityId] = Math.floor(rows[r].countCurrent * 10000 / rows[r].countTweets)
            }
            for (let t in types) {
                for (let d in types[t].dates) {
                    let arr = [d]
                    for (let n in types[t].names) {
                        if (types[t].dates[d][n]) arr.push(types[t].dates[d][n])
                        else arr.push(0)
                    }
                    types[t].datesArr.push(arr)
                }
                result.charts[t] = [types[t].namesArr, ...types[t].datesArr]
            }
        }
        return res.json(result)
    }

    async getTopEntities(req, res) {
        //let {searchType, name, page, limit} = req.query
        let rows = await sequelize.query(`select a.entityId, a.avgWeight, a.countCurrent, b.entityWeight, b.entityWeight/a.avgWeight as weightIndex, c.entity, c.type from
            (SELECT entityId,max(date) as max_date, round(avg(entityWeight)) as avgWeight,countCurrent
            FROM statistic_entities
            where date >= date_add(now(), interval -10 day)
            group by entityId) as a
            inner join statistic_entities b on a.entityId = b.entityId and a.max_date=b.date
            inner join entities c on a.entityId = c.id
            where entityWeight/avgWeight > 1.3 
            and max_date >= date_add(now(), interval -2 day)
            order by countCurrent desc limit 10`, {type: QueryTypes.SELECT})
        return res.json(rows)
    }
}

module.exports = new StatController()

