const {Category, Brand, Order, Detail, Product, Payment} = require("@/models");
const {ErrorMessage, DataNotFound} = require("@/library/functions");

class MixController {
    categories = async function(req, res, next) {
        try{ res.send(await Category.find({status: true})) } catch (error) { ErrorMessage(next, error) }
    }
    categoryByID = async function(req, res, next) {
        try{
            const {id} = req.params
            const category = await Category.findById(id).where({status: true})
            if(category){ res.send(category) }else{ DataNotFound(next, "category") }
        }catch (error) { ErrorMessage(next, error) }
    }
    brands = async function(req, res, next) {
        try{ res.send(await Brand.find({status: true})) } catch (error) { ErrorMessage(next, error) }
    }
    brandByID = async function(req, res, next) {
        try{
            const {id} = req.params
            const brand = await Brand.findById(id)
            if(brand){ res.send(brand) }else{ DataNotFound(next, "Brand") }
        }catch (error) { ErrorMessage(next, error) }
    }
    checkout = async function(req, res, next) {
        try{
            const {cart, paymentMethod = 'COD'} = req.body
            const method = paymentMethod === 'eSewa' ? 'eSewa' : 'COD'
            const order = await Order.create({userId: req.user._id, status: method === 'COD' ? 'Confirmed' : 'Processing', paymentMethod: method, paymentStatus: method === 'COD' ? 'Pending' : 'Pending'})
            let amount = 0
            for (let item of cart){
                const product = await Product.findById(item.productId)
                if (!product) return DataNotFound(next, `Product with ID ${item.productId} not found`)
                if ((product.stock || 0) < Number(item.qty || 0)) {
                    return next({ status: 422, message: `${product.name} does not have enough stock.` })
                }
                const price = product.discountedPrice > 0 ? product.discountedPrice : product.price
                const total = price * item.qty
                amount += total
                await Detail.create({orderId: order._id, productId: product._id, qty: item.qty, price, total, selectedSize: item.selectedSize || '', selectedColor: item.selectedColor || ''})
                await Product.findByIdAndUpdate(product._id, { $inc: { stock: -Number(item.qty || 0), totalSold: method === 'COD' ? Number(item.qty || 0) : 0 } })
            }
            await Payment.findOneAndUpdate(
                { orderId: String(order._id) },
                { orderId: String(order._id), userId: req.user._id, amount, status: method === 'COD' ? 'Pending' : 'Pending' },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
            res.send({ message: method === 'COD' ? 'Order placed successfully. Cash on Delivery pending.' : 'Order created. Continue to payment.', orderId: order._id })
        } catch (error) { ErrorMessage(next, error) }
    }
    images = async function(req, res, next) {
        try { res.sendFile(`uploads/${req.params.filename}`, { root: './' }) } catch (error) { ErrorMessage(next, error) }
    }
}
module.exports = new MixController()
