export interface UploadPolicy {
  maxBytes: number;
  maxFiles: number;
  mimeTypes: string[];
  extensions: string[];
}
export interface UploadMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: 'processing' | 'ready' | 'rejected';
  expiresAt?: string;
}
export interface UploadSession {
  id: string;
  contentPath: string;
  expiresAt: string;
}
export interface UploadRequest {
  name: string;
  size: number;
  mimeType: string;
  temporary: boolean;
}
export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}
