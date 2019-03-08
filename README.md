# Revshare Pointer
> Create ILP payment pointers that split payments to multiple destinations

- [Overview](#overview)
- [API](#api)
  - [`GET /login`](#post-pointersname)
  - [`POST /pointers/:name`](#post-pointersname)
  - [`PUT /pointers/:name`](#post-pointersname)
  - [`DELETE /pointers/:name`](#post-pointersname)
  - [`GET /pointers/:name`](#get-pointersname)
  - [`GET /:name`](#get-name)
- [TODOs](#todos)

## Overview

[Web Monetization](https://webmonetization.org) functions really well when you
want to get paid for content you make. But content can rarely be attributed to
a single person. Revshare Pointer is a service that anyone can run which
receives money and immediately forwards it out to one or more different payment
pointers. You can specify the percentages through a graphical interface when
you create a revshare payment pointer.

## API

### `GET /login`

Authentication for access to protected endpoints. Must send a request with a request token in the authorization header in the format `Bearer <token>`.

```json
{
  "accessToken": "eyJhbGciOi..."
}
```

### `POST /pointers/:name`

Creates a revshare pointer with name `:name`. Allowed characters for the name are the base64url character set (`[A-Za-z0-9\-_]`). This is a protected endpoint, so must provide an access token in the authorization header in the format `Bearer <token>`.

The body of this request should be a JSON object containing a `payout` field.
This `payout` field describes how payments to this pointer will be broken up.

The `payout` field is an array with each of the entities to pay out to. Each of
these entities is an object with a `percent` field and a `pointer` field. The
`pointer` field contains the payment pointer of the entity. The `percent` field
contains the percent of incoming funds to be redirected to the entity.

The sum of all `percent`s in the `payout` array must sum to `100`, or else the
request will return `400`.

#### Request

```json
{
    "payout": [
        {
            "percent": 90,
            "pointer": "$twitter.xrptipbot.com/sharafian_"
        },
        {
            "percent": 10,
            "pointer": "$twitter.xrptipbot.com/Coil"
        }
    ]
}
```

#### Response

```json
{
    "name": "name",
    "payout": [
        {
            "percent": 90,
            "pointer": "$twitter.xrptipbot.com/sharafian_"
        },
        {
            "percent": 10,
            "pointer": "$twitter.xrptipbot.com/Coil"
        }
    ]
}
```
### `PUT /pointers/:name`

Updates an existing payment pointer `:name`.  Allowed characters for the name are the base64url character set (`[A-Za-z0-9\-_]`). This is a protected endpoint, so must provide an access token in the authorization header in the format `Bearer <token>`.

#### Request

```json
{
    "payout": [
        {
            "percent": 80,
            "pointer": "$twitter.xrptipbot.com/sharafian_"
        },
        {
            "percent": 20,
            "pointer": "$twitter.xrptipbot.com/Interledger"
        }
    ]
}
```

#### Response

```json
{
    "name": "name",
    "payout": [
        {
            "percent": 80,
            "pointer": "$twitter.xrptipbot.com/sharafian_"
        },
        {
            "percent": 20,
            "pointer": "$twitter.xrptipbot.com/Interledger"
        }
    ]
}
```

### `DELETE /pointers/:name`

Deletes an existing payment pointer `:name`. A payment pointer must have been created for `:name`. This is a protected endpoint, so must provide an access token in the authorization header in the format `Bearer <token>`.

### `GET /pointers/:name`

Gets the details of payment pointer `:name`. This is a protected endpoint, so must provide an access token in the authorization header in the format `Bearer <token>`.

```json
{
    "name": "name",
    "payout": [
        {
            "percent": 90,
            "pointer": "$twitter.xrptipbot.com/sharafian_"
        },
        {
            "percent": 10,
            "pointer": "$twitter.xrptipbot.com/Coil"
        }
    ]
}
```

### `GET /:name`

This is an
[SPSP](https://github.com/interledger/rfcs/blob/master/0009-simple-payment-setup-protocol/0009-simple-payment-setup-protocol.md)
endpoint which returns a destination address and shared secret for this
pointer.

You must set `Accept` to `application/spsp4+json`, and a pointer must have been
created for `:name`.

```json
{
  "destination_address": "g.scylla...",
  "shared_secret": "4rw60UWNnXQY..."
}
```

## Environment Variables

| Name | Default | Description |
|:---|:---|:---|
| `REVSHARE_PORT` | `8080` | Port to listen on locally. |
| `REVSHARE_DB_PATH` | `./revshare-pointer-db` | Path for leveldb database. Uses in-memory database if unspecified. |
| `REVSHARE_REQUEST_TOKEN` | `test` | Request token used for authentication to login and obtain an access token. |
| `REVSHARE_JWT_SECRET` | `test` | Secret used for access token generation and verification. |
| `REVSHARE_JWT_ISS` | `test` | Issuer claim identifying the server that issued the JWT. |
| `REVSHARE_JWT_AUD` | `test` | Audience claim identifying the server that the JWT is intended for. |
| `REVSHARE_JWT_EXP` | `10m` | Expiration claim identifying the time on or after which the JWT should not be accepted for processing. |

## TODOs

- [x] implement revshare pointer creation API
- [x] revshare stream payment forwarding
- [ ] web GUI to create revshare pointers
- [ ] instructions on how to run your own revshare pointer server
- [x] authentication to modify/delete revshare pointers
