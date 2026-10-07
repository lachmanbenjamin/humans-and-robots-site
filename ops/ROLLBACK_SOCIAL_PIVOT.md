# Rollback: Social Pivot (2026-10-07)

On 2026-10-07 humansnrobots.com was repositioned from local-service "Get found. Follow up faster. Book more work."
to social-first "Social media that does real business work." for mission-driven businesses and organizations,
with a fixed-fee Social Audit ($1,250) as the entry offer.

## Archive of the previous site
- Tag: `pre-social-pivot-2026-10-07` (points at commit 6278e2e)
- Branch: `archive/pre-social-pivot-2026-10-07`
- Browse: https://github.com/lachmanbenjamin/humans-and-robots-site/tree/pre-social-pivot-2026-10-07

## Flip back (requires Ben's approval)
Non-destructive (recommended; keeps history):
```bash
cd humans-and-robots-site
git checkout master && git pull
git revert --no-edit b49017d
git push origin master
```
Whole-site restore to the archive state (also non-destructive):
```bash
git checkout master && git pull
git checkout pre-social-pivot-2026-10-07 -- . && git commit -m "Restore pre-social-pivot site" && git push origin master
```
GitHub Pages redeploys in about 1 minute. Note: the whole-site restore also reverts any unrelated later commits' files.

## Flip forward again
`git revert <the-revert-commit-sha>` and push.
