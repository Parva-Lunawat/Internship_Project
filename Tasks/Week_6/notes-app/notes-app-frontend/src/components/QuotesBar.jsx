import { useEffect, useState } from "react";

export default function QuotesBar() {
    const [quote, setQuote] = useState("");
    useEffect(() => {
        let timerID;
        let isActive = true;
        let controller = new AbortController();
        async function fetchQuote() {
            if (!isActive) return; // if comp unmount return
            try {
                controller.abort();
                controller = new AbortController();
                const res = await fetch("https://thequoteshub.com/api/random-quote?format=json", {signal: controller.signal})
                if (!res.ok) throw new Error("Failed to fetch quote");
                const data = await res.json();

                if (!isActive) return;
                if (data.text.length <= 300) {
                    setQuote(data);
                    timerID = setTimeout(fetchQuote, 20000);
                } else {
                    console.warn("Long Quote");
                    timerID = setTimeout(fetchQuote, 2000);
                }
            } catch(err) {
                if(err?.name ==="AbortError") return;
                console.error(err);
                timerID = setTimeout(fetchQuote, 2000);
            }
        }
        fetchQuote();
        return () => {
            isActive = false;
            controller.abort();
            if (timerID) clearTimeout(timerID);
        }
    }, []);

    // Specific Tag and Amount Quote generator
    // useEffect(() => {
    //     let timerID;
    //     let isActive = true;
    //     let controller = new AbortController();
    //     async function fetchQuote() {
    //         if (!isActive) return; // if comp unmount return
    //         try {
    //             const res = await fetch("https://thequoteshub.com/api/tags/motivation?page=1&page_size=100&format=json", { signal: controller.signal })
    //             if (!res.ok) throw new Error("Failed to fetch quote");
    //             const data = await res.json();
    //             let quotes = data.quotes
    //             if (!isActive) return;
    //             let validQuotes = quotes.filter(q => q.text.length <= 300);
    //             if (validQuotes.length > 0) {
    //                 const randomQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];
    //                 setQuote(randomQuote);
    //                 timerID = setTimeout(fetchQuote, 20000);
    //             }
    //         } catch (err) {
    //             if (err?.name === "AbortError") return;
    //             console.error(err);
    //             timerID = setTimeout(fetchQuote, 2000);
    //         }
    //     }
    //     fetchQuote();
    //     return () => {
    //         isActive = false;
    //         controller.abort();
    //         if (timerID) clearTimeout(timerID);
    //     }
    // }, []);

    return (<div className="fixed ml-20 flex justify-center item-center bottom-0 right-0 left-0 bg-zinc-900 text-zinc-100 px-20 py-5">
        {quote.text ? (
            <p className="text-m italic text-center">
                “{quote.text}”
                <span className="not-italic font-medium ml-2"> — {quote.author}</span>
            </p>
        ) : (
            <p className="text-sm italic">Loading quote...</p>
        )}
    </div>
    );
}