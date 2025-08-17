const {ErrorMessage, ValidationError, DataNotFound} = require("@/library/functions")
const {User} = require("@/models")
const bcrypt = require("bcryptjs")

class StaffsController {
    index = async (req, res, next) => {
        try {
            const staffs = await User.find({role: 'Staff'})

            res.send(staffs)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    store = async (req, res, next) => {
        try{
            const {name, email, password, confirmPassword, phone, address, status} = req.body

            if(password == confirmPassword) {
                const hash = bcrypt.hashSync(password)

                await User.create({name, email, phone, address, status, password: hash, role: 'Staff'})
                res.status(201).send({
                    message: 'Staff added successfully.',
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
            const staff = await User.findById(id).where({role: 'Staff'})

            if (staff) {
                res.send(staff)
            } else {
               DataNotFound(next, 'Staff')
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    update = async (req, res, next) => {
        try {
            const {id} = req.params
            const {name, phone, address, status} = req.body
            const staff = await User.findById(id).where({role: 'Staff'})

            if (staff) {
                await User.findByIdAndUpdate(id, {name, phone, address, status}, {runValidators: true})
                res.send({
                    message: 'Staff updated successfully.',
                })
            } else {
                DataNotFound(next, 'Staff')
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    destroy = async (req, res, next) => {
        try {
            const {id} = req.params
            const staff = await User.findById(id).where({role: 'Staff'})

            if (staff) {
                await User.findByIdAndDelete(id)
                res.send({
                    message: 'Staff deleted successfully.',
                })
            } else {
                DataNotFound(next, 'Staff')
            }

        } catch (error) {
            ErrorMessage(next, error)
        }
    }

}
module.exports = new StaffsController