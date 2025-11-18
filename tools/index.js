/**
 * Tools index - exports all tools for easy importing
 */
const { sendNewsletterTool } = require('./plunkTool');
const { curateArticlesTool } = require('./curationTool');

module.exports = {
  sendNewsletterTool,
  curateArticlesTool,
};
