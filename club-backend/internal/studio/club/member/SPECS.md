# Studio Club's Member API Specification

**Base URL:** `/api/v1/studio/club/:id/member`  
**Auth:** All endpoints require `Authorization: Bearer <token>` (JWT)

---

## Table of Contents

- [Invite member](#1-invite-member)
- [Approve request](#2-approve-request)
- [Cancel request/invite](#3-cancel-requestinvite)
- [Remove member](#4-remove-member)
- [Shared Schemas](#shared-schemas)

---

### POST `/studio/club/:id/member/invite`

Sends a membership invitation to a user. Only the club owner (founder) can invite. Recipient role must be `co-founder` or `member` — founder cannot be invited.

**Auth:** Required

**Path params**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | int  | Club ID     |

**Request body**

```json
{
  "recipient_id": "uuid-of-user-to-invite",
  "role_id": 2
}
```

| Field          | Type | Required | Notes                                                           |
| -------------- | ---- | -------- | --------------------------------------------------------------- |
| `recipient_id` | uuid | ✅       | Must reference an existing user                                 |
| `role_id`      | int  | ✅       | `2` = co-founder, `3` = member. Role `1` (founder) is rejected. |

**Response `201`**

```json
{ "message": "invitation sent" }
```

**Errors**

| Status | Reason                                                                |
| ------ | --------------------------------------------------------------------- |
| `400`  | Invalid club ID or `role_id` is founder (rank 1)                      |
| `403`  | Authenticated user is not the club owner                              |
| `404`  | Club not found                                                        |
| `409`  | Recipient is already a member, or a pending invitation already exists |
| `422`  | Validation failed (missing fields, invalid UUID)                      |

**Invite lifecycle**

```
invite created (invitation_response = NULL / false)
       │
       ├── recipient accepts → row deleted, club_member row inserted
       │
       └── recipient declines → row deleted
```

---

---

## 2. Approve request

**`PATCH /studio/club/:id/member/:member_id/approve-request`**

Approves a user's pending request to join the club, moving their `club_member` row from status `Pending` to `Active`. Only the club owner (founder) can approve. This only applies to self-initiated join requests (e.g. a user requesting to join a private club) — it does **not** apply to invitations sent by the owner, which follow their own accept/decline flow via the recipient.

**Auth:** Required

**Path params**

| Param       | Type | Description                      |
| ----------- | ---- | -------------------------------- |
| `id`        | int  | Club ID                          |
| `member_id` | uuid | User ID of the pending requester |

**Request body** — none

### Response `200 OK`

```json
{ "message": "member request approved" }
```

### Cases

| Case                                           | Status | Response                                      |
| ---------------------------------------------- | ------ | --------------------------------------------- |
| Valid request, member approved                 | `200`  | `"member request approved"`                   |
| Invalid club ID in path                        | `400`  | `"invalid club id"`                           |
| Invalid / missing `member_id` in path          | `400`  | `"invalid member id"`                         |
| Missing / invalid token                        | `401`  | `"unauthorized"`                              |
| Authenticated user is not the club owner       | `403`  | `"only the club owner can approve requests"`  |
| Club not found                                 | `404`  | `"club not found"`                            |
| No pending join request exists for this member | `404`  | `"pending request not found for this member"` |
| DB / server error                              | `500`  | `"internal server error"`                     |

### Curl

```bash
curl -X PATCH http://localhost:9090/api/v1/studio/club/1/member/9e02958e-9a6d-41bc-9d9c-26d487906d67/approve-request \
  -H "Authorization: Bearer <token>"
```

## **Request lifecycle**

## 3. Cancel request/invite

**`DELETE /studio/club/:id/member/:member_id/cancel-request`**

Cancels an outstanding relationship between the club and a user for `member_id`. Only the club owner (founder) can cancel. This endpoint handles two distinct cases and resolves them in order:

1. A **pending join request** the user made (`club_member.status = 'Pending'`) — the row is deleted.
2. If no pending request exists, a **pending invitation** the owner previously sent to that user (`club_member_invite`, not yet accepted/declined/expired) — the row is deleted.

If neither exists, the request fails with `404`.

**Auth:** Required

**Path params**

| Param       | Type | Description                              |
| ----------- | ---- | ---------------------------------------- |
| `id`        | int  | Club ID                                  |
| `member_id` | uuid | User ID of the requester or invited user |

**Request body** — none

### Response `200 OK`

```json
{ "message": "request cancelled" }
```

### Cases

| Case                                                                  | Status | Response                                                   |
| --------------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| Valid request, pending join request cancelled                         | `200`  | `"request cancelled"`                                      |
| Valid request, pending invitation cancelled (no join request existed) | `200`  | `"request cancelled"`                                      |
| Invalid club ID in path                                               | `400`  | `"invalid club id"`                                        |
| Invalid / missing `member_id` in path                                 | `400`  | `"invalid member id"`                                      |
| Missing / invalid token                                               | `401`  | `"unauthorized"`                                           |
| Authenticated user is not the club owner                              | `403`  | `"only the club owner can cancel requests or invitations"` |
| Club not found                                                        | `404`  | `"club not found"`                                         |
| No pending join request or invitation found for this member           | `404`  | `"no pending request or invitation found for this member"` |
| DB / server error                                                     | `500`  | `"internal server error"`                                  |

### Curl

```bash
curl -X DELETE http://localhost:9090/api/v1/studio/club/1/member/9e02958e-9a6d-41bc-9d9c-26d487906d67/cancel-request \
  -H "Authorization: Bearer <token>"
```

---

## 4. Remove member

**`DELETE /studio/club/:id/member/:member_id`**

Removes an existing **active** club member. Only the club owner (founder) can remove a member. Only members with role `Member` or `Co-Founder` can be removed — the **Founder can never be removed** through this endpoint.

**Auth:** Required

**Path params**

| Param       | Type | Description                     |
| ----------- | ---- | ------------------------------- |
| `id`        | int  | Club ID                         |
| `member_id` | uuid | User ID of the member to remove |

**Request body** — none

### Response `200 OK`

```json
{ "message": "member removed" }
```

### Cases

| Case                                     | Status | Response                                   |
| ---------------------------------------- | ------ | ------------------------------------------ |
| Valid request, member removed            | `200`  | `"member removed"`                         |
| Invalid club ID in path                  | `400`  | `"invalid club id"`                        |
| Invalid / missing `member_id` in path    | `400`  | `"invalid member id"`                      |
| Missing / invalid token                  | `401`  | `"unauthorized"`                           |
| Authenticated user is not the club owner | `403`  | `"only the club owner can remove members"` |
| `member_id` refers to the club Founder   | `403`  | `"the club founder cannot be removed"`     |
| Club not found                           | `404`  | `"club not found"`                         |
| Member not found in this club            | `404`  | `"member not found"`                       |
| DB / server error                        | `500`  | `"internal server error"`                  |

### Curl

```bash
curl -X DELETE http://localhost:9090/api/v1/studio/club/1/member/9e02958e-9a6d-41bc-9d9c-26d487906d67 \
  -H "Authorization: Bearer <token>"
```

---

## Shared Schemas

### Error Response

```json
{
  "success": false,
  "error": "<error message>"
}
```

### Role IDs (`club_member_roles`)

| `role_id` | Rank | Description                                                                     |
| --------- | ---- | ------------------------------------------------------------------------------- |
| `1`       | 1    | Founder — assigned automatically on club creation, cannot be invited or removed |
| `2`       | 2    | Co-Founder                                                                      |
| `3`       | 3    | Member                                                                          |

### `club_member.status` values

| Value     | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| `Active`  | Confirmed member with full access                                   |
| `Pending` | Self-initiated join request awaiting owner approval (private clubs) |

### Membership lifecycle overview
