NodeJS Notes

Browser <--> API Layer <--> Backend <--> DB

src -> 
    index -> DB Connection
    app -> config cookie url encoding
    constants -> enums db names etc
db -> actual db connection code
models -> data models, schemas
controllers -> methods/functionality (this is MVC)
routes -> routing complete routing logic what controller to call when which route etc
middlewares ->
utils -> extra utilities of code like emailing models etc

get -> browser to server
post -> server -> browser

client server normal Events 
Client → Request
Server → Response
Connection closes

SSE style 
Client → Request
Server → Keeps connection open
Server → Sends data continuously
Connection stays alive

how to make possible --> use setHeader (sits on top of Node’s http module; Headers go before the actual content; metadata basically)
Content-Type: text/event-stream -> “This response is a live event stream.” (If not set: Browser treats response as plain text or JSON; It closes connection immediately; EventSource will fail)
| Scenario      | Content-Type                        |
| ------------- | ----------------------------------- |
| JSON API      | `application/json`                  |
| HTML page     | `text/html`                         |
| Plain text    | `text/plain`                        |
| File download | `application/pdf`, `image/png`, etc |
| SSE           | `text/event-stream`                 |

Cache-Control: no-cache --> Tells browser + proxies: Do not store this response.; 
If not set: Browser may cache it; Reverse proxy (like Nginx) may buffer it; Client may not receive live updates; Streaming must never be cached.
| Header         | Meaning             |
| -------------- | ------------------- |
| `no-cache`     | Must revalidate     |
| `no-store`     | Do not store at all |
| `max-age=3600` | Cache for 1 hour    |
| `public`       | Cache allowed       |
| `private`      | Only browser cache  |

Connection: keep-alive
Meaning:

Tells client:

“Do not close the TCP connection after this response.”

Normally:

HTTP closes after sending data.

But SSE needs:

Connection alive for continuous writes.

If missing:

Connection may close.

Browser stops receiving events.

Why res.flushHeaders() sometimes?

You may see:

res.flushHeaders();


This forces headers to be sent immediately.

Normally:

Node waits until first res.write() or res.send().

With SSE, we want headers sent immediately.