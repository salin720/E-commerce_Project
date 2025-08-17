import { Form } from "react-bootstrap"
import {FileFieldProps} from "@/library/interfaces"
import {ChangeEvent} from  "react"

export const FileField: React.FC<FileFieldProps> = ({ formik, name, label, accept, multiple= false }) => {
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        let images = []

        if((event.target.files?.length || 0) > 0) {
            //@ts-ignore
            for (let file of event.target.files) {
                images.push(file)
            }
        }

        formik.setFieldValue(name, images)
    }

    return <>
        <Form.Group className="mb-3">
            <Form.Label htmlFor={name}>{label}</Form.Label>
            <Form.Control
                name={name}
                id={name}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched[name] && (formik.errors[name]?.length ||0) > 0}
                isValid={(formik.errors[name]?.length ||0) == 0 && (formik.values[name]?.length
                    || 0) > 0}
            />

            {formik.touched[name] && (formik.errors[name]?.length || 0) > 0 && <Form.Control.Feedback type="invalid">
                {formik.errors[name]}
            </Form.Control.Feedback>}
        </Form.Group>
    </>
}
