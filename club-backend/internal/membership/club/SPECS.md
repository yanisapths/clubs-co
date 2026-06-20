## Membership Endpoints

> `/membership` routes use `OptionalAuth` — requests are allowed without a token, but `user_id` is only available when authenticated. `JOIN` and `LEAVE` actions require authentication.

---

### GET `/membership/club`

Returns all active, public clubs. When authenticated, can be used to determine membership status at the application layer.

**Auth:** Optional

**Request**

```bash
curl -X GET http://localhost:9090/api/v1/membership/club \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

**Response `200`**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Photography Club",
      "description": "For photography enthusiasts",
      "image_url": "https://example.com/image.jpg",
      "clubType": "Public",
      "visibility": "Anyone",
      "maxSeats": 100,
      "memberCount": 42,
      "allowFollowers": true,
      "category": "Arts",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

| Field          | Type | Notes                         |
| -------------- | ---- | ----------------------------- |
| `member_count` | int  | Live count of current members |

**Filters applied server-side**

- `is_deleted = false`
- `activate = true`
- `visibility = 'Anyone'`

---

### POST `/membership/club/:id/join`

Joins a public club as a regular member.

**Auth:** Required (returns `401` for unauthenticated requests)

**Path params**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | int  | Club ID     |

**Request body** — none

**Request**

```bash
curl -X POST http://localhost:9090/api/v1/membership/club/:id/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

**Response `201`**

```json
{ "message": "joined club successfully" }
```

**Side effects**

- User is inserted into `club_member` with role `member` (rank 3).

**Errors**

| Status | Reason                                                   |
| ------ | -------------------------------------------------------- |
| `400`  | Invalid club ID                                          |
| `401`  | Not authenticated                                        |
| `403`  | Club is not public (Private clubs require an invitation) |
| `404`  | Club not found or inactive                               |
| `409`  | Already a member, or club has reached `max_seats`        |

---

### DELETE `/membership/club/:id/leave`

Leaves a club. Founders cannot leave — they must delete the club instead.

**Auth:** Required

**Path params**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | int  | Club ID     |

**Request body** — none

**Request**

```bash
curl -X DELETE http://localhost:9090/api/v1/membership/club/:id/leave \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

**Response `200`**

```json
{ "message": "left club successfully" }
```

---

### GET `/membership/club/:id`

Get club info by id.

**Auth:** Required

**Path params**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | int  | Club ID     |

**Request body** — none

**Request**

```bash
curl -X GET http://localhost:9090/api/v1/membership/club/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

**Response `200`**

```json
{
  "code": 200,
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Chess Club",
      "description": "Strategic minds only",
      "imageUrl": "",
      "clubType": "Private",
      "visibility": "MemberOnly",
      "category": "Sports",
      "tags": null,
      "createdAt": 1781916575,
      "isMember": false,
      "memberCount": 1
    },
    {
      "id": 1,
      "name": "Jane's Club",
      "description": "A cozy test club",
      "imageUrl": "",
      "clubType": "Public",
      "visibility": "Anyone",
      "category": "Sports",
      "tags": null,
      "createdAt": 1781739788,
      "isMember": false,
      "memberCount": 1
    }
  ]
}
```

**Errors**

| Status | Reason                                        |
| ------ | --------------------------------------------- |
| `400`  | Invalid club ID                               |
| `401`  | Not authenticated                             |
| `403`  | User is the founder — delete the club instead |
| `404`  | User is not a member of this club             |

---

## Roles Reference

| ID  | Name       | Rank | Can invite | Can kick members | Can leave             |
| --- | ---------- | ---- | ---------- | ---------------- | --------------------- |
| 1   | founder    | 1    | ✅         | ✅               | ❌ (must delete club) |
| 2   | co-founder | 2    | ❌         | ✅               | ✅                    |
| 3   | member     | 3    | ❌         | ❌               | ✅                    |

> Lower rank = higher authority.

---

## Error Response Format

All errors follow a consistent envelope:

```json
{ "error": "human-readable message" }
```

---

## Common Status Codes

| Code  | Meaning                                        |
| ----- | ---------------------------------------------- |
| `200` | OK                                             |
| `201` | Created                                        |
| `400` | Bad request / invalid input                    |
| `401` | Missing or invalid JWT                         |
| `403` | Forbidden — authenticated but not permitted    |
| `404` | Resource not found                             |
| `409` | Conflict (duplicate, already exists, capacity) |
| `422` | Validation error                               |
| `500` | Internal server error                          |
