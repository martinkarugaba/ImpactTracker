# Excel Export Troubleshooting Guide

## Common Production Issues and Solutions

### Issue 1: XLSX Library Not Loading

**Symptoms:** "XLSX library failed to load properly" error **Solutions:**

1. Check that `xlsx` is installed: `pnpm install xlsx`
2. Ensure Next.js webpack config allows client-side libraries
3. Verify dynamic import is working in production build

### Issue 2: Download Not Working in Production

**Symptoms:** No download starts, silent failure **Solutions:**

1. Check browser console for security errors
2. Verify HTTPS is being used (some browsers block downloads on HTTP)
3. Check Content Security Policy headers
4. Test with different browsers (Safari, Chrome, Firefox)

### Issue 3: File Corruption or Invalid Format

**Symptoms:** Downloaded file won't open in Excel **Solutions:**

1. Verify ArrayBuffer is being created correctly
2. Check MIME type is correct
3. Ensure no server-side processing is interfering

### Issue 4: CORS or CSP Errors

**Symptoms:** Browser blocks blob URL creation **Solutions:**

1. Update CSP headers to allow blob: URLs
2. Check for strict security policies
3. Consider server-side export as fallback

## Debug Steps

1. Use the debug button in development to check environment
2. Check browser developer tools for errors
3. Test export with small dataset first
4. Compare CSV export (simpler) vs Excel export
5. Test in different browsers and devices

## Production Deployment Checklist

- [ ] XLSX library is in dependencies (not devDependencies)
- [ ] Next.js webpack config includes client-side fallbacks
- [ ] CSP headers allow blob: URLs
- [ ] HTTPS is enabled
- [ ] Test export functionality in production environment
- [ ] Monitor error logs for export failures

## Alternative Solutions

If Excel export continues to fail in production:

1. **Server-side export**: Move Excel generation to API route
2. **CSV fallback**: Always offer CSV as backup option
3. **External service**: Use dedicated file generation service
4. **Progressive enhancement**: Detect capabilities before showing Excel option

## Monitoring

Add logging to track:

- Export success/failure rates
- Browser types where failures occur
- Error messages and stack traces
- File sizes that cause issues
