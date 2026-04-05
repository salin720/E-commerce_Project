const {ErrorMessage, DataNotFound} = require("@/library/functions")
const {Product} = require('@/models')
const {unlinkSync, existsSync} = require("node:fs")

class ProductController{
    index = async (req,res,next) => {
        try{
            let products = await Product.aggregate()
                .lookup({from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'})
                .lookup({from: 'brands', localField: 'brandId', foreignField: '_id', as: 'brand'})
                .sort({ createdAt: -1 })
            for( let i in products){
                products[i].category = products[i].category[0]
                products[i].brand = products[i].brand[0]
            }
            res.send(products)
        } catch (error) { ErrorMessage(next, error) }
    }

    store = async (req,res,next) => {
        try{
            const{name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured, stock, sizes, colors } = req.body
            let images = []
            for(let file of (req.files || [])){ images.push(file.filename) }
            const effectivePrice = Number(discountedPrice) > 0 ? Number(discountedPrice) : Number(price)
            await Product.create({name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured, stock: Math.max(1, Number(stock || 1)), images, sizes: String(sizes || '').split(',').map((item) => item.trim()).filter(Boolean), colors: String(colors || '').split(',').map((item) => item.trim()).filter(Boolean), priceHistory: effectivePrice > 0 ? [{ price: effectivePrice, recordedAt: new Date() }] : [] })
            res.status(201).send({ message: 'Product added successfully' })
        } catch (error){ ErrorMessage(next, error) }
    }

    show = async (req,res,next) => {
        try{
            const {id} = req.params
            const product = await Product.findById(id)
            if(product){ res.send(product) } else { DataNotFound(next, "Product") }
        }catch (error) { ErrorMessage(next, error) }
    }

    update = async (req,res,next) => {
        try{
            const {id} = req.params
            const{name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured, stock, sizes, colors } = req.body
            const product = await Product.findById(id)
            if(product){
                let images = product.images || []
                if(req.files && req.files.length > 0){
                    for(let file of req.files){ images.push(file.filename) }
                }
                const oldEffectivePrice = Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : Number(product.price)
                const newEffectivePrice = Number(discountedPrice) > 0 ? Number(discountedPrice) : Number(price)
                const priceHistory = Array.isArray(product.priceHistory) ? [...product.priceHistory] : []
                if (!priceHistory.length && oldEffectivePrice > 0) {
                    priceHistory.push({ price: oldEffectivePrice, recordedAt: product.updatedAt || product.createdAt || new Date() })
                }
                const lastHistoryPrice = priceHistory.length ? Number(priceHistory[priceHistory.length - 1].price) : 0
                if (newEffectivePrice > 0 && Number(newEffectivePrice) !== Number(lastHistoryPrice)) {
                    priceHistory.push({ price: newEffectivePrice, recordedAt: new Date() })
                }
                await Product.findByIdAndUpdate(id, {name, status, description, shortDescription, price, discountedPrice, categoryId, brandId, featured, stock: Math.max(1, Number(stock || 1)), images, sizes: String(sizes || '').split(',').map((item) => item.trim()).filter(Boolean), colors: String(colors || '').split(',').map((item) => item.trim()).filter(Boolean), priceHistory},{runValidators: true})
                res.send({ message:"Product Updated" })
            }else{ DataNotFound(next, "Product") }
        }catch (error) { ErrorMessage(next, error) }
    }

    destroy = async (req,res,next) => {
        try{
            const {id} = req.params
            const product = await Product.findById(id)
            if(product){
                for (let file of product.images || []) {
                    if (existsSync(`./uploads/${file}`)) unlinkSync(`./uploads/${file}`)
                }
                await Product.findByIdAndDelete(id)
                res.send({ message:"Product deleted" })
            }else{ DataNotFound(next, "Product") }
        }catch (error) { ErrorMessage(next, error) }
    }
    deleteImage = async (req,res,next) => {
        try{
            const {id, filename} = req.params
            const product = await Product.findById(id)
            if(product){
                if(product.images.length > 1){
                    if (existsSync(`./uploads/${filename}`)) unlinkSync(`./uploads/${filename}`)
                    const images =  product.images.filter((image) => image !== filename)
                    await Product.findByIdAndUpdate(id,{images})
                    res.send({ status: 'Product image deleted' })
                } else {
                    next({ status: 403, message: 'Product must have at least one image' })
                }
            }else{ DataNotFound(next, "product") }
        } catch (error){ ErrorMessage(next, error) }
    }
}
module.exports = new ProductController()
