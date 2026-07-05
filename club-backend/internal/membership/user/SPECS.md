## Membership User Endpoints

> `/membership` routes use `OptionalAuth` — requests are allowed without a token. None of the endpoints below currently vary their response based on the caller's identity, but the group-level middleware means an `Authorization` header is safe to send and won't cause a `401`.

---

### GET `/membership/user/exist`

**Auth:** Optional

**Request**

1. Check email

```bash
curl -X GET http://localhost:9090/api/v1/membership/user/exist?email=test@example.com
```

2. Check username

```bash
curl -X GET http://localhost:9090/api/v1/membership/user/exist?username=john
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "exist": true
  }
}
```

---

### GET `/membership/user/:username`

Returns the public profile for a member, looked up by username. Used to render another user's profile page (as opposed to `GET /profile`, which returns the authenticated caller's own profile and requires a token).

**Auth:** Optional

**Path params**

| Param      | Type   | Description           |
| ---------- | ------ | --------------------- |
| `username` | string | The member's username |

**Request**

```bash
curl -X GET http://localhost:9090/api/v1/membership/user/john \
  -H "Content-Type: application/json"
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "b3f1c2e0-...",
    "username": "john",
    "displayName": "John Doe",
    "bio": "Photographer and chess enthusiast.",
    "imageUrl": "https://example.com/avatar.jpg",
    "bannerUrl": "https://example.com/banner.jpg",
    "socialLinks": [{ "instagram": "https://instagram.com/john" }],
    "joinedAt": 1781739788
  }
}
```

**Errors**

| Status | Reason                     |
| ------ | -------------------------- |
| `400`  | Missing/empty username     |
| `404`  | No user with that username |
| `500`  | Internal server error      |

---

### GET `/membership/user/:username/club`

Returns club membership stats and the list of (non-deleted) clubs a member belongs to, looked up by username. Used to power the "Clubs" tab and stat cards on another user's public profile.

**Auth:** Optional

**Path params**

| Param      | Type   | Description           |
| ---------- | ------ | --------------------- |
| `username` | string | The member's username |

**Request**

```bash
curl -X GET http://localhost:9090/api/v1/membership/user/john/club \
  -H "Content-Type: application/json"
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "stats": {
      "clubFounded": 1,
      "clubJoined": 3,
      "clubMembership": 4
    },
    "clubs": [
      {
        "id": 1,
        "name": "Photography Club",
        "imageUrl": "https://example.com/image.jpg",
        "category": "Arts",
        "role": "founder",
        "memberSince": 1781739788
      },
      {
        "id": 3,
        "name": "Chess Club",
        "imageUrl": "",
        "category": "Sports",
        "role": "member",
        "memberSince": 1781916575
      }
    ]
  }
}
```

| Field                  | Notes                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `stats.clubFounded`    | Clubs where the user holds the `founder` role (rank 1)              |
| `stats.clubJoined`     | Clubs where the user holds any non-founder role (co-founder/member) |
| `stats.clubMembership` | Total: `clubFounded + clubJoined`                                   |
| `clubs`                | Ordered by `joined_at` descending; empty array if none              |

**Errors**

| Status | Reason                     |
| ------ | -------------------------- |
| `400`  | Missing/empty username     |
| `404`  | No user with that username |
| `500`  | Internal server error      |

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
