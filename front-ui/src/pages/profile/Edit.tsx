import {UserFormData, UserType} from "@/library/interfaces"
import {useDispatch} from "react-redux";
import {useFormik} from "formik";
import {ProfileFormValidation} from "@/library/validations.ts";
import http from "@/http";
import {setUser} from "@/store";
import {InputField, SubmitBtn} from "@/components";
import {Form} from "react-bootstrap";

export const Edit: React.FC<{user: UserType}> = ({user}) => {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            name: user?.name,
            phone: user?.phone,
            address: user?.address
        } as UserFormData,
        validationSchema: ProfileFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            http.patch('/profile/update', data)
                .then(() => {
                    return http.get(`/profile/details`)
                })
                .then(() => {
                    dispatch(setUser(data))
                })
                .catch(({response: {data}}) => {
                    if(data?.validation){
                        formik.setErrors(data.validation)
                    }
                })
                .finally(() => {
                    setSubmitting(false)
                })
        }
    })

    return <>
        <Form onSubmit={formik.handleSubmit}>

            <InputField formik={formik} name="name" label="Name" />

            <InputField formik={formik} name="phone" label="Phone" />

            <InputField formik={formik} name="address" label="Address" as="textarea" />

            <SubmitBtn disabled={formik.isSubmitting} />
        </Form>
    </>
}