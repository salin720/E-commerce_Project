const {ErrorMessage, ValidationError} = require("@/library/functions");

const { User } = require('@/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class LoginController{
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({email}).select('+password')

            if (user){
            if(user.status) {
                if (bcrypt.compareSync(password, user.password)) {
                    const token = jwt.sign({
                        uid: user._id,
                        iat: Math.floor(Date.now() / 1000),
                        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
                    }, process.env.JWT_SECRET)
                    res.send({
                        token,
                    })
                } else {
                    ValidationError(next, {
                        password: 'Password is incorrect',
                    })
                }
            } else {
                next({
                    status: 403,
                    message: 'Account is Deactivated',
                })

              }
            } else {
                ValidationError(next,{
                    email: 'Given email is not registered',
                })
            }

        } catch (error){
            ErrorMessage(next, error)
        }
    }
}

module.exports = new LoginController