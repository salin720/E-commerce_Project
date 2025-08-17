import {useEffect, useState} from "react"
import {ReviewData} from "@/library/interfaces"
import http from "@/http"
import {DataTable, Loading} from "@/components"
import {dtFormat} from "@/library/function"

export const Reviews: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)

        http.get('/profile/reviews')
            .then(({data}) => {
                setReviews(data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return loading ? <Loading /> : <>
        <DataTable searchable={['Name','Email','Address']} data={reviews.map(review => ({
            'Product': review.product?.name,
            'Comment': review.comment,
            'Rating': review.rating,
            'Created At': dtFormat(review.createdAt),
            'Updated At': dtFormat(review.updatedAt),
        }))} />
    </>
}