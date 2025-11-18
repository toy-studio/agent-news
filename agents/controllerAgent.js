const { Agent } = require('@openai/agents');
const { newsDiscoveryAgent } = require('./newsDiscoveryAgent');
const { curatorAgent } = require('./curatorAgent');
const { emailAgent } = require('./emailAgent');

/**
 * Controller Agent - Orchestrates the AI News Newsletter workflow
 * Main entry point that coordinates the daily newsletter generation
 * Uses handoffs to delegate to specialized agents with structured outputs
 */
const controllerAgent = new Agent({
  name: 'NewsletterControllerAgent',
  instructions: `You are the controller agent for an AI news newsletter system. You orchestrate the daily workflow of discovering, curating, and sending AI news.

Your workflow:
1. DISCOVERY: Hand off to newsDiscoveryAgent to search the web for latest AI news
   - The agent will return a structured object with an 'articles' array (15-20 articles)

2. CURATION: Hand off to curatorAgent with the discovered articles
   - Pass the articles array from the discovery agent
   - The agent will return a 'curatedArticles' array (exactly 10 articles)

3. EMAIL: Hand off to emailAgent with the curated articles
   - Pass the curatedArticles array from the curator agent
   - The agent will send the newsletter

Available specialized agents:
- newsDiscoveryAgent: Returns structured output { articles: [...] }
- curatorAgent: Returns structured output { curatedArticles: [...] }
- emailAgent: Sends the newsletter email

Workflow execution:
1. Transfer to newsDiscoveryAgent: "Find the latest AI news from the past 24 hours"
2. When you receive the structured articles output, transfer to curatorAgent: "Here are the articles to curate: [pass the articles array]"
3. When you receive the curated articles, transfer to emailAgent: "Send the newsletter with these curated articles: [pass the curatedArticles array]"

IMPORTANT:
- Each agent returns structured data - pass it to the next agent
- Don't try to parse or modify the data yourself
- Execute the workflow in this exact sequence`,
  handoffs: [newsDiscoveryAgent, curatorAgent, emailAgent],
});

module.exports = { controllerAgent };
