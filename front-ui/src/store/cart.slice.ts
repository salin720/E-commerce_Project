import {createSlice} from "@reduxjs/toolkit"
import {CartData} from "@/library/interfaces"
import {fromStorage, inStorage, removeStorage} from "@/library/function.ts";

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        value: JSON.parse(fromStorage('m3pmcart') || '{}')
    } as {value: CartData},
    reducers: {
        setCart: (state, action) => {
            state.value = action.payload
            inStorage('m3pmcart', JSON.stringify(state.value), true)
        },
        clearCart: state => {
            state.value = {}
            removeStorage('m3pmcart')
        }
    }
})

export default cartSlice.reducer

export const {setCart, clearCart} = cartSlice.actions
