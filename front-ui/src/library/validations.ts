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
    password: Yup.string().required()
        .minLowercase(1).minUppercase(1)
        .minNumbers(1).minSymbols(1),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password')], 'Password not confirmed'),
})