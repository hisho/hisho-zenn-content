const BROWSER_SYNC = {
  files: [
    `articles/**/*.md`,
    `books/**/*.md`,
  ],
  proxy: 'http://localhost:65535',
  logFileChanges: false //URLをログをで流さない
};

module.exports = BROWSER_SYNC;
