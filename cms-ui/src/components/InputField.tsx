import {Form} from "react-bootstrap"
import {InputFieldProps} from "@/library/interfaces"

export const InputField: React.FC<InputFieldProps> = ({formik, name, type = 'text', label, as}) => {
    return <>
        <Form.Group className="mb-3">
            <Form.Label htmlFor={name}>{label}</Form.Label>
            <Form.Control
                as={as}
                name={name}
                id={name}
                type={type}
                value={formik.values[name]}
                onChange={formik.handleChange}
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