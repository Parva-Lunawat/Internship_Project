import { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_QUANTITY, CLEAR_CART } from "../actions/cartActions";

const initialState = {
    items: [],
    totalPrice: 0,
    totalQuantity: 0
}

const reCalcTotal = (items) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  return { totalQuantity, totalPrice };
};


export default function cartReducer(state = initialState, action) {
    switch(action.type) {
        case ADD_TO_CART: {
            const prod = action.payload;
            const existing = state.items.find((i) => i.id === prod.id);

            let updatedItems;

            if (existing) {
                updatedItems = state.items.map((i) => i.id === prod.id ? {...i, quantity: i.quantity + 1} : i);
            } else {
                updatedItems = [...state.items, { ...prod, quantity: 1}];
            }
            const total = reCalcTotal(updatedItems);
            return {
                ...state,
                items: updatedItems,
                ...total,
            };
        }

        case REMOVE_FROM_CART: {
            const remId = action.payload;
            const updatedItems = state.items.filter((i) => i.id !== remId);
            const total = reCalcTotal(updatedItems);
            return {
                ...state,
                items: updatedItems,
                ...total,
            };
        }

        case UPDATE_QUANTITY: {
            const {id, quantity} = action.payload;
            const item = state.items.find((i) => i.id === id);
            if(!item) return state;
            
            const updatedItems = 
                (quantity <= 0) ?
                    state.items.filter((i) => i.id !== id) :
                    state.items.map((i) => i.id === id ? {...i, quantity} : i);
            const total = reCalcTotal(updatedItems);

            return {
                ...state,
                items: updatedItems,
                ...total,
            };
        }     

        case CLEAR_CART: {
            return initialState;
        }
        
        default: 
            return state;
    }
}

