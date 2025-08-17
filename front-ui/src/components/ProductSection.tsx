import { ProductData } from "@/library/interfaces.ts";
import { ProductCard } from "@/components/ProductCard.tsx";

export const ProductSection: React.FC<{ data: ProductData[], title: string, size?: 'sm' }> = ({ data, title, size }) => {
    return (
        <div className="col-12">
            <div className="row">
                <div className="col-12 py-4">
                    {/* FLOATING CENTERED HEADING */}
                    <div className="row justify-content-center">
                        <div className="col-auto">
                            <div className="section-heading-floating text-center shadow-sm">
                                <h2 className="section-title m-0 text-uppercase fw-semibold">
                                    {title}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCT GRID */}
                    <div className={`row ${size === 'sm' ? 'row-cols-xl-6' : ''} row-cols-lg-5 row-cols-sm-2 justify-content-center`}>
                        {data.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
