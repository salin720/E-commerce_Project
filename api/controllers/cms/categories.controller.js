const {Category} = require('@/models');
const {ErrorMessage, DataNotFound} = require("@/library/functions");


class CategoriesController {
    index = async (req,res,next) => {
        try{
            const category = await Category.find()

            res.send(category)
        } catch (error) {
            ErrorMessage(next, error)
        }
    }

    store = async (req,res,next) => {
        try{
            const{name, status} = req.body
            const image = req.file ? req.file.filename : null

            await Category.create({name, status, image})

            res.status(201).send({
                message: 'Category added successfully'
            })
        } catch (error){
            ErrorMessage(next, error)
        }
    }

    show = async (req,res,next) => {
        try{
            const {id} = req.params

            const category = await Category.findById(id)

            if(category){
                res.send(category)
            }else{
                DataNotFound(next, "category")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    update = async (req,res,next) => {
        try{
            const {id} = req.params

            const  {name, status} = req.body
            const image = req.file ? req.file.filename : undefined

            const category = await Category.findById(id)

            if(category){
                await Category.findByIdAndUpdate(id, {name, status, ...(image !== undefined ? { image } : {})},{runValidators: true})

                res.send({
                    message:"Category Updated",
                })
            }else{
                DataNotFound(next, "Category")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }

    destroy = async (req,res,next) => {
        try{
            const {id} = req.params

            const category = await Category.findById(id)

            if(category){
                await Category.findByIdAndDelete(id)

                res.send({
                    message:"Category deleted",
                })
            }else{
                DataNotFound(next, "category")
            }
        }catch (error) {
            ErrorMessage(next, error)
        }
    }
}


module.exports = new CategoriesController()
