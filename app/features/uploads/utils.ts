import type { UploadPolicy } from './types';
export function validateUploads(
  files: Pick<File, 'name' | 'size' | 'type'>[],
  policy: UploadPolicy,
): string[] {
  const errors: string[] = [];
  if (files.length > policy.maxFiles) errors.push(`Choose no more than ${policy.maxFiles} files.`);
  for (const file of files) {
    if (file.size <= 0 || file.size > policy.maxBytes)
      errors.push(`${file.name}: invalid file size.`);
    if (
      !policy.mimeTypes.includes(file.type) ||
      !policy.extensions.some((extension) =>
        file.name.toLowerCase().endsWith(extension.toLowerCase()),
      )
    )
      errors.push(`${file.name}: unsupported file type.`);
  }
  return errors;
}
