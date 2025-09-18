# Sigstore Integration Status

## Current Status (v1.0.0)

Sigstore integration is **temporarily disabled** in the v1.0.0 release due to GitHub Actions compatibility issues with deprecated artifact actions.

### What's Working

- ✅ **Template verification framework** - All security infrastructure is in place
- ✅ **Trust policy management** - `peezy trust` commands work
- ✅ **Security audit system** - `peezy audit` provides security reporting
- ✅ **Development fallback** - Templates use development signatures for now

### What's Temporarily Disabled

- ⏸️ **Production Sigstore signing** - Templates are signed with development keys
- ⏸️ **Transparency log integration** - No public transparency log entries
- ⏸️ **Keyless signing** - Using development certificates instead

## Planned for v1.0.1

### Full Sigstore Integration

- 🔄 **Updated Sigstore SDK** - Migrate to latest @sigstore/sign and @sigstore/verify APIs
- 🔄 **GitHub Actions compatibility** - Use latest artifact actions (v4+)
- 🔄 **Production signing** - Real keyless signing with OIDC
- 🔄 **Transparency logs** - All signatures recorded in Rekor

### Timeline

- **Target**: v1.0.1 patch release within 1-2 weeks
- **Priority**: High - Security is a core feature

## Impact on Users

### v1.0.0 Users

- **No impact on functionality** - All templates work perfectly
- **Security framework ready** - Trust policies and audit system available
- **Smooth upgrade path** - v1.0.1 will seamlessly enable full Sigstore

### Enterprise Users

- **Development signatures** are clearly marked
- **Trust policies** can be configured for future enforcement
- **Audit system** provides visibility into security status

## Technical Details

### Why Temporarily Disabled

1. **GitHub Actions deprecation** - `actions/upload-artifact@v3` deprecated
2. **Sigstore action compatibility** - Current action uses deprecated dependencies
3. **API changes** - @sigstore/sign and @sigstore/verify APIs have changed

### Development Fallback

```typescript
// Current implementation falls back to development signing
if (sigstoreError) {
  return this.signTemplateDevelopment(templatePath, outputPath);
}
```

### Security Implications

- **Templates are still verified** - Development signatures prevent tampering
- **Trust policies enforced** - Security framework fully functional
- **Audit system active** - Full visibility into security status

## Communication

### Release Notes

- v1.0.0 clearly documents Sigstore status
- Users informed about v1.0.1 timeline
- No security concerns for current functionality

### User Guidance

```bash
# Current security commands work
peezy audit                    # ✅ Works
peezy trust list              # ✅ Works
peezy verify-template template # ✅ Works (dev signatures)

# Full Sigstore in v1.0.1
peezy verify-template template # 🔄 Will use production Sigstore
```

---

**Bottom Line**: v1.0.0 ships with complete security framework and development signatures. v1.0.1 will enable full production Sigstore integration without any breaking changes.
