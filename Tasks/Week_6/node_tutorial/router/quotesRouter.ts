import express from "express";
export default function getQuotesRoute(quotesController) {
    const router = express.Router();
    router.get("/quotes", quotesController.getLatest);
    console.log("Route works");
    return router;
}
