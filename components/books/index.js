module.exports = (app) => {
  /* eslint global-require: "off", no-param-reassign: "off" */
  const routes = require('./book.routes')(app);
  const BookService = require('./book.service')(app);
  const CatalogService = require('./catalog.service')(app);

  routes.forEach(({ method, path, handlers }) => {
    app[method](path, ...handlers);
  });

  app.services = app.services || {};
  app.services[BookService.name] = BookService;
  app.services[CatalogService.name] = CatalogService;

  return {};
};
