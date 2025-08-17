const {Order, Detail} = require('@/models');
const {ErrorMessage, DataNotFound} = require("@/library/functions");



class OrderController {
    index = async (req,res,next) => {
        try{
            let orders = await Order.aggregate()
                .lookup({from: 'users', localField: 'userId', foreignField: '_id', as: 'user'})

            for (let i in orders) {
                let details = await Detail.aggregate()
                    .match({'orderId': orders[i]._id})
                    .lookup({from: 'products', localField: 'productId', foreignField: '_id', as: 'product'})
                for (let j in details) {
                    details[j].product = details[j].product[0]
                }
                orders[i]= {
                    ...orders[i],
                    details,
                    user: orders[i].user[0]
                }
            }
            res.send(orders)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    update = async (req,res,next) => {
        try{
            const {id} = req.params

            const  {status} = req.body

            const orders = await Order.findById(id)

            if(orders){
                await Order.findByIdAndUpdate(id, {status},{runValidators: true})

                res.send({
                    message:"Order Updated",
                })
            }else{
                DataNotFound(next, "Order")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    destroy = async (req,res,next) => {
        try{
            const {id} = req.params

            const orders = await Order.findById(id)

            if(orders){
                await Detail.deleteMany({orderId: orders._id})
                await Order.findByIdAndDelete(id)

                res.send({
                    message:"Order deleted",
                })
            }else{
                DataNotFound(next, "order")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }
}

module.exports = new OrderController()
