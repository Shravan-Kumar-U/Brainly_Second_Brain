import * as collectionService from '../services/collection.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const respond = (res, collection, status = 200) =>
  res.status(status).json({ success: true, data: { collection } });

export const listCollections = asyncHandler(async (req, res) => {
  const collections = await collectionService.listCollections(req.user._id);
  res.json({ success: true, data: { collections } });
});

export const createCollection = asyncHandler(async (req, res) => {
  respond(res, await collectionService.createCollection(req.user._id, req.body), 201);
});

export const updateCollection = asyncHandler(async (req, res) => {
  respond(res, await collectionService.updateCollection(req.user._id, req.params.id, req.body));
});

export const deleteCollection = asyncHandler(async (req, res) => {
  await collectionService.deleteCollection(req.user._id, req.params.id);
  res.json({ success: true, message: 'Collection deleted' });
});

export const enableShare = asyncHandler(async (req, res) => {
  respond(res, await collectionService.enableShare(req.user._id, req.params.id));
});

export const regenerateShare = asyncHandler(async (req, res) => {
  respond(res, await collectionService.regenerateShare(req.user._id, req.params.id));
});

export const disableShare = asyncHandler(async (req, res) => {
  respond(res, await collectionService.disableShare(req.user._id, req.params.id));
});

export const getShared = asyncHandler(async (req, res) => {
  const shared = await collectionService.getSharedView(req.params.token);

  // Never cached, so stopping a share takes effect immediately
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, data: shared });
});