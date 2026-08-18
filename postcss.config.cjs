module.exports = {
  plugins: {
    'postcss-prefix-selector': {
      prefix: '.agentduel-deathmode',
      transform(prefix, selector, prefixedSelector) {
        return selector.includes(prefix) ? selector : prefixedSelector;
      }
    }
  }
};
