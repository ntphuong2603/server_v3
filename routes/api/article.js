const express = require('express')
const { sortArgsHelper } = require('../../config/helper')
const { checkUserID } = require('../../middleware/auth')
const { grantAccess, ACTION, RESOURCE } = require('../../middleware/roles')
const router = express.Router()

const { Article } = require('../../models/article-model')

router.route('/admin/add_article')
    .post(checkUserID, grantAccess(ACTION.CREATE_ANY, RESOURCE.ARTICLE) ,async (req, res)=>{
        try {
            const article = new Article({
                ...req.body,
                score: parseInt(req.body.score)
            })
            const result = await article.save()

            // if (!result) return res.status(400)
            res.status(200).json(result)
        } catch (error){
            res.status(400).json({message: error})
        }
    })

router.route('/admin/:id')
    .get(checkUserID, grantAccess(ACTION.READ_ANY, RESOURCE.ARTICLE) ,async (req, res)=>{
        try {
            const _id = req.params.id
            const article = await Article.findById(_id)
            if (!article || article.length == 0){
                return res.status(400).json({message:'Article not found'})
            }
            return res.status(200).json(article)
        } catch (error){
            res.status(400).json({message: error})
        }
    })
    .patch(checkUserID, grantAccess(ACTION.UPDATE_ANY, RESOURCE.ARTICLE) ,async (req, res)=>{
        try {
            const _id = req.params.id
            const article = await Article.findOneAndUpdate({
                _id
            },{
                "$set": req.body
            },{
                new: true
            })
            if (!article){
                return res.status(400).json({message:'Article not found'})
            }
            return res.status(200).json({message: 'ok'})
        } catch (error){
            res.status(400).json({message: error})
        }
    })
    .delete(checkUserID, grantAccess(ACTION.DELETE_ANY, RESOURCE.ARTICLE) ,async (req, res)=>{
        try {
            return res.status(200).json({message:'ok'})
        } catch (error){
            res.status(400).json({message: error})
        }
    })

router.route('/get-article-by-id/:id')
    .get(async (req, res)=>{
        try {
            const _id = req.params.id
            const article = await Article.findById({_id:_id, status:'public'})
            if (!article || article.length === 0){
                return res.status(400).json({message:'Article not found'})
            } 
            res.status(200).json(article)
        } catch (error){
            res.status(400).json({message: error})
        }
    })

router.route('/admin/pagination')
    .post(checkUserID, grantAccess(ACTION.DELETE_ANY, RESOURCE.ARTICLE), async (req, res)=>{
        try {
            const limit = req.body.limit ? req.body.limit : 5
            const query = Article.aggregate();
            const options = {
                page: req.body.page,
                limit,
                sort: {
                    _id: 'desc'
                }
            }
            const artilces = await Article.aggregatePaginate(query, options)

            res.status(200).json(artilces)
        } catch (error){
            res.status(400).json({message: error})
        }
    })

router.route('/loadmore')
    .post(async (req, res)=>{
        try {
            const sortArgs = sortArgsHelper(req.body)

            const articles = await Article
                .find({status:'public'})
                .sort([[sortArgs.sortBy, sortArgs.order]])
                .skip(sortArgs.skip)
                .limit(sortArgs.limit)

            res.status(200).json(articles)

        } catch (error){
            res.status(400).json({message: error})
        }
    })

module.exports = router