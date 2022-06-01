const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user',{
    id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING,unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING,defaultValue:"USER"},
    balance: {type: DataTypes.INTEGER,allowNull:false,defaultValue:20},
    isActivated:{type: DataTypes.BOOLEAN, default: false},
    activationLink:{type: DataTypes.STRING},
    resetPassLink:{type: DataTypes.STRING},
    //gaCID:{type: DataTypes.STRING},
})

const ClientID = sequelize.define('user_clientID',{
    //id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    gaCID: {type: DataTypes.STRING},
    email: {type: DataTypes.STRING},
    seen: {type: DataTypes.STRING}
})

const ServicePrice = sequelize.define('prices_services',{
    id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    service: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER}
},{ timestamps: false })

const Bot = sequelize.define('Bots',{
    id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    server: {type: DataTypes.STRING},
    login: {type: DataTypes.STRING},
    pass: {type: DataTypes.STRING},
    ban: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
    can_spam: {type: DataTypes.INTEGER,allowNull:false,defaultValue:5},
    pool: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
    conf:{type: DataTypes.TEXT},
    game_conf:{type: DataTypes.TEXT},
    game_events:{type: DataTypes.TEXT},
    game_stat:{type: DataTypes.TEXT},

    created_by:{type: DataTypes.INTEGER},

    proxy:{type: DataTypes.TEXT},
    //proxy_ip:{type: DataTypes.STRING},
    //proxy_port:{type: DataTypes.INTEGER},
    //proxy_login:{type: DataTypes.STRING},
    //proxy_pass:{type: DataTypes.STRING},
    //proxy_type:{type: DataTypes.STRING},

    createdAt: { field: 'created_at', type: DataTypes.DATE, },
    updatedAt: { field: 'updated_at', type: DataTypes.DATE, },
},{
    paranoid: true,
    deletedAt: 'deleted_at'
})

const BotLog = sequelize.define('Bots_log',{
        id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
        bot_id: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
        event: {type: DataTypes.STRING},
        date: { field: 'date', type: DataTypes.DATE, },
        webShow: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
        event_type: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
        event_status: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
},{ timestamps: false, tableName: 'Bots_log' }
)

const Payment = sequelize.define('user_payment',{
    id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING},
    amount: {type: DataTypes.DECIMAL,allowNull:false,defaultValue:0},
    points: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
    item_number:{type: DataTypes.STRING},
    verification: {type: DataTypes.STRING,unique: true,allowNull:false},
})

const UserSpent = sequelize.define('user_spent',{
    id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING},
    amount: {type: DataTypes.DECIMAL,allowNull:false,defaultValue:0},
    balance: {type: DataTypes.INTEGER,allowNull:false,defaultValue:0},
    operation:{type: DataTypes.STRING},
    operation_info:{type: DataTypes.STRING},
})

const Tweet = sequelize.define('tweets',{
    tw_id: {type: DataTypes.INTEGER,primaryKey: true, allowNull:false},
    entity_parsed: {type: DataTypes.INTEGER,allowNull:false},
    entity_updated: {type: DataTypes.INTEGER,allowNull:false},
    body:{type: DataTypes.TEXT},
    keyword: {type: DataTypes.STRING,defaultValue: ''},
    tweet_date: {type: DataTypes.DATE, },
    location: {type: DataTypes.STRING,defaultValue: ''},
    verified_user:{type: DataTypes.BOOLEAN, default: false},
    followers: {type: DataTypes.INTEGER,allowNull:false},
    sentiment: {type: DataTypes.FLOAT},
    is_quote_status:{type: DataTypes.BOOLEAN, default: false},
    quote_count: {type: DataTypes.INTEGER,allowNull:false},
    reply_count: {type: DataTypes.INTEGER,allowNull:false},
    retweet_count: {type: DataTypes.INTEGER,allowNull:false},
    favorite_count: {type: DataTypes.INTEGER,allowNull:false},
    favorited:{type: DataTypes.BOOLEAN, default: false},
    retweeted:{type: DataTypes.BOOLEAN, default: false},
    possibly_sensitive:{type: DataTypes.BOOLEAN, default: false},
    filter_level: {type: DataTypes.STRING,defaultValue: ''},
    lang: {type: DataTypes.STRING,defaultValue: ''},
    timestamp_ms: {type: DataTypes.INTEGER,allowNull:false},
},{timestamps: false})
const Entity = sequelize.define('entities',{
    id: {type: DataTypes.INTEGER,primaryKey: true, autoIncrement: true},
    type: {type: DataTypes.STRING},
    entity:{type: DataTypes.STRING},
},{ timestamps: false })

const Elephant = sequelize.define('elephant',{
    x: {type: DataTypes.INTEGER,allowNull:false},
    y: {type: DataTypes.INTEGER,allowNull:false},
    elephants: {type: DataTypes.INTEGER,allowNull:false},
    t31: {type: DataTypes.INTEGER},
    t32: {type: DataTypes.INTEGER},
    t33: {type: DataTypes.INTEGER},
    t34: {type: DataTypes.INTEGER},
    t35: {type: DataTypes.INTEGER},
    t36: {type: DataTypes.INTEGER},
    t37: {type: DataTypes.INTEGER},
    t38: {type: DataTypes.INTEGER},
    t39: {type: DataTypes.INTEGER},
    t40: {type: DataTypes.INTEGER},
},{ timestamps: false })

//Tweet.hasMany(Entity)
//Entity.hasMany(Tweet)


User.hasMany(Payment)
Payment.belongsTo(User)

User.hasMany(UserSpent)
UserSpent.belongsTo(User)

User.hasMany(ClientID)
ClientID.belongsTo(User)

User.hasMany(Bot)
Bot.belongsTo(User)

module.exports = {
    User, UserSpent, Payment, ClientID, ServicePrice, Tweet, Entity
}
