const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const extract = require('extract-zip');
const tar = require('tar');
const dir = require('node-dir');
const rimraf = require('rimraf');
const CatalogModel = require('./catalog.model');
const RDFModel = require('./rdf.model');
const BookModel = require('./book.model');

const CATALOG_URL = 'https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip';
const TEMP_DIRECTORY = 'temp';
const CACHE_PATH = 'cache/epub';
const CATALOG_ZIP_FILE = 'rdf-files.tar.zip';
const CATALOG_TAR_FILE = 'rdf-files.tar';

module.exports = (/* app */) => {
  /* eslint no-use-before-define: "off", no-console: "off" */

  class CatalogService {
    static get() {
      return CatalogModel.findOne()
        .then((status) => {
          if (status) { return status; }

          return CatalogModel.create({});
        });
    }

    static isSynchronized() {
      return CatalogService.get()
        .then(({ status }) => status === CatalogModel.SYNCHRONIZED_STATUS);
    }

    static setStatus(status) {
      if (!CatalogModel.STATUSES.includes(status)) { return Promise.resolve(false); }

      return CatalogService.get()
        .then((catalog) => {
          /* eslint no-param-reassign: "off" */
          catalog.status = status;

          return catalog.save();
        })
        .then(() => true);
    }

    static setUnsynchronizedStatus() {
      return CatalogService.setStatus(CatalogModel.UNSYNCHRONIZED_STATUS);
    }

    static setSynchronizingStatus() {
      return CatalogService.setStatus(CatalogModel.SYNCHRONIZING_STATUS);
    }

    static setSynchronizedStatus() {
      return CatalogService.setStatus(CatalogModel.SYNCHRONIZED_STATUS);
    }

    static synchronize() {
      return CatalogService.isSynchronized()
        .then((synchronized) => {
          if (synchronized) { return undefined; }

          return performSynchronization();
        });
    }

    static fetchCatalog() {
      console.log('Fetching catalog \t\t (1 of 5)');

      return new Promise(resolve => fs.mkdir(TEMP_DIRECTORY, { recursive: true }, resolve))
        .then(() => fetch(CATALOG_URL))
        .then((response) => {
          console.log('Downloading catalog \t\t (2 of 5)');

          return response.body.pipe(fs.createWriteStream(`${TEMP_DIRECTORY}/${CATALOG_ZIP_FILE}`));
        })
        .then((stream) => {
          console.log('Downloading catalog \t\t (3 of 5)');

          return new Promise(resolve => stream.on('finish', () => resolve()));
        })
        .then(() => {
          console.log('Extracting catalog \t\t (4 of 5)');

          return new Promise(resolve => extract(
            `${TEMP_DIRECTORY}/${CATALOG_ZIP_FILE}`,
            { dir: path.resolve(TEMP_DIRECTORY) }, resolve
          ));
        })
        .then(() => {
          console.log('Extracting catalog \t\t (5 of 5)');

          return tar.extract({ cwd: TEMP_DIRECTORY, file: `${TEMP_DIRECTORY}/${CATALOG_TAR_FILE}` });
        });
    }

    static deleteCatalog() {
      return new Promise((resolve, reject) => {
        rimraf(TEMP_DIRECTORY, (err) => {
          if (err) { return reject(err); }

          return resolve();
        });
      });
    }

    static importCatalog() {
      let synchronized = true;

      console.log('Importing catalog \t\t');

      const fileErrorHandler = (err, next) => {
        console.error(err);
        synchronized = false;
        return next();
      };
      const finishedErrorHandler = (resolve) => {
        console.log('Catalog partially imported');

        return resolve(false);
      };
      const finishedHandler = (resolve) => {
        console.log('Catalog imported successfully');

        return resolve(synchronized);
      };

      return new Promise(resolve => dir.readFiles(
        `${TEMP_DIRECTORY}/${CACHE_PATH}`,
        (err, content, next) => {
          if (err) { return fileErrorHandler(err, next); }

          return CatalogService.importBook(content)
            .then(() => next())
            .catch(error => fileErrorHandler(error, next));
        },
        (err) => {
          if (err) { return finishedErrorHandler(resolve); }

          return finishedHandler(resolve);
        }
      ));
    }

    static importBook(rdf) {
      return RDFModel.parse(rdf)
        .then((rdfModel) => {
          const book = rdfModel.toBook();

          return BookModel.findOneAndUpdate({ _id: book._id }, book, { new: true, upsert: true })
            .then(() => console.log(`\t Book(${book._id}) - "${book.title}" imported.`));
        });
    }
  }

  function performSynchronization() {
    return CatalogService.setSynchronizingStatus()
      .then(() => CatalogService.fetchCatalog())
      .then(() => CatalogService.importCatalog())
      .then((synchronized) => {
        if (!synchronized) { throw new Error('Unsynchronized'); }

        return CatalogService.setSynchronizedStatus()
          .then(() => CatalogService.deleteCatalog());
      })
      .catch(() => CatalogService.setUnsynchronizedStatus().then(() => CatalogService.deleteCatalog()));
  }

  return CatalogService;
};
