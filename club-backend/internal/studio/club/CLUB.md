# Studio Club API Specification

**Base URL:** `/api/v1/studio/club`  
**Auth:** All endpoints require `Authorization: Bearer <token>` (JWT)

---

## Table of Contents

- [Get Club List](#1-get-club-list)
- [Create Club](#2-create-club)
- [Update Club](#3-update-club)
- [Delete Club](#4-delete-club)
- [Shared Schemas](#shared-schemas)

---

## 1. Get Club List

**`GET /studio/club`**

Returns all clubs owned by the authenticated user.

### Request

No request body. Auth token is used to identify the owner.

### Response `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ownerId": "xxx",
      "owner": "jane_doe",
      "name": "Jane's Club",
      "description": "A cozy test club",
      "imageUrl": "",
      "clubType": "Public",
      "visibility": "Anyone",
      "maxSeats": 200,
      "allowFollowers": true,
      "activate": true,
      "socialLinks": [
        { "instagram": "https://instagram.com" },
        { "x": "https://x.com" }
      ],
      "spaceIds": [1, 2],
      "categoryName": "Sports",
      "tags": [
        { "id": 1, "name": "Polo" },
        { "id": 2, "name": "Horse Riding" }
      ],
      "createdAt": 1750000000,
      "updatedAt": 1750000000
    }
  ]
}
```

### Cases

| Case                      | Status | Response                                                |
| ------------------------- | ------ | ------------------------------------------------------- |
| Valid token, clubs exist  | `200`  | Array of clubs                                          |
| Valid token, no clubs yet | `200`  | Empty array `[]`                                        |
| Missing / invalid token   | `401`  | `{ "success": false, "error": "invalid token claims" }` |

### Curl

```bash
curl -X GET http://localhost:9090/api/v1/studio/club \
  -H "Authorization: Bearer <token>"
```

---

## 2. Create Club

**`POST /studio/club`**

Creates a new club owned by the authenticated user. Tags and spaces can be reused by ID or created by name.

### Request Body

```json
{
  "name": "Chess Club",
  "description": "Strategic minds only",
  "clubType": "Public",
  "visibility": "Anyone",
  "maxSeats": 50,
  "categoryId": 1,
  "tags": [{ "id": 1 }, { "name": "Chess" }],
  "spaces": [
    { "id": 2 },
    { "name": "Bangkok Hub", "country": "Thailand", "city": "Bangkok" }
  ]
}
```

### Request Schema

| Field              | Type    | Required | Rules                                |
| ------------------ | ------- | -------- | ------------------------------------ |
| `name`             | string  | yes      | min 2, max 100 chars                 |
| `description`      | string  | no       | max 250 chars                        |
| `clubType`         | string  | yes      | `Public` \| `Private` \| `Exclusive` |
| `visibility`       | string  | yes      | `Anyone` \| `MemberOnly`             |
| `maxSeats`         | integer | yes      | min 1, max 200                       |
| `categoryId`       | integer | yes      | must exist in `category` table       |
| `tags`             | array   | no       | max 3 items                          |
| `tags[].id`        | integer | no       | reuse existing tag by ID             |
| `tags[].name`      | string  | no       | create new tag if slug not found     |
| `spaces`           | array   | no       | no limit                             |
| `spaces[].id`      | integer | no       | reuse existing space by ID           |
| `spaces[].name`    | string  | no       | create new space if slug not found   |
| `spaces[].country` | string  | no       | used when creating new space         |
| `spaces[].city`    | string  | no       | used when creating new space         |

> If both `id` and `name` are provided on a tag/space, `id` takes priority.

### Response `201 Created`

```json
{
  "success": true,
  "data": {
    "id": 2,
    "ownerId": "xxx",
    "name": "Chess Club",
    "description": "Strategic minds only",
    "clubType": "Public",
    "visibility": "Anyone",
    "maxSeats": 50,
    "createdAt": 1750000000,
    "updatedAt": 1750000000
  }
}
```

### Cases

| Case                       | Status | Response                        |
| -------------------------- | ------ | ------------------------------- |
| Valid request              | `201`  | Created club object             |
| Missing required field     | `400`  | Validation error message        |
| More than 3 tags           | `400`  | `"cannot add more than 3 tags"` |
| Invalid `clubType` value   | `400`  | Validation error message        |
| Invalid `visibility` value | `400`  | Validation error message        |
| `maxSeats` > 200           | `400`  | Validation error message        |
| Missing / invalid token    | `401`  | `"invalid token claims"`        |
| DB / server error          | `500`  | Error message                   |

### Curls

Reuse existing tag and space by ID:

```bash
curl -X POST http://localhost:9090/api/v1/studio/club \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Club",
    "description": "A cozy test club",
    "clubType": "Public",
    "visibility": "Anyone",
    "maxSeats": 100,
    "categoryId": 1,
    "tags": [{ "id": 1 }, { "id": 5 }],
    "spaces": [{ "id": 2 }]
  }'
```

Create new tag and space by name:

```bash
curl -X POST http://localhost:9090/api/v1/studio/club \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Chess Club",
    "description": "Strategic minds only",
    "clubType": "Private",
    "visibility": "MemberOnly",
    "maxSeats": 50,
    "categoryId": 1,
    "tags": [{ "name": "Chess" }, { "id": 6 }],
    "spaces": [{ "name": "Bangkok Hub", "country": "Thailand", "city": "Bangkok" }]
  }'
