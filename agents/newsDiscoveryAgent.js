const { Agent, webSearchTool, handoff } = require('@openai/agents');
const { z } = require('zod');

// Forward declaration - will be set after curatorAgent is imported
let curatorAgentHandoff;

/**
 * News Discovery Agent
 * Specializes in finding the latest AI news from across the web
 * Uses OpenAI's webSearchTool to search the internet for recent news
 */
const newsDiscoveryAgent = Agent.create({
  name: 'NewsDiscoveryAgent',
  instructions: `You are a news discovery agent. Find recent AI news articles and hand them off to the curator.

Your job:
1. Use web_search to find 15-20 recent AI news articles
2. After finding articles, IMMEDIATELY transfer to NewsletterCuratorAgent with the articles

Search multiple times with queries like:
- "AI news today ${new Date().toISOString().split('T')[0]}"
- "latest AI developments"
- "AI product launches"
- "AI startup funding news"

After web search, transfer to curatorAgent with message like:
"Here are the articles I found: [list the articles]"`,
  tools: [webSearchTool()],
  get handoffs() {
    return curatorAgentHandoff ? [curatorAgentHandoff] : [];
  },
});

// Export function to set the handoff after curatorAgent is loaded
const setCuratorHandoff = (curatorAgent) => {
  curatorAgentHandoff = handoff(curatorAgent);
};

// Add event listeners for tracking
newsDiscoveryAgent.on('agent_start', () => {
  console.log('\n🔍 NEWS DISCOVERY AGENT INVOKED');
  console.log('=' .repeat(60));
  console.log('NewsDiscoveryAgent is now searching for AI news');
  console.log('=' .repeat(60));
});

newsDiscoveryAgent.on('agent_end', () => {
  console.log('\n✅ NEWS DISCOVERY AGENT COMPLETED');
  console.log('=' .repeat(60));
});

module.exports = { newsDiscoveryAgent, setCuratorHandoff };
