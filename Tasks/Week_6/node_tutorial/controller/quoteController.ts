export default function quotesController(quoteService) {
    console.log("Controller Works");
    function getLatest(req, res) {
        const quote = quoteService.getLatestQuote();
        console.log(quote);
        res.send(`Latest Quote: ${quote}`);
    }
    return { getLatest };
}
