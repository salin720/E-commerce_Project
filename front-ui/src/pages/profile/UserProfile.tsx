import { useState, useRef } from "react";
import { Col, Container, Row, Tab, Tabs, Image, Form } from "react-bootstrap";
import { UserType } from "@/library/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { Orders } from "./Orders";
import { Reviews } from "./Reviews";
import { Edit } from "./Edit";
import { Password } from "@/pages/profile/Password.tsx";
import http from "@/http";
import { setUser } from "@/store";

export const UserProfile: React.FC = () => {
    const user: UserType | null = useSelector((state: any) => state.user.value);
    const dispatch = useDispatch();

    const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || "/avatar.png");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const { data } = await http.post("/profile/upload-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setAvatarPreview(data.avatarUrl);
            dispatch(setUser({ ...user, avatar: data.avatarUrl }));
        } catch (err) {
            console.error("Avatar upload failed", err);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await http.delete("/profile/remove-avatar");

            const defaultAvatar = "/avatar.png";
            setAvatarPreview(defaultAvatar);
            dispatch(setUser({ ...user, avatar: defaultAvatar }));
        } catch (err) {
            console.error("Failed to remove avatar", err);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!user) return <div className="text-center mt-5">Loading user profile...</div>;

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col xl={10} lg={11}>
                    <div className="profile-card p-4 p-md-5 shadow rounded-4 bg-white">
                        {/* User Header */}
                        <div className="text-center mb-4 position-relative">
                            <Image
                                src={avatarPreview}
                                roundedCircle
                                alt="User Avatar"
                                width={100}
                                height={100}
                                className="border border-3 border-primary mb-3 object-fit-cover"
                                style={{ cursor: "pointer", objectFit: "cover" }}
                                onClick={triggerFileInput}
                            />
                            <Form.Control
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="d-none"
                                onChange={handleAvatarChange}
                            />
                            <div className="text-muted small">
                                Click avatar to update
                            </div>

                            {/* Remove Avatar Button */}
                            {user?.avatar && user.avatar !== "/avatar.png" && (
                                <div className="mt-2">
                                    <button onClick={handleRemoveAvatar} className="btn btn-sm btn-outline-danger">
                                        Remove Avatar
                                    </button>
                                </div>
                            )}

                            <h2 className="fw-bold mt-2">{user.name}</h2>
                            <p className="text-muted mb-0">{user.email}</p>
                        </div>

                        {/* Tabs */}
                        <Tabs
                            defaultActiveKey="orders"
                            id="user-profile-tabs"
                            className="mb-4 justify-content-center profile-tabs"
                            fill
                        >
                            <Tab eventKey="orders" title={<><i className="fa-solid fa-box me-2"></i>Orders</>}>
                                <Orders />
                            </Tab>
                            <Tab eventKey="reviews" title={<><i className="fa-solid fa-comments me-2"></i>Reviews</>}>
                                <Reviews />
                            </Tab>
                            <Tab eventKey="profile" title={<><i className="fa-solid fa-user-edit me-2"></i>Edit Profile</>}>
                                <Edit user={user} />
                            </Tab>
                            <Tab eventKey="password" title={<><i className="fa-solid fa-lock me-2"></i>Change Password</>}>
                                <Password />
                            </Tab>
                        </Tabs>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
