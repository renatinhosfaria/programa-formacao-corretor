#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# Deploy script for programa-formacao-corretor
# Tasks:
#  1. (Optional) Install dependencies if tsc missing or node_modules absent
#  2. Build project (TypeScript + Vite)
#  3. Backup current production directory
#  4. Rsync new dist to production target (atomic-ish via temp dir)
#  5. Adjust ownership/permissions
#  6. (Optional) Purge CDN cache placeholder
# Env overrides:
#   DEPLOY_TARGET   -> production root (default /var/www/famanegociosimobiliarios.com.br)
#   BACKUP_DIR      -> directory to store backups (default <target>-backups)
#   SKIP_INSTALL=1  -> skip npm install step
#   SKIP_BUILD=1    -> skip build (use existing dist)
#   OWNER           -> chown user:group (default www-data:www-data)
#   RSYNC_DELETE=0  -> disable --delete (default enabled)
#   PURGE_URLS      -> space separated URLs to purge (placeholder logic)
#   NO_BACKUP=1     -> skip backup
# =============================================================

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_TARGET="${DEPLOY_TARGET:-/var/www/famanegociosimobiliarios.com.br}"
BACKUP_DIR="${BACKUP_DIR:-${DEPLOY_TARGET}-backups}"
OWNER="${OWNER:-www-data:www-data}"
TIMESTAMP="$(date +%F-%H%M%S)"
DIST_DIR="$PROJECT_ROOT/dist"
RSYNC_DELETE_FLAG="--delete"
[[ "${RSYNC_DELETE:-1}" == "0" ]] && RSYNC_DELETE_FLAG=""

log(){ printf "\033[1;34m[DEPLOY]\033[0m %s\n" "$*"; }
warn(){ printf "\033[1;33m[WARN]\033[0m %s\n" "$*"; }
err(){ printf "\033[1;31m[ERR ]\033[0m %s\n" "$*" >&2; }

require_cmd(){ command -v "$1" >/dev/null 2>&1 || { err "Missing required command: $1"; exit 1; }; }

log "Starting deploy at $TIMESTAMP"
require_cmd rsync
require_cmd tar
require_cmd npm

# 1. Install dependencies if needed
if [[ "${SKIP_INSTALL:-0}" != "1" ]]; then
  if [[ ! -d "$PROJECT_ROOT/node_modules" || ! -x "$PROJECT_ROOT/node_modules/.bin/tsc" ]]; then
    log "Installing dependencies (peer conflicts ignored via --legacy-peer-deps)"
    npm install --legacy-peer-deps --no-audit --no-fund
  else
    log "Dependencies present, skipping install"
  fi
else
  log "SKIP_INSTALL=1 -> skipping dependency installation"
fi

# 2. Build
if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  log "Building project (npm run build)"
  npm run build
else
  log "SKIP_BUILD=1 -> skipping build"
fi

if [[ ! -d "$DIST_DIR" ]]; then
  err "dist directory not found after build. Aborting."
  exit 1
fi

# 3. Backup current production directory
if [[ "${NO_BACKUP:-0}" != "1" ]]; then
  if [[ -d "$DEPLOY_TARGET" ]]; then
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-${TIMESTAMP}.tar.gz"
    log "Creating backup: $BACKUP_FILE"
    tar -C "$DEPLOY_TARGET" -czf "$BACKUP_FILE" . || { err "Backup failed"; exit 1; }
  else
    warn "Deploy target $DEPLOY_TARGET does not exist yet; skipping backup"
  fi
else
  log "NO_BACKUP=1 -> skipping backup"
fi

# 4. Rsync to target (via temp to reduce partial exposure)
mkdir -p "$DEPLOY_TARGET"
TEMP_STAGE="${DEPLOY_TARGET%/}.stage-${TIMESTAMP}"
log "Staging to $TEMP_STAGE"
mkdir -p "$TEMP_STAGE"
rsync -av $RSYNC_DELETE_FLAG --chmod=F644,D755 "$DIST_DIR"/ "$TEMP_STAGE"/

log "Rotating staged directory into place"
PREVIOUS_LINK="${DEPLOY_TARGET%/}.previous"
if [[ -d "$DEPLOY_TARGET" ]]; then
  mv "$DEPLOY_TARGET" "$PREVIOUS_LINK" 2>/dev/null || true
fi
mv "$TEMP_STAGE" "$DEPLOY_TARGET"
rm -rf "$PREVIOUS_LINK" || true

# 5. Ownership & permissions
log "Setting ownership to $OWNER"
chown -R "$OWNER" "$DEPLOY_TARGET" || warn "Could not chown (need privileges?)"

# 6. Optional CDN purge placeholder
if [[ -n "${PURGE_URLS:-}" ]]; then
  log "Purging CDN (placeholder). URLs: $PURGE_URLS"
  # Example: for Cloudflare you could integrate curl API calls here.
fi

# 7. Summary
log "Deploy complete. Summary:"
log "  Target: $DEPLOY_TARGET"
log "  Backup dir: $BACKUP_DIR"
log "  Dist files: $(find "$DIST_DIR" -maxdepth 1 -type f | wc -l) top-level files"
log "  Main bundle: $(basename "$(ls -1 "$DIST_DIR"/assets/index-*.js 2>/dev/null | head -n1 || echo 'n/a')")"

log "Test (no-cache): curl -I -H 'Cache-Control: no-cache' https://www.famanegociosimobiliarios.com.br/quero-ser-um-corretor"
log "You can override threshold in code via <HeroSection threshold={0.7} /> if needed."

exit 0
