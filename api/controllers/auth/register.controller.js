const {ValidationError, ErrorMessage} = require("@/library/functions")
const {User} = require("@/models")
const bcrypt = require("bcryptjs")

class RegisterController {
    register = async  (req, res, next) =>{
        try{
            const {name, email, password, confirmPassword, phone, address} = req.body
            if(password === confirmPassword){
                const hash = bcrypt.hashSync(password)
                await User.create({name, email, password: hash, phone, address})
                res.status(201).send({
                    password: 'Thanks for registering! Please proceed to login.',
                })

            } else{
               ValidationError(next, {
                    password: 'Password not confirmed.'
                })
            }
        } catch (error) {
            ErrorMessage(next, error)
        }
    }
}
module.exports = new RegisterController