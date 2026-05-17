---
layout: post
title: TypeScript Comprehensive Notes
---

Node.js is an open-source and cross-platform JavaScript runtime environment. Node.js runs the V8 JavaScript engine, Google Chrome's core, outside the browser.
A Node.js app runs in a single process, without creating a new thread for every request:
    Node.js uses a single main flow of execution (thread) to manage all client requests, rather than dedicating a new, separate thread for each incoming request like traditional server architectures (such as Apache or Java-based servers).
    Single Main Thread: All your JavaScript code runs on this one main thread. This avoids the complexities of managing multiple threads (like deadlocks or race conditions over shared memory).
    Non-blocking I/O: When the main thread encounters an operation that would normally require waiting (like a database query, file system access, or a network request), it doesn't stop and wait for that operation to complete. Instead, it delegates the task to the underlying system (managed by the libuv library) and continues to process other incoming requests.
    Background Processing: libuv uses a small, internal thread pool (separate from the main JavaScript thread) to handle these "heavy lifting" I/O operations in the background.
    Callbacks and Queues: Once a background operation is finished, its associated callback function is placed into an event queue.
    Event Loop Action: The event loop continuously checks if the main call stack is empty. If it is, it pushes the next callback from the queue onto the call stack for execution.

Promise: A promise is commonly defined as a proxy for a value that will eventually become available. Once a promise has been called, it will start in a pending state. This means that the calling function continues executing, while the promise is pending until it resolves, giving the calling function whatever data was being requested.