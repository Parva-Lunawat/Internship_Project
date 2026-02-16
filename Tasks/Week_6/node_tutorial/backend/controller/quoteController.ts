export default function quotesController(quoteService) {
    function getLatest(req, res) {
        const {latestQuote, author} = quoteService.getLatestQuote();
        res.json({latestQuote, author});
    }
    return { getLatest };
}
