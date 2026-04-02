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
    const initialAvatar = user?.avatar ? (user.avatar.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${user.avatar}` : imgUrl(user.avatar)) : "/avatar.png"
    const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatar);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const { data } = await http.post("/profile/upload-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
            const nextAvatar = data.avatar ? imgUrl(data.avatar) : "/avatar.png"
            setAvatarPreview(nextAvatar);
            dispatch(setUser({ ...user, avatar: data.avatar }));
        } catch (err) {
            console.error("Avatar upload failed", err);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await http.delete("/profile/remove-avatar");
            setAvatarPreview("/avatar.png");
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
                        <div className="text-center mb-4 position-relative">
                            <Image src={avatarPreview} roundedCircle alt="User Avatar" width={110} height={110} className="border border-3 border-dark mb-3 object-fit-cover" style={{ cursor: "pointer", objectFit: "cover" }} onClick={triggerFileInput} />
                            <Form.Control type="file" accept="image/*" ref={fileInputRef} className="d-none" onChange={handleAvatarChange} />
                            <div className="text-muted small">Click image to add or update your profile picture.</div>
                            <div className="d-flex justify-content-center gap-2 mt-2">
                                <button onClick={triggerFileInput} className="btn btn-sm btn-dark">Edit Picture</button>
                                {user?.avatar && <button onClick={handleRemoveAvatar} className="btn btn-sm btn-outline-danger">Delete Picture</button>}
                            </div>
                            <h2 className="fw-bold mt-3">{user.name}</h2>
                            <p className="text-muted mb-0">{user.email}</p>
                        </div>
                        <Tabs defaultActiveKey="orders" id="user-profile-tabs" className="mb-4 justify-content-center profile-tabs" fill>
                            <Tab eventKey="orders" title={<><i className="fa-solid fa-box me-2"></i>Orders</>}><Orders /></Tab>
                            <Tab eventKey="profile" title={<><i className="fa-solid fa-user-edit me-2"></i>Edit Profile</>}><Edit user={user} /></Tab>
                            <Tab eventKey="password" title={<><i className="fa-solid fa-lock me-2"></i>Change Password</>}><Password /></Tab>
                        </Tabs>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
