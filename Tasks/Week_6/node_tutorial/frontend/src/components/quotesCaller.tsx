import { useEffect, useState } from "react";

type quoteSet = {
    q: string;
    author: string;
}
export default function QuotesCaller() {
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