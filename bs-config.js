const BROWSER_SYNC = {
  files: [
    `articles/**/*.md`,
    `books/**/*.md`,
  ],
  proxy: 'http://localhost:65535',
};

module.exports = BROWSER_SYNC;
