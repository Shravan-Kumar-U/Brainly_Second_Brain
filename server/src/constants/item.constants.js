export const PLATFORMS = [
  'youtube',
  'instagram',
  'facebook',
  'twitter',
  'github',
  'linkedin',
  'reddit',
  'tiktok',
  'medium',
  'other',
];

export const CONTENT_TYPES = ['video', 'image', 'post', 'article', 'repo', 'other'];

export const ITEM_STATUS = Object.freeze({
  INBOX: 'inbox',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
});

export const METADATA_STATUS = Object.freeze({
  PENDING: 'pending',
  DONE: 'done',
  FAILED: 'failed',
});


export const METADATA_STATUSES = Object.values(METADATA_STATUS);

export const ITEM_STATUSES = Object.values(ITEM_STATUS);

// After this many snoozes we ask the user: "Still want this?"
export const SNOOZE_REVIEW_THRESHOLD = 3;