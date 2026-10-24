---
description: Validate and deploy rohitraj.tech through its AWS Amplify main branch
---

# Production deployment

Use the current clean checkout of `rohitguta2432/rohitraj-tech`, Node 22 and the lockfile. Preserve unrelated work. Review the intended diff, run types, scoped lint, relevant tests and `npm run build` before committing explicit paths.

Production configuration (verified 24 October 2026): AWS Amplify app `d222exnwyksjmg`, branch `main`, region `ap-south-1`, AWS CLI profile `mine`, automatic build enabled. Recheck before use:

```bash
aws amplify get-branch --app-id d222exnwyksjmg --branch-name main --region ap-south-1 --profile mine
```

An authorized ordinary push to `origin/main` triggers deployment. Fetch/reconcile upstream first; never force push or stage unrelated files. There is no separate Vercel step.

Find the Amplify job whose commit ID matches the pushed commit. Verify BUILD, DEPLOY and VERIFY are successful. Check https://rohitraj.tech and changed bare paths for the actual new content, status 200, one H1, self-canonical, indexable body, correct links and sitemap entries. Historical locale URLs redirect; do not create new translated copies.

A successful build or indexing submission does not confirm Google indexing. Use URL Inspection and the existing monitoring workflow, avoiding repeated unchanged requests.
