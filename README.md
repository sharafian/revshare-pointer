# Revshare Pointer
> Create ILP payment pointers that split payments to multiple destinations

- [Overview](#overview)
- [API](#api)
  - [`POST /pointers/:name`](#post-pointersname)
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

### `POST /pointers/:name`

Creates a revshare pointer with name `:name`. Allowed characters for the name are the base64url character set (`[A-Za-z0-9\-_]`).

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

### `GET /pointers/:name`

Gets the details of payment pointer `:name`.

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

## TODOs

- [x] Implement revshare pointer creation API
- [x] revshare stream payment forwarding
- [ ] web GUI to create revshare pointers
- [ ] instructions on how to run your own revshare pointer server
- [ ] authentication to modify/delete revshare pointers
