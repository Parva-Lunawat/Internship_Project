export type posts = {
    pageTitle: string;
    title: string;
    excerpt: string;
    coverImage: string;
    content: string;
    tags: Array<string>;
    publishedAt: string;
    status: "draft" | "published";
    // New Author Type
    author: {
        name: string;
        avatar: string;
    };
};

const dummyPosts: Array<posts> = [
    // --- EXISTING POSTS (Updated with Real Content) ---
    {
        pageTitle: "hello-nextjs",
        title: "Hello Next.js: The Future of React Frameworks",
        excerpt: "My first post using Next.js App Router + TS + Tailwind.",
        coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=60",
        content: "Next.js has fundamentally changed how we build React applications by shifting the paradigm from client-side only rendering to a hybrid approach. With the introduction of the App Router, we now have granular control over Server Components and Client Components, allowing us to ship zero JavaScript for static parts of the page. This architecture significantly improves First Contentful Paint (FCP) and reducing the hydration burden on the browser. \n\nFurthermore, the built-in optimization for images and fonts ensures that core web vitals remain healthy without manual tuning. When combined with TypeScript, the developer experience is unmatched, offering type safety from the database layer all the way to the frontend components. This post explores how to set up a new project, configure the metadata API for SEO, and leverage the new caching mechanisms that Next.js provides out of the box.",
        tags: ["nextjs", "typescript"],
        publishedAt: "2026-01-30",
        status: "published",
        author: { name: "Alex Rivers", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" }
    },
    {
        pageTitle: "tailwind-basics",
        title: "Tailwind Basics That Actually Matter",
        excerpt: "A short practical guide to Tailwind in real projects.",
        coverImage: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200&auto=format&fit=crop&q=60",
        content: "Tailwind CSS is often misunderstood as just 'inline styles', but its true power lies in its design token system and utility-first workflow. Unlike traditional CSS frameworks that give you pre-built components, Tailwind gives you low-level primitives to build completely custom designs without leaving your HTML. This dramatically speeds up the feedback loop between design and implementation. \n\nOne of the most critical features is the configuration file, where you can define your color palette, spacing scale, and typography to match your brand identity exactly. We will also cover how to use arbitrary values for those one-off edge cases, and how to utilize the `@apply` directive sparingly to abstract common patterns without bloating your CSS bundle. By the end of this guide, you will understand why utility classes lead to more maintainable and smaller CSS files in production.",
        tags: ["tailwind"],
        publishedAt: "2026-01-29",
        status: "published",
        author: { name: "Jordan Smith", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }
    },
    {
        pageTitle: "nextjs-app-router-guide",
        title: "Mastering Next.js App Router",
        excerpt: "A deep dive into Server Components, Suspense, and the new file-based routing.",
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=60",
        content: "The transition from the `pages` directory to the `app` directory in Next.js represents a major shift in mental model. The new file-system based router is built on top of React Server Components, meaning that by default, everything is a server component. This allows you to fetch data directly inside your component without `useEffect` or `SWR`, simplifying data requirements and eliminating layout shift. \n\nWe also now have `layout.js`, `template.js`, and `loading.js` special files that make handling nested layouts and suspense boundaries incredibly intuitive. In this article, we will break down how to effectively mix client and server components, how to handle dynamic routes, and the best practices for mutating data using Server Actions, which essentially allow you to call server-side functions directly from your client-side event handlers.",
        tags: ["nextjs", "react"],
        publishedAt: "2026-01-30",
        status: "published",
        author: { name: "Taylor Otwell", avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d" }
    },
    {
        pageTitle: "typescript-generics-explained",
        title: "TypeScript Generics: From Zero to Hero",
        excerpt: "Stop using 'any' and start writing reusable, type-safe code with Generics.",
        coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&auto=format&fit=crop&q=60",
        content: "Generics are one of the most powerful features in TypeScript, yet they are often the most intimidating for beginners. At their core, Generics allow you to write a component or function that can work with a variety of types rather than a single one, while still preserving type safety. Think of them as function arguments, but for types. \n\nInstead of resorting to `any`, which defeats the purpose of TypeScript, Generics let you capture the type passed in by the user (e.g., `<T>`) and use that information later. This is essential for building reusable utility functions, custom hooks, or higher-order components. We will walk through real-world examples, such as building a type-safe HTTP client wrapper and a flexible list component that renders different items based on the data shape, ensuring your code remains robust and refactor-friendly.",
        tags: ["typescript"],
        publishedAt: "2026-01-28",
        status: "published",
        author: { name: "Sarah Drasner", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" }
    },
    {
        pageTitle: "tailwind-responsive-design",
        title: "Responsive Layouts with Tailwind CSS",
        excerpt: "Learn how to build mobile-first designs without leaving your HTML.",
        coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=60",
        content: "Responsive design used to require juggling multiple media queries in separate CSS files, often leading to disconnected and hard-to-maintain code. Tailwind solves this with its prefix-based system (e.g., `md:`, `lg:`, `xl:`), which allows you to visualize how an element behaves across all screen sizes right in your markup. \n\nCalculated mobile-first, Tailwind encourages you to style for the smallest screen first and then layer on complexity for larger viewports. This approach tends to result in simpler, more robust interfaces. In this tutorial, we will rebuild a complex dashboard layout, demonstrating how to switch from a vertical stack on mobile to a multi-column grid on desktop, and how to toggle navigation visibility, all without writing a single line of custom CSS media queries.",
        tags: ["tailwind", "css"],
        publishedAt: "2026-01-25",
        status: "published",
        author: { name: "Adam Wathan", avatar: "https://i.pravatar.cc/150?u=a04258a2462d826712d" }
    },
    {
        pageTitle: "zod-schema-validation",
        title: "Type-Safe API Validation with Zod",
        excerpt: "Ensure your runtime data matches your TypeScript interfaces effortlessly.",
        coverImage: "https://images.unsplash.com/photo-1633265486064-084b219563de?w=1200&auto=format&fit=crop&q=60",
        content: "TypeScript is fantastic for static analysis, but it disappears at runtime. This creates a dangerous gap when dealing with external data from APIs or user inputs, where the actual data might not match your expected types. This is where Zod comes in. Zod is a schema declaration and validation library that bridges this gap. \n\nBy defining a Zod schema, you can parse unknown data and get a guaranteed, typed result back—or a detailed error message if validation fails. It infers the static TypeScript type directly from the schema, so you don't have to define your interfaces twice. We will look at how to use Zod for validating form inputs in React, parsing API responses to prevent crashes, and even validating environment variables to ensure your application is configured correctly before it starts.",
        tags: ["typescript", "validation"],
        publishedAt: "2026-01-22",
        status: "published",
        author: { name: "Colin McDonnell", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026019d" }
    },
    {
        pageTitle: "framer-motion-animations",
        title: "Bringing UI to Life with Framer Motion",
        excerpt: "Simple techniques to add professional animations to your React apps.",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=60",
        content: "Animation in web applications is often treated as an afterthought, but it is crucial for providing feedback and guiding the user's attention. Framer Motion is the production-ready motion library for React that makes complex animations declarative and easy to maintain. Unlike traditional CSS transitions, Framer Motion handles the math of physics-based springs, ensuring your animations feel natural and snappy. \n\nWe will explore the `motion` component, layout animations that automatically morph elements when their position changes, and the `AnimatePresence` component for handling exit animations—something notoriously difficult in raw React. By the end, you'll be able to create micro-interactions, modal transitions, and staggered list reveals that elevate the perceived quality of your application significantly.",
        tags: ["react", "animation"],
        publishedAt: "2026-01-20",
        status: "published",
        author: { name: "Matt Perry", avatar: "https://i.pravatar.cc/150?u=2042581f4e29026704d" }
    },
    {
        pageTitle: "postgresql-vs-mongodb",
        title: "SQL vs NoSQL: Choosing the Right Database",
        excerpt: "A practical comparison for modern web applications in 2026.",
        coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop&q=60",
        content: "The debate between SQL (Relational) and NoSQL (Document) databases is one of the oldest in web development, but the answer isn't always clear-cut. PostgreSQL offers ACID compliance, rigid schemas, and powerful join capabilities, making it ideal for financial data and complex relationships. On the other hand, MongoDB offers flexibility, horizontal scaling, and a JSON-like structure that maps directly to your application objects. \n\nHowever, the lines are blurring. Postgres now has excellent JSONB support, and MongoDB has introduced multi-document transactions. In this article, we will compare them based on developer experience, scalability needs, and data integrity requirements. We will also discuss the rise of 'NewSQL' and serverless database providers like Neon and Supabase that are making relational databases easier to manage than ever before.",
        tags: ["database", "backend"],
        publishedAt: "2026-01-18",
        status: "published",
        author: { name: "Dan Abramov", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026015d" }
    },
    {
        pageTitle: "docker-for-frontend-devs",
        title: "Why Frontend Developers Need Docker",
        excerpt: "Containerize your development environment for consistency across teams.",
        coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&auto=format&fit=crop&q=60",
        content: "It works on my machine' is the most dreaded phrase in software development. Docker solves this by allowing you to package your application and its entire environment—Node.js version, operating system libraries, and dependencies—into a container that runs identically everywhere. While often seen as a backend or DevOps tool, Docker is incredibly valuable for frontend teams. \n\nIt allows you to spin up local instances of your backend services, databases, and mocking servers with a single command (`docker-compose up`). We will cover how to write a multi-stage Dockerfile for a Next.js application that optimizes for small image sizes, how to network containers together locally, and how this workflow simplifies the CI/CD pipeline by using the exact same container for testing and production deployment.",
        tags: ["devops", "docker"],
        publishedAt: "2026-01-15",
        status: "published",
        author: { name: "Kelsey Hightower", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026033d" }
    },
    {
        pageTitle: "authentication-with-nextauth",
        title: "Implementing Auth with NextAuth.js",
        excerpt: "The easiest way to add Google, GitHub, or Email login to your Next.js project.",
        coverImage: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&auto=format&fit=crop&q=60",
        content: "Building authentication from scratch is a security minefield involving encrypted cookies, JWTs, CSRF protection, and database session management. NextAuth.js (now Auth.js) abstracts all this complexity away, providing a secure, modular solution specifically designing for Next.js. It supports virtually every OAuth provider (Google, GitHub, Twitter) out of the box, as well as passwordless email sign-in. \n\nWe will walk through setting up the API route handlers, configuring the session provider, and protecting your application routes using middleware. We will also touch on how to persist user sessions to a database using adapters like Prisma, allowing you to enrich the user profile with custom data. Whether you need simple social login or a complex role-based access control system, NextAuth is the standard for a reason.",
        tags: ["nextjs", "security"],
        publishedAt: "2026-01-10",
        status: "published",
        author: { name: "Balázs Orbán", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026044d" }
    },

    // --- NEW POSTS (12 New Items) ---
    {
        pageTitle: "react-query-mastery",
        title: "Server State Management with React Query",
        excerpt: "Why you should stop using useEffect for data fetching.",
        coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=60",
        content: "For years, React developers managed server state using a messy combination of `useEffect`, `useState`, and Redux. This led to race conditions, loading spinner hell, and out-of-sync data. React Query (TanStack Query) solves this by treating server state differently from client state. It handles caching, deduplication, background updates, and stale-while-revalidate logic automatically. \n\nIn this guide, we'll replace a complex fetching implementation with a simple `useQuery` hook. We will examine how to pre-fetch data for snappy page transitions, how to invalidate queries after a mutation (like posting a new comment), and how to implement infinite scrolling with `useInfiniteQuery`. Once you adopt this pattern, you'll realize that 90% of the 'state' you were managing manually was actually just cached server data.",
        tags: ["react", "library"],
        publishedAt: "2026-01-08",
        status: "published",
        author: { name: "Tanner Linsley", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026011d" }
    },
    {
        pageTitle: "edge-functions-explained",
        title: "Going Global: Understanding Edge Functions",
        excerpt: "Run your backend logic closest to your user's location.",
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=60",
        content: "Traditional serverless functions (Lambdas) usually run in a single region, meaning a user in Tokyo might have to wait for a server in Virginia to respond. Edge functions change the game by deploying your code to hundreds of data centers worldwide. When a user makes a request, the function executes at the 'edge' location physically closest to them, resulting in near-instant latency. \n\nHowever, the Edge runtime is more limited than a full Node.js environment—it relies on standard Web APIs. We will discuss the trade-offs, valid use cases like authentication middleware, A/B testing, and geolocation-based redirects, and how platforms like Vercel and Cloudflare Workers are making this technology accessible to frontend developers without needing deep DevOps knowledge.",
        tags: ["performance", "serverless"],
        publishedAt: "2026-01-05",
        status: "published",
        author: { name: "Lee Robinson", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026088d" }
    },
    {
        pageTitle: "astro-islands-architecture",
        title: "Astro and the Islands Architecture",
        excerpt: "Shipping zero JavaScript by default for content-heavy sites.",
        coverImage: "https://images.unsplash.com/photo-1610483145520-a7a98a41238c?w=1200&auto=format&fit=crop&q=60",
        content: "Astro has surged in popularity by challenging the Single Page Application (SPA) dominance for content sites. Its 'Islands Architecture' allows you to build your site with React, Vue, or Svelte, but strips away all the JavaScript at build time, shipping only pure HTML and CSS to the browser. \n\nYou then explicitly 'hydrate' only the interactive parts (islands) of the page using directives like `client:visible` or `client:load`. This results in blazing fast load times and perfect SEO scores. We will build a blog with a dynamic search bar (the island) embedded in static content, demonstrating how Astro orchestrates partial hydration. If you are building a marketing site, blog, or portfolio, Astro might be a better choice than a heavy application framework.",
        tags: ["astro", "performance"],
        publishedAt: "2026-01-03",
        status: "published",
        author: { name: "Fred Schott", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026099d" }
    },
    {
        pageTitle: "rust-for-web-tooling",
        title: "Why Rust is Taking Over Web Tooling",
        excerpt: "From SWC to Turbopack: The speed revolution.",
        coverImage: "https://images.unsplash.com/photo-1515524738708-327f6b0033a7?w=1200&auto=format&fit=crop&q=60",
        content: "If you've noticed that your dev server starts instantly now compared to a few years ago, you have Rust to thank. Tools written in JavaScript (like Webpack and Babel) hit a performance ceiling. The new wave of tooling—SWC, Turbopack, and Lightning CSS—is written in Rust, a systems programming language known for memory safety and incredible speed. \n\nThis shift isn't just about saving a few seconds; it fundamentally changes the developer workflow. We can now lint, format, and bundle massive codebases in milliseconds. We will explore the current ecosystem, how Next.js utilizes SWC for compilation, and what the future holds for WebAssembly (Wasm) allowing us to run high-performance modules (like video editing or image processing) directly in the browser.",
        tags: ["tooling", "rust"],
        publishedAt: "2025-12-28",
        status: "published",
        author: { name: "Shu Ding", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026077d" }
    },
    {
        pageTitle: "css-grid-vs-flexbox",
        title: "CSS Grid vs Flexbox: When to Use Which",
        excerpt: "Stop guessing. A definitive guide to modern layout techniques.",
        coverImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200&auto=format&fit=crop&q=60",
        content: "Many developers stick to Flexbox for everything because it's familiar, but ignoring CSS Grid limits your layout capabilities. The general rule of thumb is: Flexbox is for one-dimensional layouts (a row OR a column), while Grid is for two-dimensional layouts (rows AND columns). \n\nWe will build a complex magazine-style layout that would be a nightmare with Flexbox but is trivial with Grid's `grid-template-areas`. We will also cover the `minmax()` function, `fr` units, and `auto-fit` vs `auto-fill` keywords which allow for responsive designs that adapt to screen width without media queries. Understanding the strengths of both systems allows you to combine them—using Grid for the macro page structure and Flexbox for the micro component alignment.",
        tags: ["css", "design"],
        publishedAt: "2025-12-25",
        status: "published",
        author: { name: "Rachel Andrew", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026066d" }
    },
    {
        pageTitle: "storybook-ui-development",
        title: "Component-Driven Development with Storybook",
        excerpt: "Build, test, and document components in isolation.",
        coverImage: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=60",
        content: "Developing components directly inside your main application page can be slow and brittle. You have to navigate to the specific state, fill out forms, or mock data just to see how a button looks. Storybook allows you to build UI components in complete isolation. You create 'stories' that capture every state of your component (loading, error, success, empty). \n\nThis encourages better component design because you can't rely on global app state or context that might not be present. It also serves as living documentation for your design system. We will set up Storybook for a React project, add controls to tweak props dynamically in the browser, and look at how visual regression testing can automatically catch UI bugs before they merge.",
        tags: ["testing", "design-system"],
        publishedAt: "2025-12-22",
        status: "published",
        author: { name: "Brad Frost", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026055d" }
    },
    {
        pageTitle: "web-accessibility-101",
        title: "Web Accessibility (a11y) Is Not Optional",
        excerpt: "Making your web apps usable for everyone, including screen readers.",
        coverImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&auto=format&fit=crop&q=60",
        content: "Accessibility is often treated as a compliance checklist item, but it is actually a fundamental aspect of user experience. A semantic, accessible website is often faster, easier to crawl for SEO, and better structured. We will dive into the basics of semantic HTML—using `<button>` instead of `<div onClick>`, proper heading hierarchy, and `aria-labels`. \n\nWe will also explore focus management, which is critical for keyboard-only users. If you open a modal, does the focus get trapped inside it? If you close it, does focus return to the trigger button? These details matter. We will use tools like Lighthouse and the NVDA screen reader to audit a page and fix common contrast and navigation issues that exclude millions of users from using your product.",
        tags: ["accessibility", "html"],
        publishedAt: "2025-12-20",
        status: "published",
        author: { name: "Marcy Sutton", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026044a" }
    },
    {
        pageTitle: "state-management-wars",
        title: "Redux vs. Context vs. Zustand",
        excerpt: "Navigating the crowded landscape of React state management.",
        coverImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&auto=format&fit=crop&q=60",
        content: "React's built-in Context API is powerful, but it wasn't designed for high-frequency updates, often leading to performance issues where the entire app re-renders on every keystroke. Redux is the battle-tested giant, but its boilerplate can be overwhelming for smaller apps. Enter Zustand: a small, fast, and unopinionated state management solution that has gained massive traction. \n\nWe will compare these three approaches by building the same shopping cart functionality with each. You will see how Redux Toolkit has simplified Redux, how Context is best for low-velocity global data (like themes or user auth), and how Zustand offers a mental model that feels like a simple JavaScript object but with React reactivity. Choosing the right tool depends entirely on your app's complexity.",
        tags: ["react", "state"],
        publishedAt: "2025-12-18",
        status: "published",
        author: { name: "Daishi Kato", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026033a" }
    },
    {
        pageTitle: "monorepos-turborepo",
        title: "Scaling with Monorepos and Turborepo",
        excerpt: "Managing multiple packages and apps in a single repository.",
        coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=60",
        content: "As organizations grow, they often split code into multiple repositories, leading to version mismatch hell and code duplication. Monorepos allow you to keep your frontend, backend, and shared UI libraries in one place. However, without the right tooling, builds can become agonizingly slow. \n\nTurborepo is a high-performance build system for JavaScript and TypeScript monorepos. It caches the results of your tasks (build, lint, test). If you've already built a package and haven't changed the code, Turborepo replays the output instantly instead of rebuilding. We will set up a workspace with a Next.js app, a Vite app, and a shared UI library, demonstrating how changes in the library instantly propagate to both apps during development.",
        tags: ["devops", "architecture"],
        publishedAt: "2025-12-15",
        status: "published",
        author: { name: "Jared Palmer", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026022a" }
    },
    {
        pageTitle: "ai-sdk-integration",
        title: "Building AI Apps with Vercel AI SDK",
        excerpt: "Streaming LLM responses directly to your React components.",
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=60",
        content: "Integrating Large Language Models (LLMs) like GPT-4 into web apps used to require complex backend infrastructure to handle timeouts and long-running requests. The Vercel AI SDK simplifies this by providing hooks like `useChat` and `useCompletion` that handle the streaming UI automatically. \n\nInstead of waiting 10 seconds for the full AI response, your user sees the text appearing character by character, just like ChatGPT. We will build a document Q&A bot that uses vector embeddings to search your own data and generate an answer. We'll cover the edge runtime requirements, how to format prompts for better accuracy, and how to switch between different providers like OpenAI, Anthropic, or HuggingFace with just a few lines of configuration change.",
        tags: ["ai", "nextjs"],
        publishedAt: "2025-12-12",
        status: "published",
        author: { name: "Guillermo Rauch", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026011a" }
    },
    {
        pageTitle: "testing-vitest-react",
        title: "Modern Testing with Vitest and React Testing Library",
        excerpt: "Fast, reliable unit and integration tests for your components.",
        coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=60",
        content: "Jest has been the king of testing for years, but it can be slow and difficult to configure with modern bundlers like Vite. Vitest is a blazing fast unit test framework powered by Vite. It offers a compatible API to Jest, so migration is often trivial, but it runs natively with ESM support and shares your existing build configuration. \n\nWe will demonstrate how to test a React form component using React Testing Library, which encourages testing behavior (e.g., 'user clicks button') rather than implementation details (e.g., 'state is updated'). We will write tests to verify validation logic, mock API calls using MSW (Mock Service Worker), and ensure our application is robust against refactors. A good test suite gives you the confidence to ship changes on a Friday.",
        tags: ["testing", "vitest"],
        publishedAt: "2025-12-10",
        status: "published",
        author: { name: "Kent C. Dodds", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026000a" }
    },
    {
        pageTitle: "graphql-apollo-client",
        title: "Efficient Data with GraphQL and Apollo",
        excerpt: "Avoid overfetching and underfetching with a graph-based query language.",
        coverImage: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?w=1200&auto=format&fit=crop&q=60",
        content: "REST APIs are great, but they often suffer from the N+1 problem or send back way more data than the client needs. GraphQL allows the client to describe exactly what data it wants, and the server responds with exactly that structure. \n\nIn this post, we will set up Apollo Client in a React application to query a public GraphQL API. We will look at how to structure fragments to share data requirements between components, how to use mutations to update data, and how Apollo's normalized cache automatically updates your UI across the app without needing a reload. While GraphQL introduces more complexity on the backend, the flexibility it gives frontend teams to iterate without waiting for backend changes is a massive productivity booster.",
        tags: ["graphql", "backend"],
        publishedAt: "2025-12-05",
        status: "published",
        author: { name: "Uri Goldshtein", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026088b" }
    }
];



export function getAllPublishedPosts(): Array<posts> {
    return dummyPosts.filter((p) => p.status === "published")
        .sort((a, b) => (a.publishedAt < b.publishedAt) ? 1 : -1);
}

export function getPostsBypageTitle(pageTitle: string): posts | undefined {
    return dummyPosts.find((p) => p.pageTitle === pageTitle && p.status === "published");
}

export function paginatedPosts({ page, pageSize }: { page: number, pageSize: number }) {
    const allPosts = getAllPublishedPosts();
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / pageSize);
    const start = (page - 1) * pageSize; // if start from "1" page index 
    const end = start + pageSize;
    const posts = allPosts.slice(start, end);
    return {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
    };
}

export function filteredPaginatedPosts({page, pageSize, query, tag}: 
    {page: number, pageSize: number, query: string, tag: string}) {
    let allPosts = getAllPublishedPosts();
    if (query) {
        const q = query.toLowerCase();
        allPosts = allPosts.filter((post) => 
            post.title.toLowerCase().includes(q)
        );
    }

    if (tag) {
        const t = tag.toLowerCase();
        allPosts = allPosts.filter((post) =>
            post.tags.some(tag => tag.toLowerCase() === t)
        );
    }

    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const posts = allPosts.slice(start, end);

    return {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
    };
}