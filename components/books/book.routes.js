const listHandler = app => (req, res, next) => {
  const BookService = app.services.BookService;

  BookService.list(req.query)
    .then(books => res.json(books))
    .catch(err => next(err));
};

module.exports = (app) => {
  const resourceName = 'books';
  const routes = [
    {
      method: 'get',
      path: `/${resourceName}`,
      handlers: [
        listHandler(app)
      ],
    }
  ];

  return routes;
};
