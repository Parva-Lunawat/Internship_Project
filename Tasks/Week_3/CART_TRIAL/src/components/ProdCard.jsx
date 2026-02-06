// prod = {
//     id: string,
//     title: string,
//     image: img
//     description: string
//     price: number
// }
import { useDispatch } from "react-redux";
import { addToCart } from "../Redux/actions/cartActions";

export default function ProdCard({ prod }) {
    const dispatch = useDispatch();
    return (
        <div className="card h-100 shadow-sm">
            {prod.image && (
                <img
                    src={prod.image}
                    className="card-img-top"
                    alt={prod.title}
                    style={{ height: "180px", objectFit: "cover" }}
                />
            )}

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{prod.title}</h5>

                {prod.description && (
                    <p className="card-text text-muted small mb-2">
                        {prod.description}
                    </p>
                )}

                <div className="mt-auto d-flex align-items-center justify-content-between">
                    <span className="fw-semibold">₹{prod.price}</span>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => dispatch(addToCart(prod))}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}