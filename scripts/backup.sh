#!/usr/bin/env bash

# Nightly off-server backup for AccessCMS.
# Dumps the MongoDB (Atlas) database, archives the local uploads dir, and the
# backend .env, then uploads all three to S3 under a timestamped path.
#
# Reads its config (Mongo URI, S3 bucket, AWS creds/region, upload dir) straight
# from backend/.env, so there is nothing else to configure.
#
#   ./scripts/backup.sh
#
# Requires: mongodump (mongodb-database-tools) and the AWS CLI v2.
# Restore notes are at the bottom of this file.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../backend" && pwd)"
ENV_FILE="$BACKEND_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found" >&2
  exit 1
fi

# Read a single KEY=value from .env without executing the file (handles the
# '=' inside the Mongo URI and strips optional surrounding quotes).
get_env() {
  grep -E "^$1=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- \
    | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//"
}

MONGODB_URI="$(get_env MONGODB_URI)"
S3_BUCKET="$(get_env S3_BUCKET)"
UPLOAD_DIR="$(get_env UPLOAD_DIR)"; UPLOAD_DIR="${UPLOAD_DIR:-uploads}"
S3_PREFIX="${BACKUP_S3_PREFIX:-backups}"

export AWS_DEFAULT_REGION="$(get_env AWS_REGION)"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
# Use .env credentials if present; otherwise fall back to an instance IAM role.
_akid="$(get_env AWS_ACCESS_KEY_ID)";     [[ -n "$_akid" ]] && export AWS_ACCESS_KEY_ID="$_akid"
_asak="$(get_env AWS_SECRET_ACCESS_KEY)"; [[ -n "$_asak" ]] && export AWS_SECRET_ACCESS_KEY="$_asak"

[[ -n "$MONGODB_URI" ]] || { echo "ERROR: MONGODB_URI missing in .env" >&2; exit 1; }
[[ -n "$S3_BUCKET"  ]] || { echo "ERROR: S3_BUCKET missing in .env"  >&2; exit 1; }
command -v mongodump >/dev/null || { echo "ERROR: mongodump not installed" >&2; exit 1; }
command -v aws       >/dev/null || { echo "ERROR: aws CLI not installed"   >&2; exit 1; }

STAMP="$(date -u +%Y%m%d-%H%M%S)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "[$STAMP] 1/4 dumping MongoDB (Atlas) ..."
mongodump --uri="$MONGODB_URI" --gzip --archive="$WORK/db-$STAMP.archive.gz" --quiet

echo "[$STAMP] 2/4 archiving uploads ($UPLOAD_DIR) ..."
tar -czf "$WORK/uploads-$STAMP.tgz" -C "$BACKEND_DIR" "$UPLOAD_DIR"

echo "[$STAMP] 3/4 copying .env ..."
cp "$ENV_FILE" "$WORK/env-$STAMP.env"

echo "[$STAMP] 4/4 uploading to s3://$S3_BUCKET/$S3_PREFIX/ ..."
aws s3 cp "$WORK/db-$STAMP.archive.gz" "s3://$S3_BUCKET/$S3_PREFIX/db/db-$STAMP.archive.gz"
aws s3 cp "$WORK/uploads-$STAMP.tgz"   "s3://$S3_BUCKET/$S3_PREFIX/uploads/uploads-$STAMP.tgz"
aws s3 cp "$WORK/env-$STAMP.env"       "s3://$S3_BUCKET/$S3_PREFIX/env/env-$STAMP.env"

echo "[$STAMP] ✅ backup complete -> s3://$S3_BUCKET/$S3_PREFIX/"

# ---------------------------------------------------------------------------
# RESTORE (manual, when needed):
#   aws s3 cp s3://<bucket>/backups/db/db-<stamp>.archive.gz .
#   mongorestore --uri="<MONGODB_URI>" --gzip --archive=db-<stamp>.archive.gz
#       # add --drop to replace existing collections
#   aws s3 cp s3://<bucket>/backups/uploads/uploads-<stamp>.tgz .
#   tar -xzf uploads-<stamp>.tgz -C backend/   # restores backend/uploads/
# ---------------------------------------------------------------------------
