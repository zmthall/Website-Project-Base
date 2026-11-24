# Private uploads

Uploads is an active local feature used by signed-in customers when attaching project files to estimate requests. The implementation lives entirely in `feature-layers/uploads` and keeps stored bytes outside `public/`.

## Lifecycle and endpoints

The browser initializes a session, transfers bytes to a same-origin path, completes inspection, and submits only ready upload IDs to the Estimate workflow.

| Method   | Path                             | Purpose                                                                           |
| -------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `POST`   | `/api/uploads`                   | Validate metadata, quota, ownership and idempotency; create a quarantined session |
| `PUT`    | `/api/uploads/:id/content`       | Store an exact, bounded byte payload in quarantine                                |
| `POST`   | `/api/uploads/:id/complete`      | Inspect bytes and move accepted content to private ready storage                  |
| `GET`    | `/api/uploads/:id`               | Return owner-visible status metadata                                              |
| `GET`    | `/api/uploads/:id/content`       | Download unexpired ready content as an attachment                                 |
| `DELETE` | `/api/uploads/:id`               | Remove an unclaimed upload owned by the current customer                          |
| `GET`    | `/api/admin/uploads/:id/content` | Let an authenticated administrator download a claimed attachment                  |

Every mutation requires the local customer session's CSRF token. Cross-account status, download and deletion return not found. Administrators can download only files that have been claimed by an Estimate. Downloads use `nosniff`, an authoritative stored content type, and attachment disposition.

## Local policy

- Accepted formats are PDF, PNG and JPEG, with matching extension, declared MIME type and file signature.
- Files are limited to 5 MB each, five active uploads per owner and 25 MB of active reserved bytes per owner.
- Initialization sessions expire after one hour. Ready but unattached files expire after 24 hours.
- Estimate submission resolves only ready files owned by that customer, marks them claimed and extends retention to 30 days.
- Expired records and bytes are removed during subsequent initialization operations. Omitted files are deleted immediately through the UI.
- Executable signatures, the EICAR test signature, size mismatches and type mismatches are rejected before bytes leave quarantine.

Metadata is stored in `.data/uploads.sqlite`; object bytes default to `.data/uploads/objects`. Override those private local paths with `NUXT_UPLOAD_STORAGE_DATABASE` and `NUXT_UPLOAD_STORAGE_DIRECTORY`. Never place either path under `public/`.

## Production boundary

The local scanner is deliberately conservative signature and file-type inspection, not a claim of comprehensive malware detection. `UploadScanner` is the server-only extension point for a deployment scanner. A production deployment must install and test its chosen malware-scanning/object-storage adapter, durable cleanup worker, retention policy, backups and multi-instance quota coordination before collecting sensitive files at scale. Reserved `NUXT_INTEGRATIONS_UPLOADS_*` settings do not replace the active local provider by themselves.

## Verification

Unit tests cover lifecycle, ownership, metadata validation, byte inspection, scanner rejection, idempotency, quotas, expiry and cleanup. Browser/API tests cover CSRF, cross-account isolation, binary transfer/download, claimed-file retention and Estimate attachment rendering.
