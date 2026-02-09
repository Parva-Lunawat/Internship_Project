// let latestQuote = "Loading quotes...";

// async function quotesLoader() {
//     try {
//         const response = await fetch("https://thequoteshub.com/api/random-quote?format=json");
//         const data = await response?.json();
//         latestQuote = data?.text;
//     } catch (error) {
//         console.error("Background fetch failed", error);
//     }
// }

// setInterval(quotesLoader, 2000);
// quotesLoader();

// export const getLatestQuote = () => latestQuote;

export default function getQuotesService({
    url = "https://thequoteshub.com/api/random-quote?format=json", // a constructor of sort with default values
    timer = 20000, // = {} if no value passed use default only
} = {}) {
    let latestQuote = "Loading quotes...";
    async function refresh() {
        try {
            const response = await fetch(url);
            const data = await response?.json();
            latestQuote = data?.text ?? latestQuote;
        } catch (error) {
            console.error("Unable to fetch quote:", error);
        }
    }
    setInterval(refresh, timer);
    refresh();
    console.log("service works");
    return {
        getLatestQuote() {
            // js closures so as to not pass stale value rather pass live state
            return latestQuote;
        },
    };
}
