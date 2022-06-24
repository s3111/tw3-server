const {QueryTypes} = require('sequelize')
const sequelize = require('../db')

class TweetController {
    async getAll(req, res) {
        let {entity, limit, page, searchType, verified} = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        verified = parseInt(verified) || 0

        let verifiedSql1 = ''
        let verifiedSql2 = ''
        if (verified) {
            verifiedSql1 = 'and b.user_verified=1'
            verifiedSql2 = 'and b.user_verified=1'
        }
        console.log('verifiedSql1', verifiedSql1)
        let offset = page * limit - limit
        let tweets
        let count = 0
        let result
        if (searchType === 'Person') {
            console.log()
            let person_id = entity
            if (person_id) {
                let r = await Promise.all([
                    sequelize.query(`SELECT * FROM twitter.tweets where user_id=?
                        order by tw_id desc
                        limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT, replacements: [person_id]}),
                    sequelize.query(`SELECT count(*) as cnt
                        FROM twitter.tweets where user_id=?`,
                        {type: QueryTypes.SELECT, replacements: [person_id]})
                ])
                result = {rows: r[0], count: r[1][0].cnt}
            } else {
                result = {rows: [], count: 0}
            }
        } else if (searchType === 'Entity') {
            if (entity && entity !== 'All') {
                let r = await Promise.all([
                    sequelize.query(`select b.* , c.name, c.screen_name, c.profile_image_url_https
                        from (SELECT b.* FROM tweet_entities a, tweets b
                        where a.tweetId = b.tw_id ${verifiedSql1} and
                        a.entityId = (SELECT id FROM twitter.entities
                        where entity = ? limit 1)
                        order by b.tw_id desc
                        limit ${limit} offset ${offset}) b,
                        tweet_users c
                        where c.tw_id = b.user_id`, {type: QueryTypes.SELECT, replacements: [entity]}),
                    sequelize.query(`SELECT count(b.tw_id) as cnt FROM tweet_entities a, tweets b
                        where a.tweetId = b.tw_id ${verifiedSql2}  and
                        a.entityId = (SELECT id FROM twitter.entities
                        where entity = ? limit 1)`,
                        {type: QueryTypes.SELECT, replacements: [entity]})
                ])
                result = {rows: r[0], count: r[1][0].cnt}
            } else {
                let r = await Promise.all([
                    sequelize.query(`SELECT b.*, c.name,c.screen_name,c.profile_image_url_https
                        from tweets b 
                        left join tweet_users c on b.user_id = c.tw_id
                        where 1=1 ${verifiedSql1}
                        order by b.tw_id desc
                        limit ${limit} offset ${offset}`,
                        {type: QueryTypes.SELECT}),
                    sequelize.query(`SELECT count(*) as cnt from tweets b where 1=1 ${verifiedSql2}`,
                        {type: QueryTypes.SELECT})
                ])
                result = {rows: r[0], count: r[1][0].cnt}
            }
        }
        return res.json(result)
    }
}

module.exports = new TweetController()