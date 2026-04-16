const {Order, Detail, Payment} = require('@/models');
const {ErrorMessage, DataNotFound} = require("@/library/functions");

class OrderController {
    index = async (req,res,next) => {
        try{
            let orders = await Order.aggregate()
                .lookup({from: 'users', localField: 'userId', foreignField: '_id', as: 'user'})
                .sort({ createdAt: -1 })

            const payments = await Payment.find().lean()
            const paymentMap = new Map(payments.map(item => [String(item.orderId), item]))

            for (let i in orders) {
                let details = await Detail.aggregate()
                    .match({'orderId': orders[i]._id})
                    .lookup({from: 'products', localField: 'productId', foreignField: '_id', as: 'product'})
                for (let j in details) { details[j].product = details[j].product[0] }
                orders[i]= { ...orders[i], details, user: orders[i].user[0], payment: paymentMap.get(String(orders[i]._id)) || null }
            }
            res.send(orders)
        } catch (error) { ErrorMessage(next, error) }
    }

    update = async (req,res,next) => {
        try{
            const {id} = req.params
            const  {status, paymentStatus, trackingCode, adminNote} = req.body
            const order = await Order.findById(id)
            if(order){
                const updateDoc = { ...(status ? {status} : {}), ...(trackingCode !== undefined ? {trackingCode} : {}), ...(adminNote !== undefined ? {adminNote} : {}) }
                if (paymentStatus && order.paymentMethod === 'COD') updateDoc.paymentStatus = paymentStatus
                await Order.findByIdAndUpdate(id, updateDoc, { runValidators: true })
                if (paymentStatus && order.paymentMethod === 'COD') {
                    await Payment.findOneAndUpdate({ orderId: id }, { status: paymentStatus }, { new: true, upsert: true })
                }
                res.send({ message:"Order Updated" })
            }else{ DataNotFound(next, "Order") }
        }catch (error) { ErrorMessage(next, error) }
    }

    destroy = async (req,res,next) => {
        try{
            const {id} = req.params
            const order = await Order.findById(id)
            if(order){
                await Detail.deleteMany({orderId: order._id})
                await Payment.deleteMany({orderId: String(order._id)})
                await Order.findByIdAndDelete(id)
                res.send({ message:"Order deleted" })
            }else{ DataNotFound(next, "order") }
        }catch (error) { ErrorMessage(next, error) }
    }
}

module.exports = new OrderController()
