# Deployment

## Frontend

Deploy `frontend/` as a Vite app on Vercel or Netlify.

- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables:
  - `VITE_API_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_VAPI_PUBLIC_KEY`
  - `VITE_VAPI_ASSISTANT_ID`

## Backend on Vercel

Deploy the repo root as the backend project. The root `vercel.json` rewrites all requests to `api/index.py`, which exposes the FastAPI app.

- Project root: repo root
- Runtime: Vercel Python serverless
- Required demo environment variable:
  - `MOCK_MODE=true`

Example:

```powershell
npx vercel --prod --yes --token $env:VERCEL_TOKEN --env MOCK_MODE=true
```

After deploy, test:

```powershell
curl https://YOUR-BACKEND.vercel.app/health
```

## Backend on Render/Railway

Deploy the repo root as a Python web service on Render or Railway.

- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Required environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`
  - `AWS_REGION`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `BEDROCK_MODEL_ID`
  - `S3_BUCKET_NAME`
  - `VAPI_API_KEY`

After the backend is live, set `VITE_API_URL` in the frontend host to the backend URL.
