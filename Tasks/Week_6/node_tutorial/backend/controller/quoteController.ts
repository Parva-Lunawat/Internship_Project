export default function quotesController(quoteService) {
    function getLatest(req, res) {
        const {latestQuote, author} = quoteService.getLatestQuote();
        res.json({latestQuote, author});
    }
    async function triggerNext(req, res) {
        const {latestQuote, author} = await quoteService.forceRefresh();
        res.status(200).json({latestQuote, author});
    }
    function pauseFetch(req, res) {
        quoteService.pause();
        res.json({paused: true});
    }
    function resumeFetch(req, res) {
        quoteService.resume();
        res.json({paused: false});
    }
    function status(req, res) {
        res.json({ paused: quoteService.isPaused() });
    }
    return { getLatest, triggerNext, pauseFetch, resumeFetch, status };
}
