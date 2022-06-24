const sequelize = require('../db')
const {DataTypes} = require('sequelize')
const Tweet = sequelize.define('tweets', {
    tw_id: {type: DataTypes.INTEGER, primaryKey: true, allowNull: false},
    entity_parsed: {type: DataTypes.INTEGER, allowNull: false},
    entity_updated: {type: DataTypes.INTEGER, allowNull: false},
    body: {type: DataTypes.TEXT},
    keyword: {type: DataTypes.STRING, defaultValue: ''},
    tweet_date: {type: DataTypes.DATE,},
    location: {type: DataTypes.STRING, defaultValue: ''},
    verified_user: {type: DataTypes.BOOLEAN, default: false},
    followers: {type: DataTypes.INTEGER, allowNull: false},
    sentiment: {type: DataTypes.FLOAT},
    is_quote_status: {type: DataTypes.BOOLEAN, default: false},
    quote_count: {type: DataTypes.INTEGER, allowNull: false},
    reply_count: {type: DataTypes.INTEGER, allowNull: false},
    retweet_count: {type: DataTypes.INTEGER, allowNull: false},
    favorite_count: {type: DataTypes.INTEGER, allowNull: false},
    favorited: {type: DataTypes.BOOLEAN, default: false},
    retweeted: {type: DataTypes.BOOLEAN, default: false},
    possibly_sensitive: {type: DataTypes.BOOLEAN, default: false},
    filter_level: {type: DataTypes.STRING, defaultValue: ''},
    lang: {type: DataTypes.STRING, defaultValue: ''},
    timestamp_ms: {type: DataTypes.INTEGER, allowNull: false},
}, {timestamps: false})

const Entity = sequelize.define('entities', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    type: {type: DataTypes.STRING},
    entity: {type: DataTypes.STRING},
}, {timestamps: false})

module.exports = {
    Tweet, Entity
}
