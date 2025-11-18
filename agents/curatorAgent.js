const { Agent, handoff } = require('@openai/agents');
const { z } = require('zod');

// Forward declaration - will be set after emailAgent is imported
let emailAgentHandoff;

/**
 * Newsletter Curator Agent
 * Reads full article content from URLs and curates the best stories
 * Ensures diversity, importance, and engaging presentation
 */
const curatorAgent = Agent.create({
  name: 'NewsletterCuratorAgent',
  instructions: `You are an expert newsletter curator specializing in AI news. After curating, you MUST hand off to EmailSenderAgent.

Process:
1. You will receive a list of article URLs from the discovery agent
2. READ the full content of each article URL (you can fetch and read web pages directly)
3. ANALYZE each article's importance, credibility, and relevance based on the full content
4. RANK articles by impact and significance
5. SELECT the top 10 most important stories
6. ENSURE DIVERSITY across topics:
   - LLMs and foundation models
   - AI products and tools
   - Research breakthroughs
   - Industry news and funding
   - Policy and regulation
   - Ethics and safety
   - Open source developments
   - AI agents and automation

7. CREATE engaging newsletter content:
   - Write clear, compelling headlines (can rewrite for clarity)
   - Write 2-3 sentence summaries that explain:
     * What happened
     * Why it matters
     * Who it affects
   - Maintain a professional but approachable tone

Quality criteria:
- IMPORTANCE: Prioritize stories with real impact on the AI community
- CREDIBILITY: Favor reputable sources (avoid clickbait or unreliable sites)
- RECENCY: Prefer breaking news and recent developments
- CLARITY: Make technical topics accessible to broad audience
- VARIETY: Don't select multiple articles about the same story
- DEPTH: Use full article content to write insightful summaries

Take your time to read each article thoroughly before making your selections. Prioritize quality over speed.

After curating, output them in this JSON format:
{
  "curatedArticles": [
    {
      "headline": "Clear, engaging headline",
      "summary": "2-3 sentence summary",
      "url": "https://..."
    },
    ...
  ]
}

Include exactly 10 curated articles.

After curating, IMMEDIATELY transfer to EmailSenderAgent with the curated articles.`,
  get handoffs() {
    return emailAgentHandoff ? [emailAgentHandoff] : [];
  },
});

// Export function to set the handoff after emailAgent is loaded
const setEmailHandoff = (emailAgent) => {
  emailAgentHandoff = handoff(emailAgent);
};

// Add event listeners for tracking
curatorAgent.on('agent_start', () => {
  console.log('\n📝 CURATOR AGENT INVOKED');
  console.log('=' .repeat(60));
  console.log('NewsletterCuratorAgent is now curating articles');
  console.log('=' .repeat(60));
});

curatorAgent.on('agent_end', () => {
  console.log('\n✅ CURATOR AGENT COMPLETED');
  console.log('=' .repeat(60));
});

module.exports = { curatorAgent, setEmailHandoff };
