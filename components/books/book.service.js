const BookModel = require('./book.model');

module.exports = (/* app */) => {
  class BookService {
    static list(options = {}) {
      /* eslint no-param-reassign: "off" */
      const limit = parseInt(options.limit, 10);

      options.limit = Number.isNaN(limit) || limit > 25 ? 25 : limit;

      return BookModel.find({}, null, options);
    }
  }

  return BookService;
};
