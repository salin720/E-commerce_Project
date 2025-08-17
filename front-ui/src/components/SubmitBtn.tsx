import {Button} from "react-bootstrap"
import {SubmitBtnProps} from "@/library/interfaces.ts";

export const SubmitBtn: React.FC<SubmitBtnProps> = ({disabled = false, label = 'Save', icon = 'fa-save'}) => {
    return <Button variant="dark" type="submit" disabled={disabled}>
            <i className={`fa-solid ${disabled ? 'fa-spinner fa-spin' : icon } me-1`}></i>{label}</Button>
}