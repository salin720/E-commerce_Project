import { Form } from "react-bootstrap";
import {SelectFieldProps} from "@/library/interfaces.ts";

export const SelectField: React.FC<SelectFieldProps> = ({ formik, name, data, label }) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label htmlFor="status">{label}</Form.Label>
            <Form.Select
                name={name}
                id={name}
                value={formik.values[name]}
                isInvalid={formik.touched[name] && (formik.errors[name]?.length || 0) > 0}
                isValid={(formik.errors[name]?.length || 0) == 0 && formik.values[name]}
                onChange={formik.handleChange}
            >
                {/*@ts-ignore*/}
                {data.map((item) => <option value={item._id} key={item._id}>{item.name}
                </option>)}
            </Form.Select>
        </Form.Group>
    );
};
