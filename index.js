const mongoose = require('mongoose');
const Agenda = require('agenda');
const app = require('./app');

const SYNCHRONIZATION_JOB_NAME = 'SYNCHRONIZATION_JOB';
const port = process.env.PORT || '3000';
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bibliotech';

mongoose.connect(mongoURI, { useNewUrlParser: true });

const agenda = new Agenda({ db: { address: mongoURI } });

agenda.on('ready', () => {
  const CatalogService = app.services.CatalogService;

  // Defining job for synchronization.
  agenda.define(SYNCHRONIZATION_JOB_NAME, { concurrency: 1 }, (job, done) => {
    CatalogService.setUnsynchronizedStatus()
      .then(() => CatalogService.synchronize())
      .then(() => done());
  });

  // Scheduling synchronization.
  agenda.every('24 hours', SYNCHRONIZATION_JOB_NAME);
  agenda.start();
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log('Open http://localhost:3000 to see a response.'));
