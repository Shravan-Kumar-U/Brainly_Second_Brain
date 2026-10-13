import * as exportService from '../services/export.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// The one endpoint that returns the bare object (no { success, data } wrapper),
// so the response body is exactly the backup file.
export const exportData = asyncHandler(async (req, res) => {
  const backup = await exportService.buildBackup(req.user);
  const date = new Date().toISOString().slice(0, 10);

  res.set({
    'Content-Disposition': `attachment; filename="brainly-backup-${date}.json"`,
    'Cache-Control': 'no-store',
  });
  res.json(backup);
});