import express from "express";
import { styleText } from "node:util";
// export default function getQuotesRoute(quotesController) {
//     const router = express.Router();
//     router.get("/quotes", quotesController.getLatest);
//     console.log("Route works");
//     return router;
// }

// doing SSE (Server Sent Events) flow here to continously stream quotes on frontend
// res.setHeader(name, value)


export default function getQuotesRoute(quotesController, quoteService) {
    const router = express.Router();
    router.get("/api/quotes", quotesController.getLatest);
    router.get("/api/quotes/stream", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.flushHeaders?.();

        const send = () => {
            const payload = quoteService.getLatestQuote();
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        };

        send();
        const id = setInterval(send, 2000);
        
        req.on("close", () => {
            clearInterval(id);
            res.end();
        });
    });
    return router;
}
