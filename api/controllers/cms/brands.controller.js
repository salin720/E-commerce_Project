const {Brand} = require('@/models');
const {ErrorMessage, ValidationError, SameName, DataNotFound} = require("@/library/functions");
const bcrypt = require("bcryptjs");

class brandsController {
    index = async (req,res,next) => {
        try{
            const brand = await Brand.find()

            res.send(brand)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    store = async (req,res,next) => {
        try{
            const{name, status} = req.body

            await Brand.create({name, status})

            res.status(201).send({
                message: 'Brand added successfully'
            })
        } catch (error){
            next({
                message: 'same name',
                status: 400
            })
        }
    }

    show = async (req,res,next) => {
        try{
            const {id} = req.params

            const brand = await Brand.findById(id)

            if(brand){
                res.send(brand)
            }else{
                DataNotFound(next, "brand")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    update = async (req,res,next) => {
        try{
            const {id} = req.params

            const  {name, status} = req.body

            const brand = await Brand.findById(id)

            if(brand){
                await Brand.findByIdAndUpdate(id, {name, status},{runValidators: true})

                res.send({
                    message:"Brand Updated",
                })
            }else{
                DataNotFound(next, "Brand")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    destroy = async (req,res,next) => {
        try{
            const {id} = req.params

            const brand = await Brand.findById(id)

            if(brand){
                await Brand.findByIdAndDelete(id)

                res.send({
                    message:"Brand deleted",
                })
            }else{
                DataNotFound(next, "brand")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }
}


module.exports = new brandsController()
