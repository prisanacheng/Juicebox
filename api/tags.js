const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db')



tagsRouter.get('/:tagName/posts', async (req,res, next) => {
    const { tagName } = req.params
    try{
        const postTags = await getPostsByTagName(tagName)
        const filteredTags = postTags.filter(post=>{
           
            return post.active && (req.user && post.author.id === req.user.id);
        })
        res.send({filteredTags})
    } catch({name, message}){
        next({
            name: "UnauthorizedUserError",
            message: "you cannot update a post that is not yours"
        })
    }
})






module.exports = tagsRouter