require('rootpath')();
const proxyquire = require('proxyquire');

describe('CatalogService', () => {
  beforeAll(() => {
    this.RDFModelStub = {};
    this.BookModelStub = {};
    this.CatalogModelStub = {
      SYNCHRONIZED_STATUS: 'synchronized',
      UNSYNCHRONIZED_STATUS: 'unsynchronized',
      SYNCHRONIZING_STATUS: 'synchronizing',
      STATUSES: ['synchronized', 'unsynchronized', 'synchronizing'],
    };

    this.rimafError = null;
    this.rimafPath = '';
    this.rimraf = jasmine.createSpy('rimraf').and.callFake((path, callback) => {
      this.rimafPath = path;
      callback(this.rimafError);
    });

    this.CatalogService = proxyquire('components/books/catalog.service', {
      './book.model': this.BookModelStub,
      './rdf.model': this.RDFModelStub,
      './catalog.model': this.CatalogModelStub,
      rimraf: this.rimraf,
    })({});
  });

  describe('#get', () => {
    describe('when a catalog does not exist', () => {
      beforeAll((done) => {
        this.catalog = { _id: 1 };
        this.CatalogModelStub.findOne = jasmine.createSpy('CatalogModel.find')
          .and.returnValue(Promise.resolve(null));
        this.CatalogModelStub.create = jasmine.createSpy('CatalogModel.create')
          .and.returnValue(Promise.resolve(this.catalog));
        this.result = this.CatalogService.get();

        this.result.then(() => done());
      });

      it('should create a catalog', () => {
        expect(this.CatalogModelStub.create).toHaveBeenCalledWith({});
      });

      it('should return a promise resolved to created catalog', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toEqual(this.catalog);
          done();
        });
      });
    });

    describe('when a catalog does exist', () => {
      beforeAll((done) => {
        this.catalog = { _id: 1 };
        this.CatalogModelStub.findOne = jasmine.createSpy('CatalogModel.find')
          .and.returnValue(Promise.resolve(this.catalog));
        this.CatalogModelStub.create = jasmine.createSpy('CatalogModel.create');
        this.result = this.CatalogService.get();

        this.result.then(() => done());
      });

      it('should not create a catalog', () => {
        expect(this.CatalogModelStub.create).toHaveBeenCalledTimes(0);
      });

      it('should return a promise resolved to existing catalog', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toEqual(this.catalog);
          done();
        });
      });
    });
  });

  describe('#isSynchronized', () => {
    beforeAll(() => {
      this.CatalogServiceGet = this.CatalogService.get;
    });

    describe('when catalog is synchronized', () => {
      beforeAll((done) => {
        this.CatalogService.get = jasmine.createSpy('CatalogService.get')
          .and.returnValue(Promise.resolve({ status: this.CatalogModelStub.SYNCHRONIZED_STATUS }));
        this.result = this.CatalogService.isSynchronized();

        this.result.then(() => done());
      });

      it('should return a promise resolved to true', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toBeTruthy();
          done();
        });
      });
    });

    describe('when catalog is not synchronized', () => {
      beforeAll((done) => {
        this.CatalogService.get = jasmine.createSpy('CatalogService.get')
          .and.returnValue(Promise.resolve({ status: this.CatalogModelStub.UNSYNCHRONIZED_STATUS }));
        this.result = this.CatalogService.isSynchronized();

        this.result.then(() => done());
      });

      it('should return a promise resolved to false', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toBeFalsy();
          done();
        });
      });
    });

    afterAll(() => {
      this.CatalogService.get = this.CatalogServiceGet;
    });
  });

  describe('#setStatus', () => {
    beforeAll(() => {
      this.CatalogServiceGet = this.CatalogService.get;
    });

    describe('when the new status is no allowed', () => {
      beforeAll(() => {
        this.result = this.CatalogService.setStatus('idle');
      });

      it('should return a promise resolved to false', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toBeFalsy();
          done();
        });
      });
    });

    describe('when the new status is allowed', () => {
      beforeAll((done) => {
        this.catalog = {
          save: jasmine.createSpy('save').and.returnValue(Promise.resolve()),
        };
        this.CatalogService.get = jasmine.createSpy('CatalogService.get')
          .and.returnValue(Promise.resolve(this.catalog));
        this.result = this.CatalogService.setStatus(this.CatalogModelStub.SYNCHRONIZED_STATUS);

        this.result.then(() => done());
      });

      it('should save updated catalog', () => {
        expect(this.catalog.status).toEqual(this.CatalogModelStub.SYNCHRONIZED_STATUS);
        expect(this.catalog.save).toHaveBeenCalled();
      });

      it('should return a promise resolved to true', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toBeTruthy();
          done();
        });
      });
    });

    afterAll(() => {
      this.CatalogService.get = this.CatalogServiceGet;
    });
  });

  describe('#setUnsynchronizedStatus', () => {
    beforeAll((done) => {
      this.CatalogServiceSetStatus = this.CatalogService.setStatus;
      this.CatalogService.setStatus = jasmine.createSpy('CatalogService.setStatus')
        .and.returnValue(Promise.resolve(true));
      this.result = this.CatalogService.setUnsynchronizedStatus();

      this.result.then(() => done());
    });

    it('should set catalog status to unsynchronized', () => {
      expect(this.CatalogService.setStatus).toHaveBeenCalledWith(this.CatalogModelStub.UNSYNCHRONIZED_STATUS);
    });

    it('should return a promise resolved to true', (done) => {
      expect(this.result).toEqual(jasmine.any(Promise));
      this.result.then((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });

    afterAll(() => {
      this.CatalogService.setStatus = this.CatalogServiceSetStatus;
    });
  });

  describe('#setSynchronizingStatus', () => {
    beforeAll((done) => {
      this.CatalogServiceSetStatus = this.CatalogService.setStatus;
      this.CatalogService.setStatus = jasmine.createSpy('CatalogService.setStatus')
        .and.returnValue(Promise.resolve(true));
      this.result = this.CatalogService.setSynchronizingStatus();

      this.result.then(() => done());
    });

    it('should set catalog status to synchronizing', () => {
      expect(this.CatalogService.setStatus).toHaveBeenCalledWith(this.CatalogModelStub.SYNCHRONIZING_STATUS);
    });

    it('should return a promise resolved to true', (done) => {
      expect(this.result).toEqual(jasmine.any(Promise));
      this.result.then((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });

    afterAll(() => {
      this.CatalogService.setStatus = this.CatalogServiceSetStatus;
    });
  });

  describe('#setSynchronizedStatus', () => {
    beforeAll((done) => {
      this.CatalogServiceSetStatus = this.CatalogService.setStatus;
      this.CatalogService.setStatus = jasmine.createSpy('CatalogService.setStatus')
        .and.returnValue(Promise.resolve(true));
      this.result = this.CatalogService.setSynchronizedStatus();

      this.result.then(() => done());
    });

    it('should set catalog status to synchronized', () => {
      expect(this.CatalogService.setStatus).toHaveBeenCalledWith(this.CatalogModelStub.SYNCHRONIZED_STATUS);
    });

    it('should return a promise resolved to true', (done) => {
      expect(this.result).toEqual(jasmine.any(Promise));
      this.result.then((result) => {
        expect(result).toBeTruthy();
        done();
      });
    });

    afterAll(() => {
      this.CatalogService.setStatus = this.CatalogServiceSetStatus;
    });
  });

  describe('#synchronize', () => {
    beforeAll(() => {
      this.CatalogServiceIsSynchronized = this.CatalogService.isSynchronized;
      this.CatalogServiceSetSynchronizingStatus = this.CatalogService.setSynchronizingStatus;
      this.CatalogServiceFetchCatalog = this.CatalogService.fetchCatalog;
      this.CatalogServiceImportCatalog = this.CatalogService.importCatalog;
      this.CatalogServiceSetSynchronizedStatus = this.CatalogService.setSynchronizedStatus;
      this.CatalogServiceDeleteCatalog = this.CatalogService.deleteCatalog;
      this.CatalogServiceSetUnsynchronizedStatus = this.CatalogService.setUnsynchronizedStatus;
    });

    describe('when catalog is synchronized', () => {
      beforeAll((done) => {
        this.CatalogService.isSynchronized = jasmine.createSpy('CatalogService.isSynchronized')
          .and.returnValue(Promise.resolve(true));
        this.result = this.CatalogService.synchronize();

        this.result.then(() => done());
      });

      it('should return a promise resolved to undefined', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toBeUndefined();
          done();
        });
      });
    });

    describe('when catalog is unsynchronized', () => {
      beforeAll(() => {
        this.CatalogService.isSynchronized = jasmine.createSpy('CatalogService.isSynchronized')
          .and.returnValue(Promise.resolve(false));
      });

      describe('when synchronization succeed', () => {
        beforeAll((done) => {
          this.CatalogService.setSynchronizingStatus = jasmine.createSpy('CatalogService.setSynchronizingStatus')
            .and.returnValue(Promise.resolve(true));
          this.CatalogService.fetchCatalog = jasmine.createSpy('CatalogService.fetchCatalog')
            .and.returnValue(Promise.resolve());
          this.CatalogService.importCatalog = jasmine.createSpy('CatalogService.importCatalog')
            .and.returnValue(Promise.resolve(true));
          this.CatalogService.setSynchronizedStatus = jasmine.createSpy('CatalogService.setSynchronizedStatus')
            .and.returnValue(Promise.resolve(true));
          this.CatalogService.deleteCatalog = jasmine.createSpy('CatalogService.deleteCatalog')
            .and.returnValue(Promise.resolve());

          this.result = this.CatalogService.synchronize();

          this.result.then(() => done());
        });

        it('should set catalog status to synchronizing', () => {
          expect(this.CatalogService.setSynchronizingStatus).toHaveBeenCalled();
        });

        it('should fetch catalog', () => {
          expect(this.CatalogService.fetchCatalog).toHaveBeenCalled();
        });

        it('should import catalog', () => {
          expect(this.CatalogService.importCatalog).toHaveBeenCalled();
        });

        it('should set catalog status to synchronized', () => {
          expect(this.CatalogService.setSynchronizedStatus).toHaveBeenCalled();
        });

        it('should delete catalog', () => {
          expect(this.CatalogService.deleteCatalog).toHaveBeenCalled();
        });
      });

      describe('when synchronization failed', () => {
        beforeAll((done) => {
          this.CatalogService.setSynchronizingStatus = jasmine.createSpy('CatalogService.setSynchronizingStatus')
            .and.returnValue(Promise.reject());
          this.CatalogService.setUnsynchronizedStatus = jasmine.createSpy('CatalogService.setUnsynchronizedStatus')
            .and.returnValue(Promise.resolve(true));
          this.CatalogService.deleteCatalog = jasmine.createSpy('CatalogService.deleteCatalog')
            .and.returnValue(Promise.resolve());

          this.result = this.CatalogService.synchronize();

          this.result.then(() => done());
        });

        it('should set catalog status to unsynchronized', () => {
          expect(this.CatalogService.setUnsynchronizedStatus).toHaveBeenCalled();
        });

        it('should delete catalog', () => {
          expect(this.CatalogService.deleteCatalog).toHaveBeenCalled();
        });
      });
    });

    afterAll(() => {
      this.CatalogService.isSynchronized = this.CatalogServiceIsSynchronized;
      this.CatalogService.setSynchronizingStatus = this.CatalogServiceSetSynchronizingStatus;
      this.CatalogService.fetchCatalog = this.CatalogServiceFetchCatalog;
      this.CatalogService.importCatalog = this.CatalogServiceImportCatalog;
      this.CatalogService.setSynchronizedStatus = this.CatalogServiceSetSynchronizedStatus;
      this.CatalogService.deleteCatalog = this.CatalogServiceDeleteCatalog;
      this.CatalogService.setUnsynchronizedStatus = this.CatalogServiceSetUnsynchronizedStatus;
    });
  });

  describe('#fetchCatalog', () => {
    // TODO:
  });

  describe('#deleteCatalog', () => {
    describe('when an error occurs', () => {
      beforeAll((done) => {
        this.rimafError = new Error();
        this.result = this.CatalogService.deleteCatalog();

        this.result.catch(() => done());
      });

      it('should have been called with temp directory path', () => {
        expect(this.rimafPath).toBe('temp');
      });

      it('should return a rejected promise', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.catch((error) => {
          expect(error).toEqual(jasmine.any(Error));
          done();
        });
      });
    });

    describe('when no error occurs', () => {
      beforeAll((done) => {
        this.rimafError = null;
        this.result = this.CatalogService.deleteCatalog();

        this.result.then(() => done());
      });

      it('should have been called with temp directory path', () => {
        expect(this.rimafPath).toBe('temp');
      });

      it('should return a promise', (done) => {
        expect(this.result).toEqual(jasmine.any(Promise));
        this.result.then((result) => {
          expect(result).toBeUndefined();
          done();
        });
      });
    });

    afterAll(() => {
      this.rimafPath = '';
      this.rimafError = null;
    });
  });

  describe('#importCatalog', () => {
    // TODO:
  });

  describe('#importBook', () => {
    // TODO:
  });
});
