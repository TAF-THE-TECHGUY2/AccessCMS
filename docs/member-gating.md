# Member gating

Gating fund content on the public site (`ap.boston`) behind an investor
dashboard login (`investor.ap.boston`).

## Why this is not one line of code

The two sites are separate origins with separate backends:

| Host | What it is | Repo |
| --- | --- | --- |
| `ap.boston` | Marketing site (CRA) | `AccessCMS/public-frontend` |
| `api.ap.boston` | CMS API (Express + Mongo) | `AccessCMS/backend` |
| `admin.ap.boston` | CMS admin | `AccessCMS/admin-frontend` |
| `investor.ap.boston` | Investor portal (Vite SPA) | `accesspropties/access-properties` |
| `investor-api.ap.boston` | Laravel + Sanctum API | `accesspropties/backend` |

Investor login stores a Sanctum bearer token in `localStorage` on
`investor.ap.boston` (`src/services/investorApi.js`). `localStorage` is
origin-scoped, so `ap.boston` can never read it. The public site therefore has
no way, today, to know whether a visitor is signed in.

What makes this tractable is that every host is a subdomain of `ap.boston`, so
a cookie scoped to `Domain=.ap.boston` is sent to all of them.

## Phase 1 — shipped

The gate as a design, with no server behind it.

- `Page` sections carry `access: "PUBLIC" | "MEMBERS"` (`backend/src/models/Page.ts`).
- The CMS admin has a **Members only** switch on every section, plus two section
  types: `MEMBER_GATE` (the sign-up card) and `FUND_DETAIL`.
- `SectionRenderer` wraps any locked section in `LockedSection`, which blurs it
  behind a "Members access" card.

## Phase 2 — shipped

The gate is now enforced on the server. A signed-out visitor's browser never
receives members-only content, so there is nothing to un-blur.

### How a login on one domain unlocks the other

1. An investor signs in at `investor.ap.boston`. Laravel returns the usual
   Sanctum bearer token **and** sets `ap_member`: a short-lived HS256 JWT,
   `HttpOnly`, `Secure`, `SameSite=Lax`, scoped to `Domain=.ap.boston`.
2. The visitor opens `ap.boston/funds`. The browser sends that cookie to
   `api.ap.boston` because both are under the same parent domain.
3. The CMS verifies the JWT with the shared secret — no call back to Laravel —
   and only then includes members-only section content in its response.

### Configuration

Both services need the **same** `MEMBER_JWT_SECRET`. Generate one with
`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

| Service | Variables |
| --- | --- |
| Laravel (`investor-api.ap.boston`) | `MEMBER_JWT_SECRET`, `MEMBER_COOKIE_DOMAIN=.ap.boston`, `MEMBER_COOKIE_NAME`, `MEMBER_COOKIE_TTL`, `MEMBER_COOKIE_SECURE` |
| CMS (`api.ap.boston`) | `MEMBER_JWT_SECRET`, `MEMBER_COOKIE_NAME` |

**It fails closed.** Leave the secret unset and every visitor is a guest:
members-only sections are stripped for everyone. A misconfiguration hides
content, it does not expose it.

Rotating the secret signs everyone out of the gated marketing pages. It does
not sign anyone out of the dashboard.

### What each piece does

**Laravel** (`accesspropties/backend`)
- `config/member.php` — all settings, disabled unless secret and domain are set.
- `app/Support/MemberSessionCookie.php` — mints and clears the cookie.
- `InvestorAuthController` — sets it on login, clears it on logout, and
  `POST /api/investor/session/refresh` re-issues it for an already-authenticated
  investor. The portal calls that on load, so investors who signed in before
  this shipped are not stuck on the locked page.
- `bootstrap/app.php` — exempts the cookie from Laravel's cookie encryption; the
  CMS is a Node service and cannot undo it.
- `config/cors.php` — allows `https://ap.boston`.

**CMS** (`AccessCMS/backend`)
- `src/middleware/member.ts` — verifies the cookie, sets `req.member`. Never
  throws: a bad or expired cookie just means guest.
- `src/routes/pages.routes.ts` — `applyMemberAccess()` replaces a locked
  section's `data` with only `lockedTitle`/`lockedSubtitle` and sets
  `_locked: true`. **This is the gate.**
- `src/routes/member.routes.ts` — `GET /api/member/session`, which returns only
  whether the visitor is authenticated and their first name.

**Public site** (`AccessCMS/public-frontend`)
- `src/lib/api.js` — sends `credentials: "include"`.
- `src/lib/memberSession.js` — `useMemberSession()` calls `/api/member/session`.
  Presentation only; it fails closed on error.
- `SectionRenderer` — trusts the server's `_locked` flag over the author's
  `access` intent.
