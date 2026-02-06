import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../Redux/actions/cartActions";
import { selectCartItems, selectTotalQuantity, selectTotalPrice } from "../Redux/selector-functions/cartSelector";
import CartCard from "../components/CartCard";

export default function Cart() {
	const dispatch = useDispatch();

	const cartItems = useSelector(selectCartItems);
	const totalItems = useSelector(selectTotalQuantity);
	const totalPrice = useSelector(selectTotalPrice);

	const handleDecrease = (item) => {
		dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
	};

	const handleIncrease = (item) => {
		dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
	};

	return (
		<div className="container my-4">
			<div className="d-flex align-items-center justify-content-between mb-3">
				<h4 className="mb-0">Cart</h4>

				<button
					className="btn btn-outline-danger btn-sm"
					onClick={() => dispatch(clearCart())}
					disabled={cartItems.length === 0}
				>
					Clear Cart
				</button>
			</div>

			<div className="row g-4">
				{/* Left: Items */}
				<div className="col-lg-8">
					{cartItems.length === 0 ? (
						<div className="alert alert-info mb-0">
							Your cart is empty. Go to Products and add something.
						</div>
					) : (
						<div className="list-group gap-3">
							{cartItems.map((item) => (
								<CartCard
									key={item.id}
									item={item}
									onRemove={(id) => dispatch(removeFromCart(id))}
									onDecrease={handleDecrease}
									onIncrease={handleIncrease}
								/>
							))}
						</div>
					)}
				</div>

				{/* Right: Summary */}
				<div className="col-lg-4">
					<div className="card shadow-sm">
						<div className="card-body">
							<h5 className="card-title">Order Summary</h5>
							<hr />

							<div className="d-flex justify-content-between mb-2">
								<span>Total Items</span>
								<span className="fw-semibold">{totalItems}</span>
							</div>

							<div className="d-flex justify-content-between mb-2">
								<span>Total Price</span>
								<span className="fw-semibold">₹{totalPrice}</span>
							</div>

							<button
								className="btn btn-primary w-100 mt-3"
								disabled={cartItems.length === 0}
								onClick={() => alert("No Checkout for you brother")}
							>
								Checkout
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
