import React, { useEffect, useState } from "react";
import { ProductData, UserType } from "@/library/interfaces.ts";
import { Loading, ProductSection } from "@/components";
import { Link, useNavigate, useParams } from "react-router-dom";
import http from "@/http";
import { dtDiff, imgUrl } from "@/library/function.ts";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import ReactImageMagnify from "react-image-magnify";

export const Detail: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value);
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductData>();
    const [similar, setSimilar] = useState<ProductData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [bigImg, setBigImg] = useState<string>();
    const [reviewForm, setReviewForm] = useState({ rating: 1, comment: "" });
    const [avgRating, setAvgRating] = useState<number>(0);
    const [starRatings, setStarRatings] = useState<Record<number, number>>({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });
    const [qty, setQty] = useState<number>(1);

    // Wishlist state (array of product IDs), loaded from localStorage
    const [wishlist, setWishlist] = useState<string[]>(() => {
        const saved = localStorage.getItem("wishlist");
        return saved ? JSON.parse(saved) : [];
    });

    const params = useParams();

    useEffect(() => {
        setLoading(true);

        Promise.all([
            http.get(`/products/${params.id}`),
            http.get(`/products/${params.id}/similar`),
        ])
            .then(([{ data: { product: pData } }, { data: sData }]) => {
                setProduct(pData);
                setSimilar(sData);
                setBigImg(imgUrl(pData.images[0]));
            })
            .catch(() => {
                // handle error if needed
            })
            .finally(() => {
                setLoading(false);
            });
    }, [params.id]);

    useEffect(() => {
        if (product?.reviews && product.reviews.length > 0) {
            let tAvg = 0;
            let tsRatings: Record<number, number> = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            };

            for (let review of product.reviews) {
                const rating = Number(review.rating);
                tAvg += rating;
                tsRatings[rating] += 1;
            }

            for (let i in tsRatings) {
                tsRatings[i] = (tsRatings[i] / product.reviews.length) * 100;
            }

            setAvgRating(tAvg / product.reviews.length);
            setStarRatings(tsRatings);
        } else {
            setAvgRating(0);
            setStarRatings({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        }
    }, [product]);

    const handleReview = (e: any) => {
        e.preventDefault();

        setLoading(true);

        http
            .post(`/products/${params.id}/review`, reviewForm)
            .then(() => {
                setReviewForm({ rating: 1, comment: "" });
                return http.get(`/products/${params.id}`);
            })
            .then(({ data: { product: newProduct } }) => setProduct(newProduct))
            .catch(() => {
                // handle error if needed
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Toggle wishlist add/remove with single toast notification
    const toggleWishlist = (productId: string) => {
        setWishlist((prev) => {
            let newWishlist;
            toast.dismiss();
            if (prev.includes(productId)) {
                newWishlist = prev.filter((id) => id !== productId);
                toast.info("Removed from wishlist");
            } else {
                newWishlist = [...prev, productId];
                toast.success("Added to wishlist");
            }
            localStorage.setItem("wishlist", JSON.stringify(newWishlist));
            return newWishlist;
        });
    };

    return loading ? (
        <Loading />
    ) : (
        <>
            <div className="col-12">
                <main className="row">
                    <div className="col-12 bg-white py-3 my-3">
                        <div className="row">
                            {/* Product Image Section */}
                            <div className="col-lg-5 col-md-12 mb-3">
                                <div className="col-12 mb-3">
                                    {/* Wrap in fragment to avoid TS JSX type issues */}
                                    <>
                                        <ReactImageMagnify
                                            {...{
                                                smallImage: {
                                                    alt: product?.name || "Product",
                                                    isFluidWidth: true,
                                                    src: bigImg || "",
                                                },
                                                largeImage: {
                                                    src: bigImg || "",
                                                    width: 1200,
                                                    height: 1800,
                                                },
                                                enlargedImageContainerDimensions: {
                                                    width: "200%",
                                                    height: "100%",
                                                },
                                                isHintEnabled: true,
                                                shouldUsePositiveSpaceLens: true,
                                            }}
                                         />
                                    </>
                                </div>
                                <div className="col-12">
                                    <div className="row">
                                        {(product?.images ?? []).map((image, i) => (
                                            <div
                                                className="col-sm-2 col-3"
                                                key={i}
                                                onMouseEnter={() => setBigImg(imgUrl(image))}
                                            >
                                                <div
                                                    className="img-small border"
                                                    style={{ backgroundImage: `url(${imgUrl(image)})` }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="col-lg-5 col-md-9">
                                <div className="col-12 product-name large">
                                    {product?.name}
                                    <small>
                                        By <Link to={`/brands/${product?.brandId}`}>{product?.brand?.name}</Link>
                                    </small>
                                </div>
                                <div className="col-12 px-0">
                                    <hr />
                                </div>
                                <div className="col-12">{product?.shortDescription}</div>
                            </div>

                            {/* Sidebar (Price, Qty, Wishlist Icon + Add to Cart) */}
                            <div className="col-lg-2 col-md-3 text-center">
                                <div className="col-12 sidebar h-100">
                                    <div className="row">
                                        <div className="col-12">
                                            {(product?.discountedPrice || 0) > 0 ? (
                                                <>
                                                    <span className="detail-price">Rs. {product?.discountedPrice}</span>
                                                    <span className="detail-price-old">Rs. {product?.price}</span>
                                                </>
                                            ) : (
                                                <span className="detail-price">Rs. {product?.price}</span>
                                            )}
                                        </div>
                                        <div className="col-xl-5 col-md-9 col-sm-3 col-5 mx-auto mt-3">
                                            <div className="mb-3">
                                                <label htmlFor="qty">Quantity</label>
                                                <input
                                                    type="number"
                                                    id="qty"
                                                    min="1"
                                                    value={qty}
                                                    className="form-control"
                                                    onChange={({ target }) => setQty(Number(target.value))}
                                                />
                                            </div>
                                        </div>

                                        {/* Wishlist Icon with Count Badge */}
                                        <div className="col-12 mb-3 text-center">
                                            <button
                                                className="btn btn-link position-relative p-0"
                                                onClick={() => navigate("/wishlist")}
                                                style={{ fontSize: "1.5rem", color: wishlist.length > 0 ? "red" : "gray" }}
                                                aria-label="Wishlist"
                                            >
                                                <i className={wishlist.length > 0 ? "fas fa-heart" : "far fa-heart"}></i>
                                                {wishlist.length > 0 && (
                                                    <span
                                                        style={{
                                                            position: "absolute",
                                                            top: "-5px",
                                                            right: "-10px",
                                                            background: "red",
                                                            color: "white",
                                                            borderRadius: "50%",
                                                            padding: "2px 6px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                            {wishlist.length}
                          </span>
                                                )}
                                            </button>
                                        </div>

                                        <div className="col-12 mt-3">
                                            {user ? (
                                                <Button
                                                    variant="dark"
                                                    className="w-100"
                                                    onClick={() => {
                                                        const event = new CustomEvent("add-to-cart", {
                                                            detail: { product, qty },
                                                        });
                                                        window.dispatchEvent(event);
                                                    }}
                                                >
                                                    <i className="fas fa-cart-plus me-2"></i>Add to Cart
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline-dark"
                                                    className="ol-12 mb-3 align-self-end"
                                                    onClick={() => {
                                                        toast.info("Please login to add items to cart.");
                                                        navigate("/login");
                                                    }}
                                                >
                                                    <i className="fas fa-cart-plus me-2"></i>Add to Cart
                                                </Button>
                                            )}
                                        </div>

                                        {/* Add to Wishlist Button */}
                                        <div className="col-12 mt-3">
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                type="button"
                                                onClick={() => product && toggleWishlist(product._id)}
                                            >
                                                <i
                                                    className={`fa-heart me-2 ${
                                                        product && wishlist.includes(product._id) ? "fas" : "far"
                                                    }`}
                                                ></i>
                                                {wishlist.includes(product?._id || "") ? "Remove from wishlist" : "Add to wishlist"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details & Review Section */}
                    <div className="col-12 mb-3 py-3 bg-white text-justify">
                        <div className="row">
                            {/* Description */}
                            <div className="col-md-7">
                                <div className="col-12">
                                    <div className="row">
                                        <div className="col-12 text-uppercase">
                                            <h2>
                                                <u>Details</u>
                                            </h2>
                                        </div>
                                        <div className="col-12" id="details">
                                            {product?.description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ratings & Reviews */}
                            <div className="col-md-5">
                                <div className="col-12 px-md-4 sidebar h-100">
                                    <div className="row">
                                        <div className="col-12 mt-md-0 mt-3 text-uppercase">
                                            <h2>
                                                <u>Ratings & Reviews</u>
                                            </h2>
                                        </div>
                                        <div className="col-12">
                                            <div className="row">
                                                <div className="col-sm-4 text-center">
                                                    <div className="row">
                                                        <div className="col-12 average-rating">{avgRating.toFixed(1)}</div>
                                                        <div className="col-12">of {product?.reviews?.length || 0} reviews</div>
                                                    </div>
                                                </div>
                                                <div className="col">
                                                    <ul className="rating-list mt-3">
                                                        {[5, 4, 3, 2, 1].map((n) => (
                                                            <li key={n}>
                                                                <div className="progress">
                                                                    <div
                                                                        className="progress-bar bg-dark"
                                                                        role="progressbar"
                                                                        style={{ width: `${starRatings[n]}%` }}
                                                                    >
                                                                        {starRatings[n].toFixed(1)}%
                                                                    </div>
                                                                </div>
                                                                <div className="rating-progress-label">
                                                                    {n}
                                                                    <i className="fas fa-star ms-1"></i>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Form */}
                                    <div className="row">
                                        <div className="col-12 px-md-3 px-0">
                                            <hr />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <h4>Add Review</h4>
                                        </div>
                                        <div className="col-12">
                                            {user ? (
                                                <form onSubmit={handleReview}>
                                                    <div className="mb-3">
                            <textarea
                                className="form-control"
                                placeholder="Give your review"
                                value={reviewForm.comment}
                                onChange={({ target }) =>
                                    setReviewForm({ ...reviewForm, comment: target.value })
                                }
                            ></textarea>
                                                    </div>
                                                    <div className="mb-3">
                                                        <div className="d-flex ratings justify-content-end flex-row-reverse">
                                                            {[5, 4, 3, 2, 1].map((n) => (
                                                                <React.Fragment key={n}>
                                                                    <input
                                                                        type="radio"
                                                                        value={n}
                                                                        name="rating"
                                                                        id={`rating-${n}`}
                                                                        checked={n === reviewForm.rating}
                                                                        onChange={() =>
                                                                            setReviewForm({
                                                                                ...reviewForm,
                                                                                rating: n,
                                                                            })
                                                                        }
                                                                    />
                                                                    <label htmlFor={`rating-${n}`}></label>
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <button className="btn btn-outline-dark" type="submit">
                                                            Add Review
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>Please <Link to="/login">login</Link> to leave your review</>
                                            )}
                                        </div>
                                    </div>

                                    {/* Review List */}
                                    <div className="row">
                                        <div className="col-12 px-md-3 px-0">
                                            <hr />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            {product?.reviews && product.reviews.length > 0 ? (
                                                product.reviews.map((review) => (
                                                    <div
                                                        className="col-12 text-justify py-2 px-3 mb-3 bg-gray"
                                                        key={review._id}
                                                    >
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <strong className="me-2">{review.user?.name}</strong>
                                                                <small>
                                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                                        <i
                                                                            key={n}
                                                                            className={`fa-${
                                                                                n <= review.rating ? "solid" : "regular"
                                                                            } fa-star`}
                                                                        ></i>
                                                                    ))}
                                                                </small>
                                                            </div>
                                                            <div className="col-12">{review.comment}</div>
                                                            <div className="col-12">
                                                                <small>
                                                                    <i className="fas fa-clock me-2"></i>
                                                                    {dtDiff(review.createdAt)}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-12 text-justify py-2 px-3 mb-3 bg-gray">
                                                    Product has no reviews yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {similar.length > 0 && (
                        <div className="col-12">
                            <ProductSection data={similar} title="Similar Products" />
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};
