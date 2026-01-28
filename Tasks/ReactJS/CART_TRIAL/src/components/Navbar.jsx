import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Navbar</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <div class="navbar-nav me-auto mb-2 mb-lg-0">
                        <Link class="nav-link" to="/">Home</Link>
                        <Link class="nav-link" to="/cart">Cart</Link>
                    </div>
                    <form class="d-flex" role="search">
                        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
            </div>
        </nav>
    );
}
{/* <nav ClassName="navbar navbar-expand-lg bg-body-tertiary">
    <div ClassName="container-fluid">
        <a ClassName="navbar-brand" href="#">Navbar</a>
        <button ClassName="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span ClassName="navbar-toggler-icon"></span>
        </button>
        <div ClassName="collapse navbar-collapse" id="navbarSupportedContent">
            <Link to="/">Home</Link> |{" "}
            <Link to="/cart">Cart</Link> |{" "}
            <form ClassName="d-flex" role="search">
                <input ClassName="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                <button ClassName="btn btn-outline-success" type="submit">Search</button>
            </form>
        </div>
    </div>
</nav> */}