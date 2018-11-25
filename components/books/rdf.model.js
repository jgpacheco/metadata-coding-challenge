const xml2js = require('xml2js');
const { get, flatten } = require('lodash');

class RDFModel {
  static parse(rdf) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(rdf, (err, result) => {
        if (err) { return reject(err); }

        return resolve(new RDFModel(result));
      });
    });
  }

  constructor(metaData) {
    // console.log(JSON.stringify(metaData));
    this.metaData = get(metaData, ['rdf:RDF', 'pgterms:ebook', '0'], {});
  }

  getId() {
    const id = get(this.metaData, ['$', 'rdf:about'], '');

    return id.split('/')[1];
  }

  getTitle() {
    return get(this.metaData, ['dcterms:title', '0'], '');
  }

  getAuthors() {
    const authors = get(this.metaData, ['dcterms:creator'], [])
      .map(author => get(author, ['pgterms:agent', '0', 'pgterms:name', '0'], 'Unknown'));

    return flatten(authors);
  }

  getPublisher() {
    return get(this.metaData, ['dcterms:publisher', '0'], '');
  }

  getPublicationDate() {
    return get(this.metaData, ['dcterms:issued', '0', '_']);
  }

  getLanguage() {
    return get(this.metaData, ['dcterms:language', '0', 'rdf:Description', '0', 'rdf:value', '0', '_'], '');
  }

  getSubjects() {
    const subjects = get(this.metaData, ['dcterms:subject'], [])
      .map(subject => get(subject, ['rdf:Description', '0', 'rdf:value'], []));

    return flatten(subjects);
  }

  getLicenseRights() {
    return get(this.metaData, ['dcterms:rights'], []);
  }

  toBook() {
    return {
      _id: this.getId(),
      title: this.getTitle(),
      authors: this.getAuthors(),
      publisher: this.getPublisher(),
      publication_date: this.getPublicationDate(),
      language: this.getLanguage(),
      subjects: this.getSubjects(),
      license_rights: this.getLicenseRights(),
    };
  }
}

module.exports = RDFModel;
