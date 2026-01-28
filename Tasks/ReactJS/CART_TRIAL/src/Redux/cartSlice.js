// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     items: [],
//     totalQuantity: 0,
//     totalPrice: 0,
// }

// const reCalcTotal = (state) => {
//     let currQuantity = 0, currPrice = 0;
//     state.items.map((prod) => {
//         currQuantity += prod.quantity;
//         currPrice += (prod.quantity * prod.price);
//     })
//     state.totalPrice = currPrice;
//     state.totalQuantity = currQuantity;
// }

// export const cartSlice = createSlice({
//     name: "Cart",
//     initialState,
//     reducers: {
//         addToCart: (state, action) => {
//             const prod = action.payload;
//             const existing = state.items.find((i) => i.id === prod.id);
//             if (existing) {
//                 existing.quantity += 1;
//             } else {
//                 state.items.push({... prod, quantity: 1});
//             }
//             reCalcTotal(state);
//         },
//         removeFromCart: (state, action) => {
//             const id = action.payload;
//             state.items = state.items.filter((i) => i.id !== id);
//             reCalcTotal(state);
//         },
//         updateQuantity: (state, action) => {
//             const { id, quantity } = action.payload;
//             const item = state.items.find((i) => i.id === id);
//             if (!item) return;
//             if (quantity <= 0) {
//                 state.items = state.items.filter((i) => i.id !== id);
//             } else {
//                 item.quantity = quantity;
//             }
//             reCalcTotal(state);
//         },
//         clearCart: (state) => {
//             state.items = [];
//             state.totalPrice = 0; state.totalQuantity = 0; 
//         }
//     }
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// export const selectCartItems = (state) => state.cart.items;
// export const selectTotalPrice = (state) => state.cart.totalPrice;
// export const selectTotalQuantity = (state) => state.cart.totalQuantity;

// export default cartSlice.reducer;