```

---

## 3. Update Club

**`PUT /studio/club/:id`**

Updates an existing club. Only the owner can update their club. All fields are optional — only provided fields are updated. Tags and spaces are fully replaced if provided.

### Path Parameter

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | integer | Club ID     |

### Request Body

```json
{
  "name": "Updated Club Name",
  "maxSeats": 150,
  "visibility": "MemberOnly",
  "tags": [{ "id": 1 }, { "name": "NewTag" }],
  "spaces": [{ "id": 2 }]
}
```

### Request Schema

| Field           | Type    | Required | Rules                                     |
| --------------- | ------- | -------- | ----------------------------------------- |
| `name`          | string  | no       | min 2, max 100 chars                      |
| `description`   | string  | no       | max 250 chars                             |
| `clubType`      | string  | no       | `Public` \| `Private` \| `Exclusive`      |
| `visibility`    | string  | no       | `Anyone` \| `MemberOnly`                  |
| `maxSeats`      | integer | no       | min 1, max 200                            |
| `categoryId`    | integer | no       | must exist in `category` table            |
| `displayStatus` | string  | no       |                                           |
| `tags`          | array   | no       | max 3 items; fully replaces existing tags |
| `spaces`        | array   | no       | fully replaces existing spaces            |

> Omitting `tags` or `spaces` will clear them. Send the full desired list each time.

### Response `200 OK`

```json
{
  "success": true,
  "data": "success"
}
```

### Cases

| Case                                | Status | Response                        |
| ----------------------------------- | ------ | ------------------------------- |
| Valid request                       | `200`  | `"success"`                     |
| Invalid club ID in path             | `400`  | `"invalid club id"`             |
| More than 3 tags                    | `400`  | `"cannot add more than 3 tags"` |
| Invalid field value                 | `400`  | Validation error message        |
| Missing / invalid token             | `401`  | `"invalid token claims"`        |
| Club not found or not owned by user | `404`  | `"club not found"`              |
| DB / server error                   | `500`  | Error message                   |

### Curl

```bash
curl -X PUT http://localhost:9090/api/v1/studio/club/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Club Name",
    "maxSeats": 150,
    "tags": [{ "id": 1 }, { "name": "NewTag" }],
    "spaces": [{ "id": 2 }]
  }'
```

---

## 4. Delete Club

**`DELETE /studio/club/:id`**

Permanently deletes a club. Only the owner can delete their own club.

### Path Parameter

| Param | Type    | Description |
| ----- | ------- | ----------- |
| `id`  | integer | Club ID     |

### Request

No request body.

### Response `200 OK`

```json
{
  "success": true,
  "data": null
}
```

### Cases

| Case                                | Status | Response                 |
| ----------------------------------- | ------ | ------------------------ |
| Valid request, club deleted         | `200`  | `null` data              |
| Invalid club ID in path             | `400`  | `"invalid club id"`      |
| Missing / invalid token             | `401`  | `"invalid token claims"` |
| Club not found or not owned by user | `404`  | `"club not found"`       |

### Curl

```bash
curl -X DELETE http://localhost:9090/api/v1/studio/club/1 \
  -H "Authorization: Bearer <token>"
```

---

## Shared Schemas

### Club Object (GET response)

| Field            | Type              | Description                          |
| ---------------- | ----------------- | ------------------------------------ |
| `id`             | integer           | Club ID                              |
| `ownerId`        | string (UUID)     | Owner's user ID                      |
| `owner`          | string            | Owner's username                     |
| `name`           | string            | Club name                            |
| `description`    | string            | Club description                     |
| `imageUrl`       | string            | Club image URL                       |
| `clubType`       | string            | `Public` \| `Private` \| `Exclusive` |
| `visibility`     | string            | `Anyone` \| `MemberOnly`             |
| `maxSeats`       | integer           | Maximum number of members            |
| `allowFollowers` | boolean           | Whether followers are allowed        |
| `activate`       | boolean           | Whether the club is active           |
| `socialLinks`    | array             | List of social link objects          |
| `spaceIds`       | array of integers | Associated space IDs                 |
| `categoryName`   | string            | Category name                        |
| `tags`           | array of Tag      | Associated tags                      |
| `createdAt`      | integer (Unix)    | Creation timestamp in seconds        |
| `updatedAt`      | integer (Unix)    | Last updated timestamp in seconds    |

### Tag Object

| Field  | Type    | Description |
| ------ | ------- | ----------- |
| `id`   | integer | Tag ID      |
| `name` | string  | Tag name    |

### Error Response

```json
{
  "success": false,
  "error": "<error message>"
}
```

### ClubType Values

| Value       | Description           |
| ----------- | --------------------- |
| `Public`    | Open to everyone      |
| `Private`   | Restricted access     |
| `Exclusive` | Invite-only exclusive |

### Visibility Values

| Value        | Description                  |
| ------------ | ---------------------------- |
| `Anyone`     | Visible to all users         |
| `MemberOnly` | Visible to club members only |
