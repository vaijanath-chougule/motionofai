# ⚠️ CLOUDFLARE CACHE PURGE REQUIRED — Minar

## Issue
The optimized Minar video (53.42 MB) has been uploaded to R2, but the Cloudflare CDN is still serving the old cached version (92.78 MB).

## Evidence
- **R2 shows:** 53.42 MB (uploaded 2026-09-30 20:12:12 GMT+5:30)
- **CDN serves:** 92.78 MB (`Content-Length: 92784798`)

## Solution: Purge Cloudflare Cache

### Steps

1. **Go to your Cloudflare dashboard**
2. **Navigate to:** Caching → Configuration → Purge Cache
3. **Select:** "Purge by URL"
4. **Enter this exact URL:**
   ```
   https://assets.wenilo.com/ai-video-production/desktop/product-add-2/minar%20final%202k.mp4
   ```
5. **Click "Purge"**

### Verify After Purging

```bash
curl -I https://assets.wenilo.com/ai-video-production/desktop/product-add-2/minar%20final%202k.mp4
```

The `Content-Length` should show **53417545** (53.42 MB) instead of **92784798** (92.78 MB).

---

## Current Status

✅ Minar video optimized (42.4% reduction, CRF 18, moov at front)  
✅ Minar uploaded to R2 (53.42 MB confirmed)  
✅ Code updated — `reel-07` (Minar) at slot 2 of the cinematic reel  
⏳ **Cache purge needed** ← YOU ARE HERE  
⏳ Website will serve optimized Minar after purge

Once the cache is purged, the Minar card on the AI Video Production page will automatically load the 53.42 MB version with progressive streaming enabled.