import { Form } from "react-bootstrap";

export const StatusField: React.FC<{ formik: any }> = ({ formik }) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label htmlFor="status">Status</Form.Label>
            <Form.Select
                name="status"
                id="status"
                value={formik.values.status}
                isInvalid={formik.touched.status && !!formik.errors.status}
                isValid={!formik.errors.status && [0, 1].includes(Number(formik.values.status))}
                onChange={({ target }) => formik.setFieldValue('status', Number(target.value))}
            >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
            </Form.Select>
        </Form.Group>
    );
};
