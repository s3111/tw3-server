//const {Tweet, Entity} = require('../models/models')
//const ApiError = require('../error/apiError')
//const moment = require('moment')
const { QueryTypes } = require('sequelize')
const sequelize = require('../db')
function median(data) {
    data.sort((a, b) => a - b);
    if (data.length % 2) {
        return data[Math.floor(data.length / 2)];
    } else {
        return (data[data.length / 2] + data[data.length / 2 - 1]) / 2;
    }
}


class StatController{
    async getAll(req,res){
        let {searchType, name,page,limit} = req.query
        let result = await Promise.all([
            sequelize.query(`select count(*) as cnt from tweets`,{type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from tweet_users`,{type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from tweet_entities`,{type: QueryTypes.SELECT}),
            sequelize.query(`select count(*) as cnt from entities`,{type: QueryTypes.SELECT}),
            sequelize.query(`SELECT date,count FROM statistic where typeId=1`,{type: QueryTypes.SELECT}),
        ])
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
    async getEntities(req,res){
        let {searchType, name,page,limit} = req.query
        /*
        SELECT a.id,a.entityId,b.entity,b.type,a.countTotal,a.countCurrent,a.countTweets,date_format(date,"%Y-%m-%d") as date
                FROM statistic_entities a
                left join entities b on a.entityId = b.id
         */
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
and max_date >= date_add(now(), interval -2 day))`,{type: QueryTypes.SELECT})

        let types = {}
        //let names={}
        //let dates = {}

        //let namesArr = ['Day']
        //let datesArr = []
        let result = {charts:{},entitiesChanges:{}}

        if(rows.length){
            for(let r in rows){
                if(!types[rows[r].type]){
                    types[rows[r].type] = {names: {},dates: {},namesArr: ['Day'],datesArr: []}
                }
                if(!types[rows[r].type].names[rows[r].entityId]){
                    types[rows[r].type].names[rows[r].entityId]=rows[r].entity
                    types[rows[r].type].namesArr.push(rows[r].entity)
                }

                if(! types[rows[r].type].dates[rows[r].date]) {
                    types[rows[r].type].dates[rows[r].date] = {}
                }
                types[rows[r].type].dates[rows[r].date][rows[r].entityId]=Math.floor(rows[r].countCurrent*10000/rows[r].countTweets)
            }
            for(let t in types){
                for(let d in types[t].dates){
                    //datesArr.push([rows[r].date])
                    let arr = [d]
                    for(let n in types[t].names){
                        if(types[t].dates[d][n]) arr.push(types[t].dates[d][n])
                        else arr.push(0)
                    }
                    types[t].datesArr.push(arr)
                }
                //console.log(types[t].dates,types[t].datesArr)
                //console.log(types[t].dates[types[t].dates.length -1],median(types[t].datesArr))
                //if(types[t].datesArr[types[t].datesArr.length -1] > median(types[t].datesArr))
                result.charts[t] = [types[t].namesArr, ...types[t].datesArr]
            }
        }

        //return res.json([namesArr, ...datesArr])
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
module.exports = new StatController()