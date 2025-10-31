AI Job Query Builder (Cloudflare AI Assignment)

This is an AI-powered application that helps users build advanced boolean search queries for job boards. The user provides a natural language description of their ideal job, and the application uses an LLM to convert it into a syntactically correct boolean query.

This project was built to fulfill the Cloudflare AI Application assignment and demonstrates all four required components.

Core Components

This project fulfills the four core requirements of the assignment:

LLM: Uses Llama 3.3 8B (@cf/meta/llama-3-8b-instruct) via the Cloudflare Workers AI.

Workflow / Coordination: A Cloudflare Worker (src/index.js) acts as the API backend, handling requests, calling the AI, and coordinating with the Durable Object.

User Input: A static HTML/CSS/JS frontend (Cloudflare Pages-style) is served directly from the Worker using the "assets" configuration in wrangler.jsonc.

Memory / State: A Cloudflare Durable Object (the QueryHistory class) is used to store and retrieve the user's past query history.

How to Run Locally

You will need Node.js installed and a Cloudflare account.

1. Install Dependencies:

npm install


2. Authenticate Wrangler:
This project's AI binding must run in "remote mode," so you must be logged into your Cloudflare account.

npx wrangler login


3. Claim Your Subdomain (If you haven't):
The remote AI binding also requires a free workers.dev subdomain to be configured on your account. If you don't have one, wrangler will provide a link to set one up the first time you run the start command.

4. Run the Local Dev Server:
This command starts the local server, which will serve both the static frontend and the AI backend.

npm run start


5. Try It Out:
Open your browser and visit http://localhost:8787.

You should see the webpage, be able to generate new queries, and see your history load.

How to Deploy

1. Run the Deploy Command:
Make sure you are logged in (npx wrangler login).

npm run deploy


2. View Your Live Application:
Wrangler will publish the Worker and all static assets to your personal workers.dev subdomain (e.g., https://cf-ai-query-builder.your-name.workers.dev). You can visit this URL to see your live application.

Key Files in This Project

/src/index.js: Contains the main Worker fetch handler (which acts as an API router) and the QueryHistory Durable Object class for memory.

/public/: Contains all static frontend files (index.html, main.js, style.css).

wrangler.jsonc: The main configuration file. It's set up to bind the AI ("ai"), the Durable Object ("durable_objects"), and the static asset directory ("assets").

PROMPTS.md: Documents the prompts used for both the Llama 3.3 model and the AI-assisted coding process.

Image of Deployed Application -
<img width="2938" height="1680" alt="image" src="https://github.com/user-attachments/assets/e7af8398-c968-4c7b-b300-8298c970bf50" />
