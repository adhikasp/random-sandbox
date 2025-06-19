# CI Troubleshooting Guide

## Common Package Issues in Ubuntu CI

### ❌ Error: Package 'libasound2' has no installation candidate

**Problem**: Package names changed in Ubuntu 24.04
**Solution**: ✅ Fixed - Updated to use `libasound2t64`

### Package Name Changes in Ubuntu 24.04

| Old Package | New Package | Status |
|-------------|-------------|---------|
| `libasound2` | `libasound2t64` | ✅ Fixed |

### Debugging Package Issues

1. **Check available packages**:
   ```bash
   apt-cache search libasound
   apt-cache show libasound2t64
   ```

2. **Find virtual packages**:
   ```bash
   apt-cache showpkg libasound2
   ```

3. **Check Ubuntu version**:
   ```bash
   lsb_release -a
   cat /etc/os-release
   ```

### Common CI Fixes

#### If package not found:
```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    # Try new package names first, fallback to old ones
    sudo apt-get install -y libasound2t64 || sudo apt-get install -y libasound2
```

#### Alternative approach - use Playwright's built-in dependencies:
```yaml
- name: Install Playwright with dependencies
  run: npx playwright install --with-deps chromium
```

### Current Working Configuration

The CI is now configured for Ubuntu 24.04 with:
- ✅ `libasound2t64` (new package name)
- ✅ All other packages remain the same
- ✅ Works on both local and CI environments

### Testing Package Installation Locally

```bash
# Test the setup script
./scripts/setup-tests.sh

# Or manually test packages
sudo apt-get update
sudo apt-get install -y libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2t64
```

### Emergency Fallback

If packages still fail, add this to CI:
```yaml
- name: Install system dependencies (fallback)
  run: |
    sudo apt-get update
    npx playwright install-deps chromium || true
  continue-on-error: true
```