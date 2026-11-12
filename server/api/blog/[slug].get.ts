import { site } from '../../../shared/data/site';
import { blogStore } from '../../utils/blog-store';
import { recordIsPublic } from '../../utils/management-validation';
export default defineEventHandler(async (event) => {
  if (!site.features.blog) throw createError({ statusCode: 404 });
  const post = await blogStore().get(getRouterParam(event, 'slug')!);
  if (!post || !recordIsPublic(post.fields))
    throw createError({ statusCode: 404, statusMessage: 'Post not found' });
  return post;
});
