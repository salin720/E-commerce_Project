import { useEffect, useMemo, useState } from 'react'
import http from '@/http'
import { ProductData, UserType } from '@/library/interfaces'
import { useSelector } from 'react-redux'
import { Loading, ProductSection } from '@/components'

export const Wishlist: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductData[]>([])
  const user: UserType = useSelector((state: any) => state.user.value)

  const storageKey = user?._id ? `wishlist_${user._id}` : 'wishlist_guest'
  const ids = useMemo(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) as string[] : []
  }, [storageKey])

  useEffect(() => {
    const load = async () => {
      if (!ids.length) {
        setProducts([])
        setLoading(false)
        return
      }
      try {
        const responses = await Promise.all(ids.map(id => http.get(`/products/${id}`).catch(() => null)))
        const list = responses
          .map((res: any) => res?.data?.product)
          .filter((item: any) => item && item.status !== false)
        setProducts(list)
        const validIds = list.map((item: any) => item._id)
        if (validIds.length !== ids.length) {
          localStorage.setItem(storageKey, JSON.stringify(validIds))
          window.dispatchEvent(new Event('wishlist-updated'))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ids, storageKey])

  return loading ? <Loading /> : (
    <div className="col-12 px-3 px-lg-4 py-4">
      <div className="bg-white rounded-4 shadow-sm p-4 border-soft mb-3 text-center">
        <div className="section-kicker mb-2">Wishlist</div>
        <h1 className="section-title-real section-title-centered">Saved with one click</h1>
        <p className="text-muted mb-0">Open your saved heart items anytime, remove them instantly, and move them to cart whenever you are ready.</p>
      </div>
      <ProductSection data={products} title="Your Wishlist" emptyText="No products are saved in your wishlist yet." />
    </div>
  )
}
