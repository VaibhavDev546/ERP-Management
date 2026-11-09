# ERP Management — Super Admin

## Run locally with the Django backend

1. Start the backend from `..\saas_backend` using its setup instructions. By default, the API is at `http://localhost:8000/api/v1`.
2. Copy `.env.example` to `.env.local`. Change `NEXT_PUBLIC_API_URL` if the backend uses another address.
3. Install dependencies and start this frontend:

   ```powershell
   pnpm install
   pnpm dev -- --port 3001
   ```

4. Start the tenant Payroll Flow app from `..\payroll-flow` on port `3000` (see its README).
5. Open `http://localhost:3001` and sign in with a platform administrator created by the backend's `create_platform_admin` command. Use **Open Payroll Flow** in the sidebar to launch the tenant app.

The Super Admin and Payroll Flow apps use separate platform/tenant HTTP-only cookies and CSRF protection while sharing the Django API. Keep all local services on `localhost`; the backend's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` must include ports `3000` and `3001`.