- `FundDetailSection` — renders a placeholder skeleton when locked. Once the API
  strips the content there is nothing real left to blur, so without this the
  locked card would render as an empty box.

### Verified

- Laravel suite: 72/72, including `tests/Feature/MemberSessionCookieTest.php`
  (cookie is set on login, cleared on logout, re-issued on refresh, absent when
  unconfigured, and readable as a plain JWT rather than a Laravel-encrypted blob).
- A PHP-minted token verifies in Node; wrong-secret and expired tokens are
  rejected by both.
- Driving the real Express route with a stubbed model: guests, forged cookies
  and expired cookies all receive only `lockedTitle`/`lockedSubtitle`; no fund
  term appears anywhere in the response body.
- Browser render: with a guest response, none of "Mid Teens", "$250,000",
  "Core-Plus" or "Residential Real Estate" appears anywhere in the DOM.

### Protected uploads

Stripping a members-only section hides the image URL from the response, but the
file still sits at a guessable path -- and any URL that was ever public stays
fetchable. Section gating alone is therefore not enough for content that lives
*inside* an image, which on `/aref_i` is most of it.

- `Media.access` (`"PUBLIC" | "MEMBERS"`, default public).
- `src/middleware/protectedUploads.ts` runs in front of `express.static`. A
  members-only file is refused unless the request carries a valid member cookie.
  Guests get **404**, not 401, so the response does not confirm the file exists.
  Access is cached for 60s to avoid a database hit per image on a page.
- Files with no `Media` record are treated as public, so this cannot black out
  existing content that predates the media library.
- A database error returns 503 rather than serving the file: it fails closed.
- `PATCH /api/admin/media/:id/access` flips it; the CMS admin's Media Library
  has a padlock toggle per file.

**S3 is not supported for members-only files.** With `STORAGE_DRIVER=s3` the
browser fetches straight from the bucket and the request never reaches this
API, so the endpoint refuses the change with a 409 rather than implying a
protection it cannot provide. Production runs `STORAGE_DRIVER=local`.

### Gating /aref_i

The live fund page is `aref_i` ("AREF I"), not the `funds` page in `seed.ts` --
that one is only a reference for fresh installs. Its sections:

| # | Section | Holds |
| --- | --- | --- |
| 0 | HERO | Fund name and hero image |
| 1 | IMAGE_BANNER | Fund Overview: net total return since inception, NAV history, manager and principal names |
| 2 | IMAGE_BANNER | Fund Terms & Documents: management fee, withdrawals, distributions |
| 3 | PROPERTY_COLUMNS | The three strategies and their properties |
| 4 | CTA | "Interested in Access Real Estate I?" |
| 5 | DISCLOSURE | Important Disclosures |

Sections 1 and 2 are flat PNGs, so gating them takes **both** steps: mark the
section Members only *and* mark the underlying file members-only in the Media
Library. One without the other leaves the file downloadable by direct URL.

The page editor has a **Members access** panel above the canvas that does both
halves at once: lock or unlock every section, then lock the uploaded files those
sections reference. It walks section data for any `/uploads/...` string rather
than checking a fixed list of fields, so it does not miss the odd shapes
(`mapping[key].image`, `items[].image`). It skips — and warns about — any file a
public section also uses, since locking that would break the public section.
`MEMBER_GATE` is never bulk-locked: it is the way in.

Both images were served publicly before this shipped, so locking them protects
future access only. Re-upload them to get URLs that were never public.

### Local development

Domain cookies need a shared parent, and `localhost` has no dot, so subdomains
of `localhost` cannot carry one. Either leave `MEMBER_JWT_SECRET` unset (the
default — everything renders locked), or add hosts entries and run the stack on
`ap.test`, `api.ap.test`, `investor.ap.test` and `investor-api.ap.test` with
`MEMBER_COOKIE_DOMAIN=.ap.test` and `MEMBER_COOKIE_SECURE=false`.

### Known limits

- A JWT cannot be revoked before it expires. Suspending an investor leaves them
  able to see gated marketing pages for up to `MEMBER_COOKIE_TTL` minutes. The
  dashboard itself is unaffected — that still checks Sanctum on every request.
  Shorten the TTL if that window matters.
- The gate is all-or-nothing: any signed-in investor sees every `MEMBERS`
  section. The cookie carries `accreditation`, so per-tier gating is possible
  later without changing the transport.

## Note on the register URL

`https://investor.ap.boston/assistant-register` is not a route. The portal's
router sends unknown paths to `/admin/dashboard`, so that URL lands investors on
the **admin** login. The real routes are `/` (investor onboarding) and `/login`,
which is what the gate's buttons point at.
