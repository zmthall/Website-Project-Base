import { renderMarkdown } from '../../../utils/markdown';
import { boundedJson } from '../../../utils/bounded-body';
export default defineEventHandler(async (event) => {
  const body = await boundedJson(event);
  if (typeof body.content !== 'string' || body.content.length > 100000)
    throw createError({ statusCode: 400 });
  return renderMarkdown(body.content);
});
