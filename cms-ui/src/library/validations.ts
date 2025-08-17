import * as Yup from 'yup'
import YupPassword from 'yup-password'

YupPassword(Yup)

export const LoginFormValidation = Yup.object({
    email: Yup.string().required().email(),
    password: Yup.string().required()
})

export const ProfileFormValidation = Yup.object({
    name: Yup.string().required(),
    phone: Yup.string().required(),
    address: Yup.string().required()
})

export const PasswordFormValidation = Yup.object({
    oldPassword: Yup.string().required(),
    password: Yup.string().required()
        .minLowercase(1).minUppercase(1)
        .minNumbers(1).minSymbols(1),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password')], 'Password not match'),
})

export const UserFormValidation = Yup.object({
    name: Yup.string().required(),
    phone: Yup.string().required(),
    address: Yup.string().required(),
    email: Yup.string().required().email(),
    status: Yup.number().required(),
    password: Yup.string().required()
        .minLowercase(1).minUppercase(1)
        .minNumbers(1).minSymbols(1),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password')], 'Password not match'),
})

export const UserEditFormValidation = Yup.object({
    name: Yup.string().required(),
    phone: Yup.string().required(),
    address: Yup.string().required(),
    status: Yup.number().required()
})

export const ProductFormValidation = Yup.object({
    name: Yup.string().required(),
    description: Yup.string().required(),
    shortDescription: Yup.string().required(),
    price: Yup.number().required(),
    discountedPrice: Yup.number().required(),
    categoryId: Yup.string().required(),
    brandId: Yup.string().required(),
    status: Yup.number().required(),
    featured: Yup.string().required(),
    images: Yup.mixed()
        .test('imgCount', 'choose at least one image', (list: any) => list !=null && list.length > 0)
        .test('imgType', 'all files must be a valid image', (list: any) => {
            if(list != null) {
                for(let img of list) {
                    if(!img.type.startsWith('image')) {
                        return false
                    }
                }
            }

            return true
        })
})

export const ProductEditFormValidation = Yup.object({
    name: Yup.string().required(),
    description: Yup.string().required(),
    shortDescription: Yup.string().required(),
    price: Yup.number().required(),
    discountedPrice: Yup.number().required(),
    categoryId: Yup.string().required(),
    brandId: Yup.string().required(),
    status: Yup.number().required(),
    featured: Yup.string().required(),
    images: Yup.mixed()
        .test('imgType', 'all files must be a valid image', (list: any) => {
            if(list != null) {
                for(let img of list) {
                    if(!img.type.startsWith('image')) {
                        return false
                    }
                }
            }

            return true
        })
})

