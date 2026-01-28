export default function CartCard({
	item,
	onRemove,
	onDecrease,
	onIncrease,
}) {
	return (
		<div className="list-group-item d-flex gap-3 align-items-start border border-black rounded">
			{/* Image */}
			{item.image ? (
				<img
					src={item.image}
					alt={item.title}
					width="90"
					height="70"
					style={{ objectFit: "cover" }}
					className="rounded"
				/>
			) : (
				<div
					className="bg-light border rounded"
					style={{ width: 90, height: 70 }}
				/>
			)}

			{/* Details */}
			<div className="flex-grow-1">
				<div className="d-flex justify-content-between">
					<div>
						<div className="fw-semibold">{item.title}</div>

						{item.description && (
							<div className="text-muted small">{item.description}</div>
						)}

						<div className="text-muted small mt-1">₹{item.price} each</div>
					</div>

					<button
						className="btn btn-outline-danger btn-sm"
						onClick={() => onRemove(item.id)}
					>
						Remove
					</button>
				</div>

				{/* Quantity + Line total */}
				<div className="d-flex align-items-center justify-content-between mt-3">
					<div className="btn-group" role="group" aria-label="Quantity">
						<button
							className="btn btn-outline-secondary btn-sm"
							onClick={() => onDecrease(item)}
						>
							-
						</button>

						<button className="btn btn-outline-secondary btn-sm" disabled>
							{item.quantity}
						</button>

						<button
							className="btn btn-outline-secondary btn-sm"
							onClick={() => onIncrease(item)}
						>
							+
						</button>
					</div>

					<div className="fw-semibold">₹{item.price * item.quantity}</div>
				</div>
			</div>
		</div>
	);
}
