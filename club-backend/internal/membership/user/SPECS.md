## Membership User Endpoints

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
