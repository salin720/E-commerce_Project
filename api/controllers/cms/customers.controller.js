const {ErrorMessage, ValidationError, DataNotFound} = require("@/library/functions")
const {User} = require("@/models")
const bcrypt = require("bcryptjs")

class CustomerController {
    index = async (req, res, next) => {
        try {
            const customers = await User.find({role: 'Customer'})

            res.send(customers)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    store = async (req, res, next) => {
        try{
            const {name, email, password, confirmPassword, phone, address, status} = req.body

            if(password == confirmPassword) {
                const hash = bcrypt.hashSync(password)

                await User.create({name, email, phone, address, status, password: hash, role: 'Customer'})
                res.status(201).send({
                    message: 'Customer added successfully.',
                })

            } else {
                ValidationError(next, {
                    password: 'The password is not confirmed.',
                })
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    show = async (req, res, next) => {
        try {
            const {id} = req.params
            const customers = await User.findById(id).where({role: 'Customer'})

            if (customers) {
                res.send(customers)
            } else {
                DataNotFound(next, 'Customer')
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    update = async (req, res, next) => {
        try {
            const {id} = req.params
            const {name, phone, address, status} = req.body
            const customers = await User.findById(id).where({role: 'Customer'})

            if (customers) {
                await User.findByIdAndUpdate(id, {name, phone, address, status}, {runValidators: true})
                res.send({
                    message: 'Customer updated successfully.',
                })
            } else {
                DataNotFound(next, 'Customer')
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const {id} = req.params
            const customers = await User.findById(id).where({role: 'Customer'})

            if (customers) {
                await User.findByIdAndDelete(id)
                res.send({
                    message: 'Customer deleted successfully.',
                })
            } else {
                DataNotFound(next, 'Customer')
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

}
module.exports = new CustomerController