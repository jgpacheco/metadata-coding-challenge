# metadata-coding-challenge
Coding challenge for book processing related roles. Please complete the challenge and send it back within 24 hours, either a zip of the source code or a link to the git repository.

# Tech stack

To complete the challenge, installation of node.js (https://nodejs.org/en/) and npm (https://nodejs.org/en/) will be required. Min version of Node 8 is recommended.

## Running this application
Make sure [MongoDB][mongodb] is running locally on the default port (27017).
You can change connection URI in `index.js`.

Open a terminal/console/command prompt,
change to the directory where you cloned this repo and type:
`npm install` followed by `npm run start` 

You can run unit tests by typing:
`npm run unit` 

# Coding challenge

The challenge is to build a metadata extractor for all the project Gutenberg titles which are available here: https://www.gutenberg.org/wiki/Gutenberg:Feeds (https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.zip).

Each book has an RDF file which will need to be processed to extract the:

* id (will be a number with 0-5 digits)
* title
* author/s
* publisher (value will always be Gutenberg)
* publication date
* language
* subject/s
* license rights

Note: For some books all of the data won't be available.

# Tasks

* Write a function that reads a single file in and outputs the correct output. The libraries that might be useful: https://www.npmjs.com/package/xml2js, https://www.npmjs.com/package/xmldom

* Store the output in a database of your choice locally for later querying. Use ORM of your choice (like `Sequlize`, `Mongoose`), to define database models as well.

* Write unit tests (use test suite libraries like `mocha` or `jest`) for the code and use code coverage analysis tool (built-in `jest` one, or libraries like `Istanbul`).

* Process all metadata for the titles for later querying

[mongodb]: https://docs.mongodb.com/manual/installation/
