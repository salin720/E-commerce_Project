import { useState, useRef } from "react";
import { Col, Container, Row, Tab, Tabs, Image, Form } from "react-bootstrap";
import { UserType } from "@/library/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { Orders } from "./Orders";
import { Edit } from "./Edit";
import { Password } from "@/pages/profile/Password.tsx";
import http from "@/http";
import { setUser } from "@/store";
import { imgUrl } from "@/library/function";

export const UserProfile: React.FC = () => {
    const user: UserType | null = useSelector((state: any) => state.user.value);
    const dispatch = useDispatch();
    const initialAvatar = user?.avatar ? (user.avatar.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${user.avatar}` : imgUrl(user.avatar) ) : "/avatar-default.png"
    const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatar);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const { data } = await http.post("/profile/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
            const nextAvatar = data.avatar ? imgUrl(data.avatar ) : "/avatar-default.png"
            setAvatarPreview(nextAvatar);
            dispatch(setUser({ ...user, avatar: data.avatar }));
        } catch (err) {
            console.error("Avatar upload failed", err);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await http.delete("/profile/remove-avatar");
            setAvatarPreview("/avatar-default.png");
            dispatch(setUser({ ...user, avatar: null }));
        } catch (err) {
            console.error("Failed to remove avatar", err);
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();
    if (!user) return <div className="text-center mt-5">Loading user profile...</div>;

    return (
        <Container className="my-4">
            <Row className="justify-content-center">
                <Col xl={10} lg={11}>
                    <div className="profile-card p-4 p-md-5 shadow rounded-4 bg-white border-soft">
                        <div className="text-center mb-4">
                            <Image src={avatarPreview} roundedCircle alt="User Avatar" width={120} height={120} className="border border-3 border-dark mb-3 object-fit-cover bg-light" style={{ cursor: "pointer", objectFit: "cover" }} onClick={triggerFileInput} />
                            <Form.Control type="file" accept="image/*" ref={fileInputRef} className="d-none" onChange={handleAvatarChange} />
                            <div className="profile-avatar-actions justify-content-center mt-3">
                                <button onClick={triggerFileInput} className="profile-icon-btn dark" type="button" aria-label="Edit picture"><i className="fa-solid fa-pen"></i></button>
                                {user?.avatar && <button onClick={handleRemoveAvatar} className="profile-icon-btn danger" type="button" aria-label="Delete picture"><i className="fa-solid fa-trash"></i></button>}
                            </div>
                            <h2 className="fw-bold mt-3">{user.name}</h2>
                            <p className="text-muted mb-0">{user.email}</p>
                        </div>
                        <Tabs defaultActiveKey="orders" id="user-profile-tabs" className="mb-4 justify-content-center profile-tabs" fill>
                            <Tab eventKey="orders" title={<><i className="fa-solid fa-box me-2"></i>Orders</>}><Orders /></Tab>
                            <Tab eventKey="profile" title={<><i className="fa-solid fa-user me-2"></i>Profile</>}><Edit user={user} /></Tab>
                            <Tab eventKey="password" title={<><i className="fa-solid fa-lock me-2"></i>Password</>}><Password /></Tab>
                        </Tabs>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
