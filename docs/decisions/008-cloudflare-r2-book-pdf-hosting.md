# ADR 008: External Object Storage for Book PDF Hosting

## Status
Accepted

## Context
The reader originally loaded PDFs only from local server storage (`/books/<filename>`). That works for local development but has drawbacks for deployed environments:

- PDFs must be copied to and persisted on the API host
- static asset serving and API hosting are coupled
- scaling and distribution of large files is less efficient than object storage + CDN delivery

We also want to keep existing local-book workflows working during transition.

## Decision
Adopt provider-agnostic URL handling in the client reader while preserving local fallback behavior.

- `Book.pdfFilename` can now contain either:
  - a full `http(s)` URL to a hosted PDF, or
  - a relative filename/key
- when `VITE_PDF_BASE_URL` is set, relative keys resolve to:
  - `<VITE_PDF_BASE_URL>/<encoded key>`
- when `VITE_PDF_BASE_URL` is not set, relative keys resolve to:
  - `/books/<encoded key>` (existing local behavior)
- for non-Supabase storage hosts, CSP must allow the hosted PDF origin via `CSP_EXTRA_CONNECT_SRC`

## Consequences
- hosted PDFs can be served from Supabase Storage, Cloudflare R2, S3, or similar object storage without backend upload/storage changes
- existing local `/books` paths remain compatible
- deployment requires explicit environment configuration:
  - `client/.env`: `VITE_PDF_BASE_URL`
  - `server/.env`: `CSP_EXTRA_CONNECT_SRC` for non-Supabase storage origins
- incorrect/missing URL values now surface as reader-level PDF load issues instead of server file-not-found responses
