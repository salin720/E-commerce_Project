import {Col, Container, Row, Form, Image} from "react-bootstrap";
import {UserFormData, UserType} from "@/library/interfaces"
import {useDispatch, useSelector} from "react-redux"
import {useFormik} from "formik"
import {ProfileFormValidation} from "@/library/validations"
import {InputField, SubmitBtn} from "@/components";
import http from "@/http";
import {setUser} from "@/store";
import { useRef, useState } from "react";
import { imgUrl } from "@/library/function";
import { Password } from "./Password";

export const Edit: React.FC = ()=> {
    const user: UserType = useSelector((state: any) => state.user.value)
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const initialAvatar = user?.avatar ? (user.avatar.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${user.avatar}` : imgUrl(user.avatar) ) : "/avatar-default.png"
    const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatar)

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append("avatar", file)
        const { data } = await http.post('/profile/upload-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        setAvatarPreview(data.avatar ? imgUrl(data.avatar) : '/avatar-default.png')
        dispatch(setUser({ ...user, avatar: data.avatar }))
    }

    const handleRemoveAvatar = async () => {
        await http.delete('/profile/remove-avatar')
        setAvatarPreview('/avatar-default.png')
        dispatch(setUser({ ...user, avatar: null }))
    }

    const formik = useFormik({
        initialValues: {
            name: user?.name,
            phone: user?.phone,
            address: user?.address
        } as UserFormData,
        validationSchema: ProfileFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            http.patch('/profile/update', data)
                .then(({ data: resp }) => {
                    dispatch(setUser(resp.user || { ...user, ...data }))
                })
                .catch(({response: {data}}) => {
                    if(data?.validation){ formik.setErrors(data.validation) }
                })
                .finally(() => setSubmitting(false))
        }
    })
    return <Container><Row><Col className="my-3 py-4 bg-white rounded-4 shadow-sm border-soft"><div className="text-center mb-4 position-relative"><Image src={avatarPreview} roundedCircle width={108} height={108} className="border border-3 border-dark object-fit-cover" style={{objectFit:'cover'}} /><Form.Control ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarChange} /><div className="profile-avatar-actions cms-profile-actions"><button type="button" className="profile-icon-btn dark" onClick={() => fileInputRef.current?.click()}><i className="fa-solid fa-pen"></i></button>{user?.avatar && <button type="button" className="profile-icon-btn danger" onClick={handleRemoveAvatar}><i className="fa-solid fa-trash"></i></button>}</div><h1 className="mt-3 mb-1">Profile</h1><p className="text-muted mb-0">Manage your personal information and avatar here.</p></div><Form onSubmit={formik.handleSubmit}><InputField formik={formik} name="name" label="Name" /><InputField formik={formik} name="phone" label="Phone" /><InputField formik={formik} name="address" label="Address" as="textarea" /><SubmitBtn disabled={formik.isSubmitting} /></Form><div className="mt-5"><Password /></div></Col></Row></Container>
}
