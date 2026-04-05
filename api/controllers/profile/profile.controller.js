const {ErrorMessage, ValidationError} = require("@/library/functions");
const {User, Review, Order, Detail, Payment} = require('@/models');
const bcrypt = require('bcryptjs');
const {Types} = require("mongoose");
const { unlinkSync, existsSync } = require('node:fs')

class ProfileController {
    show = async  (req, res, next) => {
        res.send(req.user)
    }

    edit = async  (req, res, next) => {
        try {
            const {name, phone, address} = req.body
            await User.findByIdAndUpdate(req.user._id, {name, phone, address}, {runValidators: true})
            const user = await User.findById(req.user._id)
            res.send({ message: 'Account updated successfully.', user })
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    password = async  (req, res, next) => {
        try {
            const {oldPassword, password, confirmPassword} = req.body
            const user = await User.findById(req.user._id).select('+password')
            if (bcrypt.compareSync(oldPassword, user.password)) {
                if(password === confirmPassword) {
                    const hash = bcrypt.hashSync(password)
                    await User.findByIdAndUpdate(req.user._id, {password: hash})
                    res.send({ message: 'Password updated successfully.' })
                } else {
                    ValidationError(next, { password: 'The password is not confirmed' })
                }
            } else {
               ValidationError(next, { oldPassword: 'Old password is incorrect.' })
            }
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    reviews = async(req,res,next)=> {
        try {
            let reviews = await Review.aggregate()
                .match({'userId': new Types.ObjectId(req.user._id)})
                .lookup({from: 'products', localField: 'productId', foreignField: '_id', as: 'product'})
            for (let i in reviews){ reviews[i].product = reviews[i].product[0] }
            res.send(reviews)
        } catch (error) { ErrorMessage(next, error) }
    }

    orders = async(req,res,next)=> {
        try{
            let orders = await Order.find({userId: req.user._id}).sort({ createdAt: -1 }).lean()
            const orderIds = orders.map(item => item._id)
            const payments = orderIds.length ? await Payment.find({ orderId: { $in: orderIds.map(String) } }).lean() : []
            const paymentMap = new Map(payments.map(item => [String(item.orderId), item]))
            for (let i in orders) {
                let details = await Detail.aggregate()
                    .match({orderId: orders[i]._id})
                    .lookup({from: 'products', localField: 'productId', foreignField: '_id', as: 'product'})
                for (let j in details) { details[j].product = details[j].product[0] }
                orders[i] = { ...orders[i], details, payment: paymentMap.get(String(orders[i]._id)) || null }
            }
            res.send(orders)
        }catch (error) { ErrorMessage(next, error) }
    }


    deleteOrderHistory = async(req,res,next) => {
        try {
            const { id } = req.params
            const order = await Order.findOne({ _id: id, userId: req.user._id })
            if (!order) return next({ status: 404, message: 'Order not found.' })
            if (!(order.status === 'Delivered' && order.paymentStatus === 'Paid')) {
                return next({ status: 422, message: 'Only delivered and paid orders can be removed from history.' })
            }
            await Detail.deleteMany({ orderId: order._id })
            await Payment.deleteMany({ orderId: String(order._id) })
            await Order.findByIdAndDelete(order._id)
            res.send({ message: 'Order history deleted successfully.' })
        } catch (error) { ErrorMessage(next, error) }
    }

    uploadAvatar = async (req, res, next) => {
        try {
            if (!req.file) {
                return next({ status: 422, message: 'Please upload an image.' })
            }
            const user = await User.findById(req.user._id)
            if (user?.avatar && existsSync(`./uploads/${user.avatar}`)) {
                try { unlinkSync(`./uploads/${user.avatar}`) } catch {}
            }
            await User.findByIdAndUpdate(req.user._id, { avatar: req.file.filename })
            res.send({ message: 'Profile picture updated.', avatar: req.file.filename, avatarUrl: `/image/${req.file.filename}` })
        } catch (error) { ErrorMessage(next, error) }
    }

    removeAvatar = async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id)
            if (user?.avatar && existsSync(`./uploads/${user.avatar}`)) {
                try { unlinkSync(`./uploads/${user.avatar}`) } catch {}
            }
            await User.findByIdAndUpdate(req.user._id, { avatar: null })
            res.send({ message: 'Profile picture removed.' })
        } catch (error) { ErrorMessage(next, error) }
    }
}

module.exports = new ProfileController()
