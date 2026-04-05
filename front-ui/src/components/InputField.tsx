import {Form, InputGroup, Button} from "react-bootstrap"
import {InputFieldProps} from "@/library/interfaces"
import {useState} from "react"

export const InputField: React.FC<InputFieldProps> = ({formik, name, type = 'text', label, as}) => {
    const [show, setShow] = useState(false)
    const inputType = type === 'password' ? (show ? 'text' : 'password') : type
    const invalid = formik.touched[name] && (formik.errors[name]?.length ||0) > 0
    const valid = (formik.errors[name]?.length ||0) == 0 && (formik.values[name]?.length || 0) > 0
    return <>
        <Form.Group className="mb-3">
            <Form.Label htmlFor={name}>{label}</Form.Label>
            {type === 'password' ? (
                <InputGroup>
                    <Form.Control
                        as={as}
                        name={name}
                        id={name}
                        type={inputType}
                        value={formik.values[name]}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={invalid}
                        isValid={valid}
                    />
                    <Button variant="outline-secondary" type="button" onClick={() => setShow(!show)}><i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'}`}></i></Button>
                    {invalid && <Form.Control.Feedback type="invalid">{formik.errors[name]}</Form.Control.Feedback>}
                </InputGroup>
            ) : (<>
                <Form.Control
                    as={as}
                    name={name}
                    id={name}
                    type={inputType}
                    value={formik.values[name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={invalid}
                    isValid={valid}
                />
                {invalid && <Form.Control.Feedback type="invalid">{formik.errors[name]}</Form.Control.Feedback>}
            </>)}
        </Form.Group>
    </>
}
