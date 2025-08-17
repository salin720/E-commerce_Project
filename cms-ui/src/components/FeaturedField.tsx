import { Form } from "react-bootstrap";

export const FeaturedField: React.FC<{ formik: any }> = ({ formik }) => {
    return (
        <Form.Group className="mb-3">
            <Form.Label htmlFor="featured">Featured</Form.Label>
            <Form.Select
                name="featured"
                id="featured"
                value={formik.values.featured}
                isInvalid={formik.touched.featured && !!formik.errors.featured}
                isValid={!formik.errors.featured && [0, 1].includes(Number(formik.values.featured))}
                onChange={({ target }) => formik.setFieldValue('featured', Number(target.value))}
            >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
            </Form.Select>
        </Form.Group>
    );
};
