import { useEffect, useState } from "react";

type quoteSet = {
    q: string;
    author: string;
}
export function oldQuotesCaller() {
    const [quote, setQuote] = useState<quoteSet>({
        q: "", author: ""
    });
    useEffect(() => {
        const source = new EventSource("/api/quotes/stream");
        source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setQuote({
                q: data.latestQuote,
                author: data.author
            });
        };
        return () => {
            source.close();
        };
    }, []);
    return (
        <div style={{ padding: 20 }}>
            <h2>Quote</h2>
            <p>{quote.q}</p>
            <p><b>- {quote.author}</b></p>
        </div>
    );
}

export default function QuotesCaller() {
    const [quote, setQuote] = useState<quoteSet>({
        q: "", author: ""
    });
    const [streamOn, setStreamOn] = useState(true);
    const [paused, setPaused] = useState(false);
    useEffect(() => {
        if (!streamOn) return;
        const source = new EventSource("/api/quotes/stream");
        source.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setQuote({
                q: data.latestQuote,
                author: data.author
            });
        };
        return () => {
            source.close();
        }
    }, [streamOn]);
    const togglePause = async () => {
        if (!paused) {
            await fetch("/api/quotes/pause", { method: "POST" });
            setPaused(true);
        } else {
            await fetch("/api/quotes/resume", { method: "POST" });
            setPaused(false);
        }
    };
    const triggerNext = async () => {
        const res = await fetch("/api/quotes/next", { method: "POST" });
        const data = await res.json();
        setQuote({
            q: data.latestQuote,
            author: data.author
        });
    }
    return (
        <div style={{ padding: 20 }}>
            <h2>Quote</h2>
            <p>{quote.q}</p>
            <p><b>- {quote.author}</b></p>

            <button onClick={() => setStreamOn(!streamOn)}>
                {streamOn ? "Stop Stream" : "Start Stream"}
            </button>

            <button onClick={togglePause} style={{ marginLeft: 10 }}>
                {paused ? "Resume API Fetch" : "Pause API Fetch"}
            </button>

            <button onClick={triggerNext} style={{ marginLeft: 10 }}>
                Next Quote
            </button>
        </div>
    );
}