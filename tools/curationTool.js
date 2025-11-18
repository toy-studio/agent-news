const { tool } = require('@openai/agents');
const { z } = require('zod');

/**
 * Article Curation Tool
 * Curates articles by ranking them and selecting the top 10 most important stories
 */
const curateArticlesTool = tool({
  name: 'curate_articles',
  description: 'Curate and rank articles to select the top 10 most important AI news stories. Returns formatted articles ready for newsletter.',
  parameters: z.object({
    articles: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
    })).describe('Array of discovered articles to curate'),
  }),
  execute: async (input) => {
    try {
      console.log('\n' + '='.repeat(60));
      console.log('📝 CURATION TOOL - STARTING');
      console.log('='.repeat(60));
      console.log(`Articles received: ${input.articles.length}`);

      // In a real implementation, you would:
      // 1. Fetch full content of each article
      // 2. Analyze importance, credibility, recency
      // 3. Rank by impact
      // 4. Ensure diversity across topics
      // 5. Write engaging summaries

      // For now, we'll return a structured format that signals the agent
      // needs to do the curation work itself

      console.log('📊 Articles to curate:');
      input.articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title}`);
        console.log(`     URL: ${article.url}`);
      });
      console.log('='.repeat(60) + '\n');

      return {
        success: true,
        articlesForCuration: input.articles,
        message: 'Articles ready for curation. Please analyze each article and return top 10 in this format: {"curatedArticles": [{"headline": "...", "summary": "...", "url": "..."}]}'
      };
    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ CURATION TOOL - ERROR');
      console.error('='.repeat(60));
      console.error('Error message:', error.message);
      console.error('='.repeat(60) + '\n');

      return {
        success: false,
        error: error.message,
      };
    }
  },
});

module.exports = { curateArticlesTool };
