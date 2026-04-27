# Research AI

Research AI is a Next.js AI product strategy workspace for competitive research, opportunity discovery, comparison, history, export, and Agent configuration.

## Public Entry

After deployment, share the production URL from Vercel. The public flow is:

```txt
/ -> /splash -> /search -> /result?q=...
```

Core routes:

- `/search` - start a new analysis
- `/result?q=...` - view an AI analysis
- `/history` - local browser research archive
- `/compare` - compare saved analyses
- `/export` - export reports
- `/settings` - configure Agent preferences

## Local Development

```bash
npm install
npm run dev -- -p 3002
```

Open [http://localhost:3002](http://localhost:3002).

## Required Environment Variables

For a public deployment with real OpenAI analysis and daily quota protection:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4-mini
OPENAI_ENABLE_WEB_SEARCH=false
OPENAI_DAILY_QUOTA=20
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Notes:

- `OPENAI_API_KEY` must be configured only in Vercel environment variables, never in client code.
- `OPENAI_DAILY_QUOTA` limits public real analysis requests per day.
- Upstash Redis stores the daily quota counter across Vercel serverless instances.
- Keep `OPENAI_ENABLE_WEB_SEARCH=false` for the first public version to reduce cost and rate-limit risk.

## Deploy To Vercel

1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default Next.js settings:
   - Install Command: `npm install`
   - Build Command: `npm run build`
4. Add the environment variables above in Vercel Project Settings.
5. Redeploy and open the Vercel production URL.

## Verification

Before deployment:

```bash
npm run lint
npm run build
```

After deployment:

- Open `/` and confirm it enters `/splash`, then `/search`.
- Run a real analysis from `/search`.
- Confirm `/history`, `/compare`, `/export`, and `/settings` are accessible.
- If the daily quota is exceeded, the result page should fall back to example data instead of breaking.
