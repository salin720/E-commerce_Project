const jwt = require('jsonwebtoken');
const {User} = require("@/models");
const multer = require('multer');
const path = require('path');

const auth = async (req, res, next) => {
    try {
        if('authorization' in req.headers && req.headers.authorization) {
            const token = req.headers.authorization.split(' ').pop()

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            const user = await User.findById(decoded.uid)

            if(user) {
                if(user.status) {
                    req.user = user

                    next()
                } else {
                    next({
                        status: 403,
                        message: 'Account is deactivated.',
                    })
                }
            } else {
                next({
                    status: 401,
                    message: 'Authentication token is invalid or expired.'
                })
            }
        } else  {
            next({
                status: 401,
                message: 'Authentication token missing.',
            })
        }
    } catch (error) {
        next({
            status: 401,
            message: 'Authentication token is invalid or expired.'
        })
    }
}

const cmsUsers = (req, res, next) => {
    if (req.user.role != 'Customer') {
        next()
    } else {
        next({
            status: 403,
            message: 'Access Denied.'
        })
    }
}

const adminOnly = (req, res, next) => {
    if (req.user.role == 'Admin') {
        next()
    } else {
        next({
            status: 403,
            message: 'Access Denied.'
        })
    }
}

const customerOnly = (req, res, next) => {
    if (req.user.role == 'Customer') {
        next()
    } else {
        next({
            status: 403,
            message: 'Access Denied.'
        })
    }
}

const upload = () => multer ({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads')
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname)
            const filename = Date.now() +'-' + Math.round(Math.random() * 1E9) +`${ext}`

            cb(null, filename)
        }
    }),
    fileFilter (req, file, cb) {
        if(file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(Error('Only image files are allowed!'))
        }
    }
})

module.exports = {auth, cmsUsers, adminOnly, customerOnly, upload}