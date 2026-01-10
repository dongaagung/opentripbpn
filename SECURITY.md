# Security Guidelines - OpenTripBPN

## Environment Variables

### Safe for Public Exposure
These keys are **designed for client-side use** and are safe to expose:
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon/public key)
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`

### NEVER Expose
These keys must **NEVER** be committed to version control:
- `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- `SUPABASE_SECRET_KEY`
- Any API keys from third-party services

## Database Security

### Row Level Security (RLS)
All database tables have RLS enabled with the following policies:

#### Public Access (Read-only)
- Trip packages (active only)
- Gallery (published only)
- Testimonials (published only)
- FAQs (published only)
- Hero stats (active only)
- Trip leaders (active only)
- Comparison items (published only)

#### Authenticated Users
- Can view/update their own profile
- Can submit contact messages
- Can view their own role

#### Admin Only
- Manage all content (create, update, delete)
- Access pricing history (audit log)
- Manage user roles

## Best Practices

1. **Never commit** `.env` files to Git
2. **Always set** environment variables in Vercel Dashboard
3. **Enable RLS** on all new database tables
4. **Test policies** before deploying to production
5. **Rotate keys** if SERVICE_ROLE_KEY is ever exposed

## Vercel Deployment

Environment variables are configured in Vercel Dashboard:
- Project Settings → Environment Variables
- Set for Production, Preview, and Development environments

## Emergency Response

If sensitive keys are exposed:
1. Immediately rotate the compromised keys in Supabase Dashboard
2. Update environment variables in Vercel
3. If needed, remove sensitive data from Git history using `git filter-branch`
4. Notify team members if working in a team environment

## Verification

To verify RLS is working:
```sql
-- Test as anonymous user (should succeed)
SELECT * FROM trip_packages WHERE is_active = true;

-- Test as anonymous user (should fail)
UPDATE trip_packages SET price = 0 WHERE id = 'some-id';
```

Last updated: 2026-01-10
