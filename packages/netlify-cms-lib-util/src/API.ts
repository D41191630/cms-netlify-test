export const CMS_BRANCH_PREFIX = 'cms';
export const DEFAULT_PR_BODY = 'Automatically generated by Netlify CMS';
export const MERGE_COMMIT_MESSAGE = 'Automatically generated. Merged on Netlify CMS.';

export const COMBINE_COLLECTIONS = 'collections';
export const COMBINE_SLUG = 'combine';
export const COMBINE_PR_TITLE = 'Create combine entries';

const NETLIFY_CMS_LABEL_PREFIX = 'netlify-cms/';
export const isCMSLabel = (label: string) => label.startsWith(NETLIFY_CMS_LABEL_PREFIX);
export const labelToStatus = (label: string) => label.substr(NETLIFY_CMS_LABEL_PREFIX.length);
export const statusToLabel = (status: string) => `${NETLIFY_CMS_LABEL_PREFIX}${status}`;

export const generateContentKey = (collectionName: string, slug: string) =>
  `${collectionName}/${slug}`;

export const parseContentKey = (contentKey: string) => {
  const index = contentKey.indexOf('/');
  return { collection: contentKey.substr(0, index), slug: contentKey.substr(index + 1) };
};

export const contentKeyFromBranch = (branch: string) => {
  return branch.substring(`${CMS_BRANCH_PREFIX}/`.length);
};

export const branchFromContentKey = (contentKey: string) => {
  return `${CMS_BRANCH_PREFIX}/${contentKey}`;
};

export const isCombineKey = (collectionName: string, slug: string) => {
  return collectionName === COMBINE_COLLECTIONS && slug.startsWith(`${COMBINE_SLUG}-`);
};

export const isBinaryFile = file =>
  file.binary || (file.diff && file.diff.startsWith('Binary files'));

export interface FetchError extends Error {
  status: number;
}

export const readFile = async (
  id: string | null | undefined,
  fetchContent: () => Promise<string | Blob>,
  localForage: LocalForage,
  isText: boolean,
) => {
  const key = id ? (isText ? `gh.${id}` : `gh.${id}.blob`) : null;
  const cached = key ? await localForage.getItem<string | Blob>(key) : null;
  if (cached) {
    return cached;
  }

  const content = await fetchContent();
  if (key) {
    localForage.setItem(key, content);
  }
  return content;
};

/**
 * Keywords for inferring a status that will provide a deploy preview URL.
 */
const PREVIEW_CONTEXT_KEYWORDS = ['deploy'];

/**
 * Check a given status context string to determine if it provides a link to a
 * deploy preview. Checks for an exact match against `previewContext` if given,
 * otherwise checks for inclusion of a value from `PREVIEW_CONTEXT_KEYWORDS`.
 */
export const isPreviewContext = (context: string, previewContext: string) => {
  if (previewContext) {
    return context === previewContext;
  }
  return PREVIEW_CONTEXT_KEYWORDS.some(keyword => context.includes(keyword));
};

export enum PreviewState {
  Other = 'other',
  Success = 'success',
}

/**
 * Retrieve a deploy preview URL from an array of statuses. By default, a
 * matching status is inferred via `isPreviewContext`.
 */
export const getPreviewStatus = (
  statuses: {
    context: string;
    target_url: string;
    state: PreviewState;
  }[],
  previewContext: string,
) => {
  return statuses.find(({ context }) => {
    return isPreviewContext(context, previewContext);
  });
};
