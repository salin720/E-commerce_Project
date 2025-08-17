import {createSlice} from '@reduxjs/toolkit'
import {UserType} from "@/library/interfaces"

const userSlice = createSlice({
    name: 'user',
    initialState: {
        value: null
    } as {value: UserType},
    reducers: {
        setUser: (state, action) => {
            state.value = action.payload
        },
        clearUser: state => {
            state.value = null
        }
    }
})

export default userSlice.reducer
export const {setUser, clearUser} = userSlice.actions