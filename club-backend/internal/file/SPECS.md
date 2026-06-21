# File Upload — Feature Specification

## Overview

A generic file upload endpoint that streams a multipart file directly to Google Cloud Storage.  
Filename generation is **not** the responsibility of this package — the caller must supply a pre-built filename.

---

## Endpoint

| Field        | Value                 |
| ------------ | --------------------- |
| Method       | `PUT`                 |
| Path         | `/api/v1/file/upload` |
| Auth         | Required (JWT Bearer) |
| Content-Type | `multipart/form-data` |

---

## Request

### Form Fields

| Field       | Type   | Required | Description                                                                                            |
| ----------- | ------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `file`      | File   | Yes      | The image file to upload                                                                               |
| `filename`  | String | Yes      | Pre-built filename supplied by the caller (e.g. `club_foo_123_uuid_thumbnail.png`)                     |
| `dest_path` | String | Yes      | Destination path inside the bucket (e.g. `club/images`). Must not contain leading or trailing slashes. |

### Constraints

| Constraint    | Value                                               |
| ------------- | --------------------------------------------------- |
| Max file size | 5 MB                                                |
| Allowed MIME  | `image/*` (detected from file bytes, not extension) |

---

## Response

### Success `200 OK`

```json
{
  "url": "xxxx/club_foo_123_uuid_thumbnail.png",
  "filename": "club_foo_123_uuid_thumbnail.png"
}
```

### Error Responses

| Status | Reason                                        |
| ------ | --------------------------------------------- |
| `400`  | Missing `file` field                          |
| `400`  | Missing `filename` field                      |
| `400`  | File exceeds 5 MB or malformed multipart form |
| `400`  | File MIME type is not an image                |
| `401`  | Missing or invalid JWT token                  |
| `500`  | GCS write failed or could not read file       |

---

## Storage

| Property      | Value                         |
| ------------- | ----------------------------- |
| Bucket        | `club-space-bucket`           |
| Object prefix | `club/images/`                |
| Full path     | `club/images/{filename}`      |
| Public URL    | `xxxx/club/images/{filename}` |
| Content-Type  | `image/png`                   |
| Cache-Control | `public, max-age=86400`       |

### Replace / Overwrite Behaviour

The endpoint does **not** delete the previous object. Whether an upload overwrites an existing object depends entirely on the filename supplied by the caller:

- **Unique filename each time** (includes UUID) → new object, old one remains.
- **Stable filename** (e.g. keyed only on `club_id`) → GCS overwrites the existing object automatically.

The naming strategy is decided in the **caller's domain**, not here.

---

## Filename Convention (Club Thumbnail)

Filename generation lives in `internal/studio/club/filename.go`, not in the upload package.

```
club_[slug]_[club_id]_[uuid]_thumbnail.png
```

| Segment     | Example             | Notes                                                |
| ----------- | ------------------- | ---------------------------------------------------- |
| `club`      | `club`              | Constant prefix                                      |
| `[slug]`    | `my_awesome_club`   | Lowercased, non-alphanumeric chars replaced with `_` |
| `[club_id]` | `a1b2c3`            | Club's UUID/ID from the database                     |
| `[uuid]`    | `f47ac10b-58cc-...` | Random UUID, ensures uniqueness                      |
| `thumbnail` | `thumbnail`         | Constant suffix                                      |

---

## Package Responsibilities

| Package                | Responsibility                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| `internal/file`        | Validate, stream file to GCS, return public URL                         |
| `internal/studio/club` | Generate the thumbnail filename via `ThumbnailFilename()`               |
| Caller (handler)       | Build filename → call upload endpoint (or service) with filename + file |

The `internal/file` package has **no knowledge** of clubs, naming conventions, or any domain logic.

---

## GCS Authentication

Uses [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials).

| Environment     | Credential Source                       |
| --------------- | --------------------------------------- |
| Local dev       | `gcloud auth application-default login` |
| Cloud Run / GKE | Attached service account                |

The service account must have the `storage.objects.create` and `storage.objects.delete` roles on `club-space-bucket`.

---

## Dependencies

```
cloud.google.com/go/storage
github.com/google/uuid        // used by the club domain, not the upload package
github.com/gin-gonic/gin
```
