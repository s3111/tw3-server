//import * as sequelize from "sequelize";
//const { sequelize } = require('sequelize')
const jwt = require('jsonwebtoken')
const fs = require('fs')

const sequelize = require('../db')
const { Op } = require('sequelize')
const {User,ServicePrice} = require('../models/models')
const ApiError = require('../error/apiError')

class NewsController{
    async getAll(req,res){
        let allNews = {forum: [], blog: []}
        let {limit,page,searchType} = req.query
        const forumNewsFile = './forum_news.json'
        if(fs.existsSync(forumNewsFile)){
            try{
                let forumData = fs.readFileSync(forumNewsFile);
                allNews.forum = await JSON.parse(forumData);
            }catch (e) {
                console.log(e)
            }
        }else{
            console.log('No file')
        }
        return res.json(allNews)
    }
}
module.exports = new NewsController()