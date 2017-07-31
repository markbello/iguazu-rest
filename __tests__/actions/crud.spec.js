import {
  loadResource,
  loadCollection,
  createResource,
  updateResource,
  destroyResource,
} from '../../src/actions/crud';

jest.mock('../../src/selectors', () => ({
  resourceIsLoaded: jest.fn(),
  getResource: jest.fn(),
  resourceIsLoading: jest.fn(),
  getResourceLoadPromise: jest.fn(),
  collectionIsLoaded: jest.fn(),
  getCollection: jest.fn(),
  collectionIsLoading: jest.fn(),
  getCollectionLoadPromise: jest.fn(),
}));

const mockFetchPromise = Promise.resolve('res');
jest.mock('../../src/actions/executeFetch', () => jest.fn(() => mockFetchPromise));

const executeFetch = require('../../src/actions/executeFetch');

const dispatch = jest.fn();
const getState = () => 'state';
const resource = 'users';
const id = '123';
const opts = { some: 'opt' };

describe('CRUD actions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadResource', () => {
    it('should load a single resource if it is not loaded or loading', async () => {
      const thunk = loadResource({ resource, id, opts });
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => false); // eslint-disable-line global-require
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => false); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, id, opts, actionType: 'LOAD' });
    });

    it('should resolve with the cached resource if it is already loaded', async () => {
      const thunk = loadResource({ resource, id, opts });
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should reject if the resource is loaded, but it loaded unsuccessfully', async () => {
      const error = new Error('load error');
      try {
        const thunk = loadResource({ resource, id, opts });
        require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => true); // eslint-disable-line global-require
        require('../../src/selectors').getResource.mockImplementationOnce(() => error); // eslint-disable-line global-require
        await thunk(dispatch, getState);
      } catch (e) {
        expect(e).toBe(error);
        expect(dispatch).not.toHaveBeenCalled();
        expect(executeFetch).not.toHaveBeenCalled();
      }
    });

    it('should return with the loading promise if it is already in progress', async () => {
      const thunk = loadResource({ resource, id, opts });
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should refetch the resource if the resource is loaded, but forceFetch is specified', async () => {
      const thunk = loadResource({ resource, id, opts, forceFetch: true });
      require('../../src/selectors').resourceIsLoaded.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, id, opts, actionType: 'LOAD' });
    });

    it('should refetch the resource if a fetch is in progess, but forceFetch is specified', async () => {
      const thunk = loadResource({ resource, id, opts, forceFetch: true });
      require('../../src/selectors').resourceIsLoading.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, id, opts, actionType: 'LOAD' });
    });
  });

  describe('loadCollection', () => {
    it('should load the collection if it is not loaded or loading', async () => {
      const thunk = loadCollection({ resource, opts });
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => false); // eslint-disable-line global-require
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => false); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, opts, actionType: 'LOAD_COLLECTION' });
    });

    it('should not refetch the collection if it is already loaded', async () => {
      const thunk = loadCollection({ resource, opts });
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should reject if the collection is loaded, but it loaded unsuccessfully', async () => {
      const error = new Error('load error');
      try {
        const thunk = loadCollection({ resource, id, opts });
        require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => true); // eslint-disable-line global-require
        require('../../src/selectors').getCollection.mockImplementationOnce(() => error); // eslint-disable-line global-require
        await thunk(dispatch, getState);
      } catch (e) {
        expect(e).toBe(error);
        expect(dispatch).not.toHaveBeenCalled();
        expect(executeFetch).not.toHaveBeenCalled();
      }
    });

    it('should not refetch the resource if a fetch is already in progress', async () => {
      const thunk = loadCollection({ resource, opts });
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
      expect(executeFetch).not.toHaveBeenCalled();
    });

    it('should load the collection if the collection is loaded, but forceFetch is specified', async () => {
      const thunk = loadCollection({ resource, opts, forceFetch: true });
      require('../../src/selectors').collectionIsLoaded.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, opts, actionType: 'LOAD_COLLECTION' });
    });

    it('should refetch the collection if a fetch is in progess, but forceFetch is specified', async () => {
      const thunk = loadResource({ resource, id, opts, forceFetch: true });
      require('../../src/selectors').collectionIsLoading.mockImplementationOnce(() => true); // eslint-disable-line global-require
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, id, opts, actionType: 'LOAD' });
    });
  });

  describe('createResource', () => {
    it('should create a new resource', async () => {
      const thunk = createResource({ resource, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, opts, actionType: 'CREATE' });
    });
  });

  describe('update', () => {
    it('should update an existing resource', async () => {
      const thunk = updateResource({ resource, id, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, id, opts, actionType: 'UPDATE' });
    });
  });

  describe('destroy', () => {
    it('should destroy an existing resource', async () => {
      const thunk = destroyResource({ resource, id, opts });
      await thunk(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith(mockFetchPromise);
      expect(executeFetch).toHaveBeenCalledWith({ resource, id, opts, actionType: 'DESTROY' });
    });
  });
});
