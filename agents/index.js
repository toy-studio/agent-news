/**
 * Agents index - exports all agents for easy importing
 */
const { controllerAgent } = require('./controllerAgent');
const { newsDiscoveryAgent } = require('./newsDiscoveryAgent');
const { curatorAgent } = require('./curatorAgent');
const { emailAgent } = require('./emailAgent');

module.exports = {
  controllerAgent,
  newsDiscoveryAgent,
  curatorAgent,
  emailAgent,
  // Add more specialized agents here as they're created
};
