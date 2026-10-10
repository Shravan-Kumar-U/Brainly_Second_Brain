import * as itemService from '../services/item.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createItem = asyncHandler(async (req, res) => {
  const item = await itemService.createItem(req.user._id, req.body);
  res.status(201).json({ success: true, data: { item } });
});

export const listItems = asyncHandler(async (req, res) => {
  const { items, meta } = await itemService.listItems(req.user._id, req.validated.query);
  res.json({ success: true, data: { items }, meta });
});

export const getItem = asyncHandler(async (req, res) => {
  const item = await itemService.getItem(req.user._id, req.params.id);
  res.json({ success: true, data: { item } });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await itemService.updateItem(req.user._id, req.params.id, req.body);
  res.json({ success: true, data: { item } });
});

export const completeItem = asyncHandler(async (req, res) => {
  const item = await itemService.completeItem(req.user._id, req.params.id);
  res.json({ success: true, data: { item } });
});

export const snoozeItem = asyncHandler(async (req, res) => {
  const item = await itemService.snoozeItem(req.user._id, req.params.id, req.body.minutes);
  res.json({ success: true, data: { item } });
});

export const archiveItem = asyncHandler(async (req, res) => {
  const item = await itemService.archiveItem(req.user._id, req.params.id);
  res.json({ success: true, data: { item } });
});

export const restoreItem = asyncHandler(async (req, res) => {
  const item = await itemService.restoreItem(req.user._id, req.params.id);
  res.json({ success: true, data: { item } });
});

export const deleteItem = asyncHandler(async (req, res) => {
  await itemService.deleteItem(req.user._id, req.params.id);
  res.json({ success: true, message: 'Item deleted' });
});

export const listTags = asyncHandler(async (req, res) => {
  const tags = await itemService.getTagCounts(req.user._id);
  res.json({ success: true, data: { tags } });
});

export const previewLink = asyncHandler(async (req, res) => {
  const preview = await itemService.previewLink(req.body.url);
  res.json({ success: true, data: { preview } });
});

export const refreshMetadata = asyncHandler(async (req, res) => {
  const item = await itemService.refreshMetadata(req.user._id, req.params.id);
  res.json({ success: true, data: { item } });
});