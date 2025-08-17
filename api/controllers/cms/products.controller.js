const {ErrorMessage, DataNotFound} = require("@/library/functions")
const {Product} = require('@/models')
const {unlinkSync} = require("node:fs")

class ProductController{
    index = async (req,res,next) => {
        try{
            let products = await Product.aggregate()
                .lookup({from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'})
                .lookup({from: 'brands', localField: 'brandId', foreignField: '_id', as: 'brand'})

            for( let i in products){
                products[i].category = products[i].category[0]
                products[i].brand = products[i].brand[0]
            }

            res.send(products)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    store = async (req,res,next) => {
        try{
            const{name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured } = req.body

            let images = []

            for(let file of req.files){
                images.push(file.filename)
            }

            await Product.create({name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured, images })

            res.status(201).send({
                message: 'Product added successfully'
            })
        } catch (error){
            ErrorMessage(next, error)
        }
    }

    show = async (req,res,next) => {
        try{
            const {id} = req.params

            const product = await Product.findById(id)

            if(product){
                res.send(product)
            }else{
                DataNotFound(next, "Product")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    update = async (req,res,next) => {
        try{
            const {id} = req.params

            const{name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured } = req.body

            const product = await Product.findById(id)

            if(product){
                let images = product.images

                if(req.files && req.files.length > 0){
                    for(let file of req.files){
                        images.push(file.filename)
                    }
                }else{

                }

                await Product.findByIdAndUpdate(id, {name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured, images},{runValidators: true})

                res.send({
                    message:"Product Updated",
                })
            }else{
                DataNotFound(next, "Product")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    destroy = async (req,res,next) => {
        try{
            const {id} = req.params

            const product = await Product.findById(id)

            if(product){

                for (let file of product.images) {
                    unlinkSync(`./uploads/${file}`)
                }

                await Product.findByIdAndDelete(id)

                res.send({
                    message:"Product deleted",
                })
            }else{
                DataNotFound(next, "Product")
            }

        }catch (error) {
            ErrorMessage(next, error)
        }
    }
    deleteImage = async (req,res,next) => {
        try{
            const {id, filename} = req.params

            const product = await Product.findById(id)

            if(product){
                if(product.images.length > 1){
                    unlinkSync(`./uploads/${filename}`)

                    const images =  product.images.filter((image) => image !== filename)

                    await Product.findByIdAndUpdate(id,{images})

                    res.send({
                        status: 'Product image deleted',
                    })
                } else {
                    next({
                        status: 403,
                        message: 'Product must have at least one image'
                    })
                }
            }else{
                DataNotFound(next, "product")
            }
        } catch (error){
            ErrorMessage(next, error)
        }
    }
}


module.exports = new ProductController()
