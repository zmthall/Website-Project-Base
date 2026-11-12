import { site } from '../../../shared/data/site';
import { blogStore } from '../../utils/blog-store';
import { paginateRecords } from '../../utils/management-api';
export default defineEventHandler(async (event) => {
  if (!site.features.blog) throw createError({ statusCode: 404 });
  const posts = (await blogStore().list(true)).sort((a, b) =>
    String(b.fields.publishedAt).localeCompare(String(a.fields.publishedAt)),
  );
  return paginateRecords(event, posts);
});
