import { useMemo, useState } from "react"
import { ProductData } from "@/library/interfaces.ts"
import { ProductCard } from "@/components/ProductCard.tsx"

export const ProductSection: React.FC<{ data: ProductData[], title: string, size?: 'sm', emptyText?: string }> = ({ data, title, size, emptyText }) => {
    const pageSize = size === 'sm' ? 10 : 15
    const [visibleCount, setVisibleCount] = useState<number>(pageSize)
    const visible = useMemo(() => data.slice(0, visibleCount), [data, visibleCount])
    const hasMore = data.length > visibleCount

    return (
        <section className="col-12 my-3">
            <div className="section-shell">
                <div className="section-heading-wrap">
                    <h2 className="section-title-real highlighted mb-0">{title}</h2>
                    <div className="text-muted small mt-2">Showing {Math.min(visibleCount, data.length)} of {data.length} items</div>
                </div>

                {visible.length > 0 ? (
                    <>
                        <div className={`row ${size === 'sm' ? 'row-cols-2 row-cols-md-4 row-cols-xl-6 row-cols-xxl-7 g-2' : 'row-cols-2 row-cols-md-3 row-cols-xl-5 g-3'}`}>
                            {visible.map(product => <ProductCard key={product._id} product={product} />)}
                        </div>
                        {hasMore && (
                            <div className="text-center mt-3">
                                <button className="btn btn-outline-dark px-4 rounded-pill" onClick={() => setVisibleCount(prev => prev + pageSize)}>
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-4 shadow-sm p-4 text-center text-muted border-soft">{emptyText || 'No products available right now.'}</div>
                )}
            </div>
        </section>
    )
}
