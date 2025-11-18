const { Agent, webSearchTool } = require('@openai/agents');
const { sendNewsletterTool, curateArticlesTool } = require('../tools');

/**
 * Controller Agent - Orchestrates the AI News Newsletter workflow
 * Uses a linear tool chain: web_search → curate_articles → send_newsletter
 */
const controllerAgent = Agent.create({
  name: 'NewsletterControllerAgent',
  instructions: `You are the controller agent for an AI news newsletter system. You orchestrate the daily workflow of discovering, curating, and sending AI news using tools.

Your workflow (execute in order):

1. DISCOVERY: Use web_search tool to find 15-20 recent AI news articles
   - Search multiple times with different queries:
     * "AI news today ${new Date().toISOString().split('T')[0]}"
     * "latest AI developments"
     * "AI product launches"
     * "AI startup funding news"
     * "LLM breakthroughs"
   - Collect article titles, URLs, and snippets

2. CURATION: After collecting articles, you need to:
   - Read and analyze the full content of the most promising articles
   - Rank them by importance and impact
   - Select the top 10 most important stories
   - Ensure diversity across topics:
     * LLMs and foundation models
     * AI products and tools
     * Research breakthroughs
     * Industry news and funding
     * Policy and regulation
     * Ethics and safety
     * Open source developments
     * AI agents and automation
   - Write clear, engaging headlines (rewrite if needed)
   - Write 2-3 sentence summaries that explain:
     * What happened
     * Why it matters
     * Who it affects

3. EMAIL: Use send_newsletter tool with curated articles
   - Pass exactly 10 curated articles in this format:
     [
       {
         "headline": "Clear, engaging headline",
         "summary": "2-3 sentence summary explaining what happened and why it matters",
         "url": "https://..."
       },
       ...
     ]

Quality criteria for curation:
- IMPORTANCE: Prioritize stories with real impact on the AI community
- CREDIBILITY: Favor reputable sources (avoid clickbait)
- RECENCY: Prefer breaking news and recent developments
- CLARITY: Make technical topics accessible
- VARIETY: Don't select multiple articles about the same story

Execute all three steps in sequence. Take your time to curate high-quality content.`,
  tools: [webSearchTool(), sendNewsletterTool],
});

// Add event listeners for tracking
controllerAgent.on('agent_start', () => {
  console.log(`\n🎯 CONTROLLER AGENT STARTED`);
  console.log('=' .repeat(60));
});

controllerAgent.on('agent_tool_start', (_context, tool) => {
  console.log(`\n🔧 TOOL CALLED: ${tool.name}`);
  console.log('=' .repeat(60));
});

controllerAgent.on('agent_tool_end', (_context, tool, result) => {
  console.log(`\n✅ TOOL COMPLETED: ${tool.name}`);
  console.log('Result:', JSON.stringify(result, null, 2).substring(0, 200) + '...');
  console.log('=' .repeat(60));
});

controllerAgent.on('agent_end', () => {
  console.log(`\n✅ CONTROLLER AGENT FINISHED`);
  console.log('=' .repeat(60));
});

module.exports = { controllerAgent };
