import { useMemo, useState } from "react"
import { ProductData } from "@/library/interfaces.ts"
import { ProductCard } from "@/components/ProductCard.tsx"

export const ProductSection: React.FC<{ data: ProductData[], title: string, size?: 'sm', emptyText?: string }> = ({ data, title, size, emptyText }) => {
    const pageSize = size === 'sm' ? 10 : 12
    const [visibleCount, setVisibleCount] = useState<number>(pageSize)
    const visible = useMemo(() => data.slice(0, visibleCount), [data, visibleCount])
    const hasMore = data.length > visibleCount

    return (
        <section className="col-12 my-2">
            <div className="section-shell">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div>
                        <div className="section-kicker">Curated for shopping</div>
                        <h2 className="section-title-real m-0">{title}</h2>
                    </div>
                    <span className="text-muted small">{data.length} items</span>
                </div>

                {visible.length > 0 ? (
                    <>
                        <div className={`row ${size === 'sm' ? 'row-cols-2 row-cols-md-3 row-cols-xl-5' : 'row-cols-2 row-cols-md-3 row-cols-xl-6'} g-3`}>
                            {visible.map(product => <ProductCard key={product._id} product={product} />)}
                        </div>
                        {hasMore && (
                            <div className="text-center mt-3">
                                <button className="btn btn-outline-dark px-4" onClick={() => setVisibleCount(prev => prev + pageSize)}>
                                    See More
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
