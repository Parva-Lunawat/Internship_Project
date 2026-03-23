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
    let author = "Awaiting...";
    let intervalId: NodeJS.Timeout | null = null;
    let paused = false;
    async function refresh() {
        try {
            const response = await fetch(url);
            const data = await response.json();
            latestQuote = data?.text ?? latestQuote;
            author = data.author ?? author;
        } catch (error) {
            console.error("Unable to fetch quote:", error);
        }
    }
    function startAutoFetch() {
        if (intervalId) return;
        paused = false;
        intervalId = setInterval(refresh, timer);
    }
    function stopAutoFetch() {
        paused = true;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    startAutoFetch();
    refresh();
    return {
        getLatestQuote: () => ({latestQuote, author}),
            // js closures so as to not pass stale value rather pass live state
        forceRefresh: async () => {
            await refresh();
            return {latestQuote, author};
        },
        pause: () => stopAutoFetch(),
        resume: () => startAutoFetch(),
        isPaused: () => paused,
    };
}
