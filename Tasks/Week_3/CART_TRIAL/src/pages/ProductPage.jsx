import { useMemo } from "react";
import ProductList from "../components/ProductList";

export default function ProductPage() {
    const products = useMemo(
        () => [
            {
                id: "sku-iphone-case-001",
                title: "Shockproof Phone Case (iPhone/Android)",
                price: 499,
                description:
                    "TPU + polycarbonate, raised edges for screen/camera protection.",
                image: "https://picsum.photos/seed/case/600/400",
            },
            {
                id: "sku-wireless-mouse-002",
                title: "Wireless Mouse (2.4GHz, Silent Click)",
                price: 699,
                description: "Ergonomic shape, 1200–1600 DPI, USB receiver included.",
                image: "https://picsum.photos/seed/mouse/600/400",
            },
            {
                id: "sku-notebook-a5-003",
                title: "A5 Notebook (Hardcover, 200 pages)",
                price: 249,
                description: "Smooth paper for gel pens, elastic band, inner pocket.",
                image: "https://picsum.photos/seed/notebook/600/400",
            },
            {
                id: "sku-water-bottle-004",
                title: "Steel Water Bottle (750ml, Insulated)",
                price: 899,
                description: "Keeps drinks cold/hot for hours, leak-proof cap.",
                image: "https://picsum.photos/seed/bottle/600/400",
            },
            {
                id: "sku-usb-c-cable-005",
                title: "USB-C Fast Charging Cable (1.5m)",
                price: 299,
                description: "Durable braided cable, supports fast charging & data sync.",
                image: "https://picsum.photos/seed/cable/600/400",
            },
            {
                id: "sku-backpack-006",
                title: "Laptop Backpack (15.6-inch, Water Resistant)",
                price: 1699,
                description: "Padded laptop sleeve, multiple compartments, bottle holder.",
                image: "https://picsum.photos/seed/backpack/600/400",
            },
            {
                id: "sku-headphones-007",
                title: "On-Ear Headphones (Wired, Deep Bass)",
                price: 1199,
                description: "Lightweight, foldable design, 3.5mm jack.",
                image: "https://picsum.photos/seed/headphones/600/400",
            },
            {
                id: "sku-led-lamp-008",
                title: "Desk LED Lamp (3 brightness levels)",
                price: 799,
                description: "Eye-care lighting, touch control, flexible neck.",
                image: "https://picsum.photos/seed/lamp/600/400",
            },
        ],
        []
    );

    return (
        <div className="bg-light min-vh-100">
            <div className="container">
                <h4 className="mb-3">Products</h4>
                <ProductList products={products} />
            </div>
        </div>

    );
}
