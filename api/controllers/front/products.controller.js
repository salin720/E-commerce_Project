const {ErrorMessage, DataNotFound} = require('@/library/functions')
const {Product, Review} = require('@/models')
const mongoose = require('mongoose')
const {Types} = require("mongoose");

class ProductCtrl {
    latest = async (req, res, next) => {
        try {
            const latest = await Product.find({status: true}).sort({createdAt: 'desc'})
            res.send({latest})
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    featured = async (req, res, next) => {
        try {
            const featured = await Product.find({status: true, featured: true})
            res.send({featured})
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    topSelling = async (req, res, next) => {
        try {
            let topSelling = await Product.aggregate()
                .match({status: true})
                .lookup({from: 'details', localField: '_id', foreignField: 'productId', as: 'details_Count'})
                .addFields({details_count: {$size: '$details_Count'}})
            res.send({topSelling})
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    productByID = async (req, res, next) => {
        try {
            const {id} = req.params
            let product = await Product.aggregate()
                .match({status: true, _id: new Types.ObjectId(id)})
                .lookup({from: 'brands', localField: 'brandId', foreignField: '_id', as: 'brand'})

            product = product[0]

            if(product){
                let reviews = await Review.aggregate()
                    .match({productId: new mongoose.Types.ObjectId(id)})
                    .lookup({from: 'users', localField: 'userId', foreignField: '_id', as: 'user'})
                for (let i in reviews){
                    reviews[i].user = reviews[i].user[0]
                }
                product = {
                    ...product,
                    brand: product.brand[0],
                    reviews}
            } else{
                DataNotFound(next, "Product")
            }
            res.send({product})
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    productByCategoryID = async (req, res, next) => {
        try {
            const {id} = req.params
           const products = await Product.find({status: true, categoryId: id})
            res.send(products)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    productByBrandID = async (req, res, next) => {
        try {
            const {id} = req.params
            const products = await Product.find({status: true, brandId: id})
            res.send(products)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }


    search = async (req, res, next) => {
        const {term} = req.query
        try {
            const product = await Product.find({status: true, name: {$regex: term, $options: 'i'}})
            res.send({product})
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    similar = async (req, res, next) => {
        try {
            const {id} = req.params
            const product = await Product.findById(id)
            const similar = await Product.find({status: true, categoryId: product.categoryId, _id: {$ne: id}})
            res.send({similar})
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    review = async (req, res, next) => {
        try {
            const {id} = req.params
            const {rating, comment} = req.body
            await Review.create({productId: id, rating, comment, userId: req.user._id})
            res.send({
                message: 'Thank you for your review!'
            })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }
}

module.exports = new ProductCtrl