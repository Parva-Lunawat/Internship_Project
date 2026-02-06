import Navbar from "./components/Navbar";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import { Routes, Route } from "react-router-dom";

export default function App() {
	return (
		<div>
			<Navbar />
			<Routes>
				<Route path="/" element={<ProductPage />} />
				<Route path="/cart" element={<Cart />} />
			</Routes>
		</div>
	);
}
