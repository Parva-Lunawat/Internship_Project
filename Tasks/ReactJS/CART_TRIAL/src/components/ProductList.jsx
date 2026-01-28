import ProdCard from "./ProdCard";

export default function ProductList({ products }) {
	return (
		<div className="container">
			<div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
				{products.map((prod) => (
					<div className="col" key={prod.id}>
						<ProdCard prod={prod} />
					</div>
				))}
			</div>
		</div>
	);
}
