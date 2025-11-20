# Creating Releases

This document explains how to create and publish releases of ZeroBitOne Dashboard.

## Automated Release (Recommended)

### Using GitHub Actions

1. **Via Git Tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   
   The GitHub Actions workflow will automatically:
   - Build release packages (.tar.gz and .zip)
   - Create a GitHub Release
   - Upload the packages as release assets

2. **Via GitHub UI:**
   - Go to Actions → Create Release
   - Click "Run workflow"
   - Enter version number (e.g., 1.0.0)
   - Click "Run workflow"

## Manual Release

### Using the Release Scripts

**Linux/Mac:**
```bash
# Set version (optional, defaults to 1.0.0)
export VERSION=1.0.0

# Create release packages
./create-release.sh

# Packages will be in releases/ directory
ls -lh releases/
```

**Windows (PowerShell):**
```powershell
# Create release packages
.\create-release.ps1 -Version "1.0.0"

# Packages will be in releases\ directory
dir releases\
```

### Output Files

The scripts create:
- `ZeroBitOneDashboard-v{VERSION}.tar.gz` (for Linux/Mac users)
- `ZeroBitOneDashboard-v{VERSION}.zip` (for Windows users)

## Publishing to GitHub Releases

### Automated (via GitHub Actions)

The workflow automatically creates a GitHub Release when you push a tag.

### Manual

1. Go to your repository on GitHub
2. Click "Releases" → "Draft a new release"
3. Create a new tag (e.g., v1.0.0)
4. Set release title: "ZeroBitOne Dashboard v1.0.0"
5. Copy content from RELEASE_NOTES.md into the description
6. Upload the .tar.gz and .zip files from releases/ directory
7. Click "Publish release"

## What Gets Packaged

Each release package includes:
- Application files (server/, public/)
- Installation scripts (install.sh, install.bat, install.ps1)
- Uninstall scripts (uninstall.sh, uninstall.bat, uninstall.ps1)
- Docker files (Dockerfile, docker-compose.yml)
- Documentation (README.md, INSTALLATION.md, etc.)
- Configuration templates (.env.example)
- Package manifests (package.json)

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.0.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Pre-release Checklist

Before creating a release:

- [ ] Update version in package.json
- [ ] Update RELEASE_NOTES.md with changes
- [ ] Test installation scripts on all platforms
- [ ] Test Docker build and deployment
- [ ] Verify all documentation is up to date
- [ ] Run tests (if any)
- [ ] Check security vulnerabilities (`npm audit`)

## Post-release Tasks

After publishing a release:

- [ ] Test download and installation from GitHub Releases
- [ ] Update any external documentation
- [ ] Announce release (if applicable)
- [ ] Monitor for issues

## Distribution Channels

Users can get releases from:

1. **GitHub Releases** (Primary)
   - Pre-packaged .tar.gz and .zip files
   - Easy download and installation
   
2. **Clone Repository** (Development)
   - Latest code from main branch
   - For contributors and advanced users

3. **Docker Hub** (Optional Future)
   - Could publish container images
   - Even easier deployment

## Troubleshooting

### Release script fails

- Ensure all source files exist
- Check file permissions
- Verify zip/tar commands are available

### GitHub Actions workflow fails

- Check workflow logs in Actions tab
- Verify GITHUB_TOKEN has correct permissions
- Ensure version format is correct (v1.0.0)

### Release packages are too large

- Check .dockerignore and what's being copied
- Ensure node_modules is not included
- Verify only necessary files are packaged

## Support

For questions about the release process:
- Check this document
- Review create-release.sh or create-release.ps1
- See .github/workflows/create-release.yml

---

**Happy Releasing!** 🚀
