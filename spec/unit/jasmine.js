const Jasmine = require('jasmine');
const Reporter = require('jasmine-terminal-reporter');

const jasmine = new Jasmine();
const reporter = new Reporter({
  isVerbose: true,
});

process.env.NODE_ENV = 'test';

jasmine.addReporter(reporter);

jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.execute(['spec/unit/**/*.spec.js']);
