const {Category, Brand, Order, Detail, Product} = require("@/models");
const {ErrorMessage, DataNotFound} = require("@/library/functions");

class MixController {
    categories = async function(req, res, next) {
        try{
            const category = await Category.find({status: true})

            res.send(category)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    categoryByID = async function(req, res, next) {
        try{
            const {id} = req.params

            const category = await Category.findById(id).where({status: true})

            if(category){
                res.send(category)
            }else{
                DataNotFound(next, "category")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    brands = async function(req, res, next) {
        try{
            const brands = await Brand.find({status: true})

            res.send(brands)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    brandByID = async function(req, res, next) {
        try{
            const {id} = req.params

            const brand = await Brand.findById(id)

            if(brand){
                res.send(brand)
            }else{
                DataNotFound(next, "Brand")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    checkout = async function(req, res, next) {
        try{
            const {cart} = req.body
            const order = await Order.create({userId: req.user._id, status: 'Processing'})

            for (let item of cart){
                // const product = await Product.findById(item.productId)
                // const price = product.discountedPrice > 0 ? product.discountedPrice : product.price

                const product = await Product.findById(item.productId)
                if (!product) {
                    return DataNotFound(next, `Product with ID ${item.productId} not found`)
                }
                const price = product.discountedPrice > 0 ? product.discountedPrice : product.price


                const total = price * item.qty

                await Detail.create({orderId: order._id, productId: product._id, qty: item.qty, price, total})
            }
            res.send({
                message: 'Thank you for your order. It will be confirmed soon.',
            })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    images = async function(req, res, next) {
        try {
            const {filename} = req.params

            res.sendFile(`uploads/${filename}`, {
                root: './'
                })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }
}

module.exports = new MixController