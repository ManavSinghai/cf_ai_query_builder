/**
 * Durable Object Class: QueryHistory
 * purpose: This class stores a list of query pairs for a single user.
 */
export class QueryHistory {
	constructor(state, env) {
	  this.state = state;
	  this.storage = state.storage;
	}
  
	// Handle HTTP requests sent to this Durable Object
	async fetch(request) {
	  const url = new URL(request.url);
  
	  switch (url.pathname) {
		case '/add': {
		  if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		  }
  
		  const { natural, boolean } = await request.json();
		  let history = (await this.storage.get('history')) || [];
		  history.unshift({ natural, boolean }); 
		  await this.storage.put('history', history);
  
		  return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' },
		  });
		}
  
		case '/history': {
		  // Gets all stored history
		  const history = (await this.storage.get('history')) || [];
		  return new Response(JSON.stringify(history), {
			headers: { 'Content-Type': 'application/json' },
		  });
		}
  
		default:
		  return new Response('Not found', { status: 404 });
	  }
	}
  }
  
  /**
   * Main Worker Fetch Handler
   * reason: This is the entry point for all requests.
   */
  export default {
	async fetch(request, env, ctx) {
	  const url = new URL(request.url);
  
	  
	  const doId = env.MY_DURABLE_OBJECT.idFromName('main-history');
	  const stub = env.MY_DURABLE_OBJECT.get(doId);
  
	  // Route requests based on the URL path
	  if (url.pathname === '/api/generate-query') {
		return await handleGenerateQuery(request, stub, env);
	  }
  
	  if (url.pathname === '/api/history') {
		// Forward the request to the DO's /history endpoint
		return stub.fetch(new Request(url.origin + '/history'));
	  }
  
	  return new Response('Not found. Try /api/generate-query or /api/history', {
		status: 404,
	  });
	},
  };
  
  /**
   * Worker Function: handleGenerateQuery
   * Reason: Calls the AI model and then stores the result in the Durable Object.
   */
  async function handleGenerateQuery(request, doStub, env) {
	if (request.method !== 'POST') {
	  return new Response('Please send a POST request', { status: 405 });
	}
  
	// 1.This  gets users query from the request body
	const { natural_query } = await request.json();
	if (!natural_query) {
	  return new Response('Missing "natural_query" in request body', { status: 400 });
	}
  
	
	// 2.the AI prompt for reference
	const prompt = `You are an expert recruiter who builds advanced boolean search queries for job boards like LinkedIn and Google Jobs. Your task is to translate a user's plain-text request into a single, syntactically correct boolean query.

	Rules:
	- Use parentheses () for grouping.
	- Use uppercase AND, OR, NOT.
	- Use quotes "" for exact phrases (e.g., "software engineer").
	- Infer related titles when appropriate (e.g., "software job" -> "software engineer" OR "developer").
	- Identify negative keywords and use NOT (e.g., "no finance" -> NOT "finance" NOT "fintech").

	IMPORTANT: Your entire response must be *only* the boolean query string and nothing else. Do not add any explanation, greeting, or introductory text.

	User Request: ${natural_query}
	Boolean Query:`;
  
	// 3. Calling the Workers AI model
	const ai = env.AI; 
	const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', { prompt });
	const boolean_query = aiResponse.response.trim();
  
	// 4. Storing the result in the Durable Object
	
	const doRequest = new Request(new URL(request.url).origin + '/add', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({
		natural: natural_query,
		boolean: boolean_query,
	  }),
	});
	doStub.fetch(doRequest); 
  
	// 5. Sending the AI's response back to the user
	return new Response(
	  JSON.stringify({
		boolean_query: boolean_query,
	  }),
	  {
		headers: { 'Content-Type': 'application/json' },
	  }
	);
  }