import express from "express";
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
    router.get("/api/quotes/status", quotesController.status);
    router.post("/api/quotes/next", quotesController.triggerNext);
    router.post("/api/quotes/pause", quotesController.pauseFetch);
    router.post("/api/quotes/resume", quotesController.resumeFetch);

    router.get("/api/quotes/stream", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        let lastSentPayload = "";
        const send = () => {
            const payload = quoteService.getLatestQuote();
            if (payload.latestQuote !== lastSentPayload) {
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
                lastSentPayload = payload.latestQuote;
            }
        };

        send();
        const id = setInterval(send, 1000);
        
        req.on("close", () => {
            clearInterval(id);
            res.end();
        });
    });
    return router;
}
