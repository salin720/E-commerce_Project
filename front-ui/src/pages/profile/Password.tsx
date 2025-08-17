import {useFormik} from "formik"
import http from "@/http"
import {InputField, SubmitBtn} from "@/components";
import {Form} from "react-bootstrap";
import {PasswordFormData} from "@/library/interfaces.ts";
import {PasswordFormValidation} from "@/library/validations.ts";

export const Password: React.FC = () => {
    const formik = useFormik({
        initialValues: {
            oldPassword: "",
            password: "",
            confirmPassword: "",
        } as PasswordFormData,
        validationSchema: PasswordFormValidation,
        onSubmit: (data, {setSubmitting}) => {
            http.patch('/profile/password', data)
                .then(() => {})
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

            <InputField formik={formik} name="oldPassword" label="Old Password" type="password" />

            <InputField formik={formik} name="password" label="Password" type="password" />

            <InputField formik={formik} name="confirmPassword" label="Confirm Password" type="password" />

            <SubmitBtn disabled={formik.isSubmitting} />
        </Form>
    </>
}