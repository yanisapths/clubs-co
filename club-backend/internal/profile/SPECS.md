# User API Specification

**Base URL:** `/api/v1/profile`  
**Auth:** All endpoints require `Authorization: Bearer <token>` (JWT)

---

## Table of Contents

- [Get User Info](#1-get-user-info)
- [Edit Profile](#2-update-user-info)
- [Get User Clubs](#3-get-user-clubs)
- [Delete User](#4-delete-user)
- [Shared Schemas](#shared-schemas)

---

## 1. Get User Info

**`GET /profile`**

Returns user info by the authenticated user.

### Request

No request body. Auth token is used to identify the owner.

### Response `200 OK`

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "displayName":"John Doeee",
    "username": "johndoezzI_123",
    "socialLinks": [
            { "instagram": "https://instagram.com" },
            { "x": "https://x.com" }
          ],
   "joinedAt": 123124124, -- epoch second
   "imageUrl": "https://image-path.com",
   "bio": "hello, I'm John.", -- max 500 char
   "bannerUrl": "https://image-path.com",
   "email": "x.b@email.com"
  }
}
```

### Curl

```bash
curl -X GET http://localhost:9090/api/v1/profile \
  -H "Authorization: Bearer <token>"
```

---

## 2. Edit Profile

**`PATCH /profile`**

Edit profile by the authenticated user.

### Request

No request body. Auth token is used to identify the owner.

### Response `200 OK`

```json
{
  "code": 200,
  "message": "success"
}
```

### Curl

```bash
curl -X PATCH http://localhost:9090/api/v1/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "displayName":"John Doeee", -- max 100 char, allow dup with existing
    "socialLinks": [
            { "instagram": "https://instagram.com" },
            { "x": "https://x.com" }
          ],
   "imageUrl": "https://image-path.com",
   "bio": "hello, I'm John.",
   "bannerUrl": "https://image-path.com"
  }'
```

---

## 3. Get User Clubs

**`GET /profile/club`**

Returns user's clubs.

### Request

No request body. Auth token is used to identify the owner.

### Response `200 OK`

```json
{
  "code": 200,
  "message": "success",
  "data": {
  "stats": {
    "clubFounded": 2,
    "clubMembership": 1,
    "clubJoined": 3,
  },
  "clubs": [
      {
        "id": 1, -- club id
        "imageUrl": "https://path.com",
        "name": "The Hip Street Dance Crew",
        "role": "Founder",
        "memberSince":  123124124, -- epoch second
      },
      {
        "id": 2,
        "imageUrl": "https://path.com",
        "name": "Horse Riding Club",
        "role": "Co-Founder",
        "memberSince":  123124124, -- epoch second
      },
      {
        "id": 3,
        "imageUrl": "https://path.com",
        "name": "Swim Club",
        "role": "Member",
        "memberSince":  123124124, -- epoch second
      }
  ]
}}
```

### Curl

```bash
curl -X GET http://localhost:9090/api/v1/profile/club \
  -H "Authorization: Bearer <token>"
```

---

## 4. Delete User

**`DELET /profile`**

Delete user's related and delete user.

### Request

No request body. Auth token is used to identify the owner.

### Response `200 OK`

```json
{
  "code": 200,
  "message": "success"
}
```

### Curl

```bash
curl -X DELETE http://localhost:9090/api/v1/profile \
  -H "Authorization: Bearer <token>"
```

---
