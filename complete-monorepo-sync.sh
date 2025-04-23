#!/bin/bash

# =============================================================================
# Complete Monorepo Reverse Sync Script
# =============================================================================
# This script:
# 1. Creates a new branch from the QA branch of standalone webapp
# 2. Applies monorepo structure to the repository
# 3. Ports webapp changes from monorepo, respecting QA changes
# 4. Adds the web-sdk package from monorepo
# =============================================================================

# Color codes for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print formatted messages
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

print_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Source and target directories
MONOREPO_ROOT="/Users/kunalshah/genuin/genuin-webapp"
MONOREPO_WEBAPP="$MONOREPO_ROOT/apps/webapp"
MONOREPO_WEBSDK="$MONOREPO_ROOT/packages/web-sdk"
STANDALONE_WEBAPP="/Users/kunalshah/genuin/genuin-webapp-standalone"
STANDALONE_WEBSDK="/Users/kunalshah/genuin/web-sdk"
QA_BRANCH="qa"
SDK_BRANCH="dev"
NEW_BRANCH=""
TEMP_DIR=$(mktemp -d)

# Parse command line options
DRY_RUN=false
CREATE_BACKUP=false
BACKUP_DIR="/Users/kunalshah/genuin/backups"

# Helper function to show usage
show_usage() {
    echo "Usage: $0 --new-branch <branch-name> [--dry-run] [--backup] [--backup-dir <path>]"
    echo ""
    echo "Options:"
    echo "  --new-branch <branch-name>  Name of the new branch to create from QA branch (required)"
    echo "  --dry-run                   Preview changes without making them"
    echo "  --backup                    Create backups before syncing"
    echo "  --backup-dir <path>         Specify custom backup directory"
    echo ""
    echo "Example:"
    echo "  $0 --new-branch feature/complete-monorepo --backup"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        --new-branch)
            NEW_BRANCH="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if new branch name is provided
if [ -z "$NEW_BRANCH" ]; then
    print_error "New branch name is required with --new-branch option"
    show_usage
    exit 1
fi

if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN mode: No changes will be made"
fi

# Create backup if requested
if [ "$CREATE_BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
    BACKUP_PATH="$BACKUP_DIR/standalone_backup_$TIMESTAMP"

    print_status "Creating backup of standalone webapp at $BACKUP_PATH"
    mkdir -p "$BACKUP_PATH"
    rsync -a "$STANDALONE_WEBAPP/" "$BACKUP_PATH/"

    if [ $? -eq 0 ]; then
        print_status "Backup created successfully"
    else
        print_error "Failed to create backup"
        exit 1
    fi
fi

# PHASE 1: SETUP AND PREPARATION
# ==============================

print_status "Starting complete monorepo reverse sync process..."

# Create lists of all files in monorepo and standalone repo
print_status "Creating file lists for both repositories..."
find "$MONOREPO_WEBAPP" -type f -not -path "*/node_modules/*" -not -path "*/.next/*" \
    -not -path "*/dist/*" -not -path "*/.turbo/*" -not -path "*/.git/*" > "$TEMP_DIR/monorepo_webapp_files.txt"

find "$STANDALONE_WEBAPP" -type f -not -path "*/node_modules/*" -not -path "*/.next/*" \
    -not -path "*/dist/*" -not -path "*/.turbo/*" -not -path "*/.git/*" > "$TEMP_DIR/standalone_files.txt"

find "$MONOREPO_ROOT" -maxdepth 1 -type f \
    -not -name "package-lock.json" \
    -not -name "sync-*.sh" \
    -not -name "reverse-sync.sh" \
    -not -name "convert-to-monorepo.sh" > "$TEMP_DIR/monorepo_root_files.txt"

# Also find important dotfiles that should be included
find "$MONOREPO_ROOT" -maxdepth 1 -name ".*" -type f \
    -not -name ".git*" \
    -not -name ".next*" \
    -not -name ".DS_Store" >> "$TEMP_DIR/monorepo_root_files.txt"

# PHASE 2: CREATE NEW BRANCH FROM QA
# ==================================

if [ "$DRY_RUN" = false ]; then
    print_status "Setting up new branch in standalone repository..."
    cd "$STANDALONE_WEBAPP" || { print_error "Standalone webapp directory not found"; exit 1; }

    # Make sure we're up-to-date with remote
    git fetch origin

    # Check out QA branch
    git checkout "$QA_BRANCH" || { print_error "Failed to checkout $QA_BRANCH branch"; exit 1; }
    git pull origin "$QA_BRANCH" || print_warning "Failed to pull from origin $QA_BRANCH, continuing with local version"

    # Create and switch to new branch
    git checkout -b "$NEW_BRANCH" || { print_error "Failed to create new branch $NEW_BRANCH"; exit 1; }

    print_status "Created new branch '$NEW_BRANCH' based on '$QA_BRANCH'"
else
    print_info "Would create new branch '$NEW_BRANCH' based on '$QA_BRANCH'"
fi

# PHASE 3: IDENTIFY CHANGES AND DELETED FILES
# ==========================================

print_status "Analyzing differences between monorepo and standalone..."

cd "$STANDALONE_WEBAPP" || { print_error "Standalone webapp directory not found"; exit 1; }

# Get list of files changed in last 100 commits in QA branch
git log -n 100 --name-only --pretty=format: | sort | uniq > "$TEMP_DIR/qa_changed_files.txt"

# Check for deleted files in recent commits
print_status "Identifying files deleted in QA branch..."
# Look for files deleted in the last 100 commits
git log -n 100 --diff-filter=D --name-only --pretty=format: | sort | uniq > "$TEMP_DIR/qa_deleted_files.txt"

# Check if the platform-discovery directory exists
PLATFORM_DISCOVERY_PATH="$STANDALONE_WEBAPP/src/app/(site)/(platform-discovery)"
if [ -d "$PLATFORM_DISCOVERY_PATH" ]; then
    PLATFORM_DISCOVERY_EXISTS=true
    print_info "Platform discovery directory exists in QA branch"
else
    PLATFORM_DISCOVERY_EXISTS=false
    print_warning "Platform discovery directory does not exist in QA branch - treating all these files as deleted"
    # Mark all platform-discovery files as intentionally deleted
    grep "src/app/(site)/(platform-discovery)" "$TEMP_DIR/monorepo_webapp_files.txt" 2>/dev/null | while read -r pd_file; do
        rel_path="${pd_file#$MONOREPO_WEBAPP/}"
        echo "$rel_path" >> "$TEMP_DIR/qa_deleted_files.txt"
    done
fi

# Process monorepo webapp files - identify unique files and modifications
print_status "Identifying webapp files unique to monorepo or modified..."
while IFS= read -r monorepo_file; do
    # Get the relative path by removing the monorepo path prefix
    rel_path="${monorepo_file#$MONOREPO_WEBAPP/}"
    standalone_equivalent="$STANDALONE_WEBAPP/$rel_path"

    # Check if this file was deleted in QA branch
    if grep -q "^$rel_path$" "$TEMP_DIR/qa_deleted_files.txt"; then
        print_warning "File exists in monorepo but was deleted in QA branch: $rel_path (respecting deletion)"
        echo "$rel_path" >> "$TEMP_DIR/qa_deleted_files_to_respect.txt"
        continue
    fi

    # Special check for platform-discovery files
    if [[ "$rel_path" == *"(platform-discovery)"* ]] && [ "$PLATFORM_DISCOVERY_EXISTS" = false ]; then
        print_warning "File is part of deleted platform-discovery directory: $rel_path (respecting deletion)"
        echo "$rel_path" >> "$TEMP_DIR/qa_deleted_files_to_respect.txt"
        continue
    fi

    # Check if file doesn't exist in standalone
    if [ ! -f "$standalone_equivalent" ]; then
        echo "$rel_path" >> "$TEMP_DIR/unique_to_monorepo.txt"
        mkdir -p "$(dirname "$TEMP_DIR/files/$rel_path")"
        cp "$monorepo_file" "$TEMP_DIR/files/$rel_path"
        print_info "Unique to monorepo: $rel_path"
    else
        # File exists in both - check if they're different
        if ! cmp -s "$monorepo_file" "$standalone_equivalent"; then
            # Check if this file was recently changed in QA branch
            if grep -q "^$rel_path$" "$TEMP_DIR/qa_changed_files.txt"; then
                # This file was changed in QA branch, we should prioritize QA changes
                print_warning "File modified in both QA branch and monorepo: $rel_path (prioritizing QA version)"
                echo "$rel_path" >> "$TEMP_DIR/qa_priority_files.txt"
            else
                # File was not recently changed in QA branch, we can apply monorepo changes
                echo "$rel_path" >> "$TEMP_DIR/modified_in_monorepo.txt"
                mkdir -p "$(dirname "$TEMP_DIR/changes/$rel_path")"
                # Create a patch file
                diff -u "$standalone_equivalent" "$monorepo_file" > "$TEMP_DIR/changes/$rel_path.patch"
                print_info "Modified in monorepo: $rel_path"
            fi
        fi
    fi
done < "$TEMP_DIR/monorepo_webapp_files.txt"

# PHASE 3.5: IDENTIFY WEB-SDK CHANGES MADE IN MONOREPO
# =================================================
print_status "Analyzing web-sdk changes in monorepo..."

# Create temporary directories for web-sdk changes
mkdir -p "$TEMP_DIR/websdk_changes"
mkdir -p "$TEMP_DIR/websdk_files"

# Get standalone web-sdk files for comparison
if [ -d "$STANDALONE_WEBSDK" ]; then
    # Temporarily switch to web-sdk repository and get latest dev branch
    pushd "$STANDALONE_WEBSDK" > /dev/null || { print_error "Could not access standalone web-sdk repository"; }

    if [ $? -eq 0 ]; then
        # Get the latest dev branch
        git fetch origin
        git checkout "$SDK_BRANCH" || print_warning "Failed to checkout $SDK_BRANCH branch, continuing with current branch"
        git pull origin "$SDK_BRANCH" || print_warning "Failed to pull from origin $SDK_BRANCH, continuing with local version"

        # Get list of files in standalone web-sdk
        find "$STANDALONE_WEBSDK" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" \
            -not -path "*/.git/*" -not -path "*/.turbo/*" > "$TEMP_DIR/standalone_websdk_files.txt"

        # Go back to original directory
        popd > /dev/null
    else
        print_warning "Could not access standalone web-sdk repo, will use monorepo version directly"
    fi
else
    print_warning "Standalone web-sdk repository not found at $STANDALONE_WEBSDK"
fi

# Get list of web-sdk files in monorepo
find "$MONOREPO_WEBSDK" -type f -not -path "*/node_modules/*" -not -path "*/dist/*" \
    -not -path "*/.git/*" -not -path "*/.turbo/*" > "$TEMP_DIR/monorepo_websdk_files.txt"

# Process monorepo web-sdk files to identify unique files and modifications
print_status "Identifying web-sdk files unique to monorepo or modified..."
while IFS= read -r monorepo_sdk_file; do
    # Get the relative path by removing the monorepo path prefix
    rel_path="${monorepo_sdk_file#$MONOREPO_WEBSDK/}"
    standalone_equivalent="$STANDALONE_WEBSDK/$rel_path"

    # Check if file doesn't exist in standalone
    if [ ! -f "$standalone_equivalent" ]; then
        echo "$rel_path" >> "$TEMP_DIR/unique_to_monorepo_sdk.txt"
        mkdir -p "$(dirname "$TEMP_DIR/websdk_files/$rel_path")"
        cp "$monorepo_sdk_file" "$TEMP_DIR/websdk_files/$rel_path"
        print_info "Web-SDK unique to monorepo: $rel_path"
    else
        # File exists in both - check if they're different
        if ! cmp -s "$monorepo_sdk_file" "$standalone_equivalent"; then
            # File is different in monorepo, we should keep these changes
            echo "$rel_path" >> "$TEMP_DIR/modified_in_monorepo_sdk.txt"
            mkdir -p "$(dirname "$TEMP_DIR/websdk_changes/$rel_path")"
            # Create a patch file
            diff -u "$standalone_equivalent" "$monorepo_sdk_file" > "$TEMP_DIR/websdk_changes/$rel_path.patch"
            print_info "Web-SDK modified in monorepo: $rel_path"
        fi
    fi
done < "$TEMP_DIR/monorepo_websdk_files.txt"

# Create a summary report
print_status "Creating summary report..."
touch "$TEMP_DIR/summary.txt"
echo "=== WEBAPP CHANGES ===" >> "$TEMP_DIR/summary.txt"
echo "Files unique to monorepo: $(wc -l < "$TEMP_DIR/unique_to_monorepo.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"
echo "Files modified in monorepo: $(wc -l < "$TEMP_DIR/modified_in_monorepo.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"
echo "Files prioritized from QA branch: $(wc -l < "$TEMP_DIR/qa_priority_files.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"
echo "Files deleted in QA branch (respecting deletion): $(wc -l < "$TEMP_DIR/qa_deleted_files_to_respect.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"
echo "" >> "$TEMP_DIR/summary.txt"
echo "=== WEB-SDK CHANGES ===" >> "$TEMP_DIR/summary.txt"
echo "Web-SDK files unique to monorepo: $(wc -l < "$TEMP_DIR/unique_to_monorepo_sdk.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"
echo "Web-SDK files modified in monorepo: $(wc -l < "$TEMP_DIR/modified_in_monorepo_sdk.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"
echo "" >> "$TEMP_DIR/summary.txt"
echo "=== MONOREPO STRUCTURE ===" >> "$TEMP_DIR/summary.txt"
echo "Root configuration files: $(wc -l < "$TEMP_DIR/monorepo_root_files.txt" 2>/dev/null || echo 0)" >> "$TEMP_DIR/summary.txt"

# PHASE 4: APPLY CHANGES TO THE STANDALONE REPO IF NOT IN DRY RUN MODE
# ===================================================================

if [ "$DRY_RUN" = false ]; then
    print_status "Applying changes to create monorepo structure..."
    cd "$STANDALONE_WEBAPP" || { print_error "Failed to access standalone webapp directory"; exit 1; }

    # Step 1: Create monorepo structure
    print_status "Creating monorepo directory structure..."
    mkdir -p apps/webapp
    mkdir -p packages/web-sdk

    # Step 2: Move all webapp files to apps/webapp/
    print_status "Moving standalone webapp files to apps/webapp..."
    # Use find to list all files and directories in the standalone repo (excluding .git, apps, packages)
    find . -maxdepth 1 -not -path "./apps" -not -path "./packages" -not -path "./.git" -not -path "." | while read -r item; do
        if [ "$item" != "./apps" ] && [ "$item" != "./packages" ] && [ "$item" != "./.git" ] && [ "$item" != "." ]; then
            mv "$item" apps/webapp/ || print_warning "Could not move $item to apps/webapp/"
        fi
    done

    # Step 3: Apply webapp-specific monorepo changes (add new files)
    if [ -f "$TEMP_DIR/unique_to_monorepo.txt" ] && [ -s "$TEMP_DIR/unique_to_monorepo.txt" ]; then
        print_status "Adding new files from monorepo webapp (respecting QA deletions)..."
        while IFS= read -r rel_path; do
            # Double check that this file isn't in the respect deletions list
            if [ -f "$TEMP_DIR/qa_deleted_files_to_respect.txt" ] && grep -q "^$rel_path$" "$TEMP_DIR/qa_deleted_files_to_respect.txt"; then
                print_warning "Skipping file that was deleted in QA: $rel_path"
                continue
            fi

            target_path="apps/webapp/$rel_path"
            target_dir=$(dirname "$target_path")
            mkdir -p "$target_dir"
            cp "$TEMP_DIR/files/$rel_path" "$target_path"
            git add "$target_path"
            print_info "Added new file: $target_path"
        done < "$TEMP_DIR/unique_to_monorepo.txt"
    fi

    # Step 4: Apply webapp-specific monorepo changes (modify existing files)
    if [ -f "$TEMP_DIR/modified_in_monorepo.txt" ] && [ -s "$TEMP_DIR/modified_in_monorepo.txt" ]; then
        print_status "Applying modifications from monorepo (skipping QA-prioritized files)..."
        while IFS= read -r rel_path; do
            # Double check this file isn't in the QA priority list
            if [ -f "$TEMP_DIR/qa_priority_files.txt" ] && grep -q "^$rel_path$" "$TEMP_DIR/qa_priority_files.txt"; then
                print_warning "Skipping monorepo changes for QA-prioritized file: $rel_path"
                continue
            fi

            target_path="apps/webapp/$rel_path"
            if [ -f "$TEMP_DIR/changes/$rel_path.patch" ]; then
                # Try to apply the patch, but don't fail if it doesn't apply cleanly
                patch -p0 "$target_path" < "$TEMP_DIR/changes/$rel_path.patch" || {
                    print_warning "Patch couldn't be applied cleanly to $rel_path - manual merge required"
                    # Copy the monorepo version with a .monorepo extension for manual merging
                    cp "$MONOREPO_WEBAPP/$rel_path" "$target_path.monorepo"
                    print_info "Created $target_path.monorepo for manual merge"
                }
                git add "$target_path"
                print_info "Modified: $target_path"
            fi
        done < "$TEMP_DIR/modified_in_monorepo.txt"
    fi

    # Step 5: Get latest web-sdk from dev branch and apply monorepo-specific changes
    print_status "Preparing web-sdk package with latest changes..."

    # Initialize SDK_AUTHOR_LIST and SDK_COMMIT_INFO in case we can't access the standalone repo
    SDK_AUTHOR_LIST="Unknown (using monorepo version)"
    SDK_COMMIT_INFO="Unknown (using monorepo version)"

    # Temporarily switch to web-sdk repository
    pushd "$STANDALONE_WEBSDK" > /dev/null || {
        print_error "Could not access standalone web-sdk repository at $STANDALONE_WEBSDK"
        print_info "Falling back to using web-sdk from monorepo..."
        rsync -a --exclude=".git" --exclude="node_modules" --exclude="dist" --exclude=".turbo" \
              "$MONOREPO_WEBSDK/" "packages/web-sdk/"
        STANDALONE_WEBSDK_ACCESSIBLE=false
    }

    if [ $? -eq 0 ]; then
        STANDALONE_WEBSDK_ACCESSIBLE=true
        # We're in the web-sdk repo, now get the latest dev branch
        git fetch origin
        git checkout "$SDK_BRANCH" || print_warning "Failed to checkout $SDK_BRANCH branch, continuing with current branch"
        git pull origin "$SDK_BRANCH" || print_warning "Failed to pull from origin $SDK_BRANCH, continuing with local version"

        # Get web-sdk author information
        SDK_AUTHOR_LIST=$(git log -n 20 --format="%an <%ae>" | sort -u | sed 's/^/- /')
        SDK_COMMIT_INFO=$(git log -n 5 --oneline)

        # Go back to standalone webapp repo
        popd > /dev/null

        # Copy web-sdk from standalone repo to packages/web-sdk/
        print_status "Adding web-sdk package from $SDK_BRANCH branch..."
        rsync -a --exclude=".git" --exclude="node_modules" --exclude="dist" --exclude=".turbo" \
              "$STANDALONE_WEBSDK/" "packages/web-sdk/"
    else
        # Fallback to monorepo version if something went wrong
        print_warning "Using web-sdk from monorepo instead of fetching from $SDK_BRANCH branch"
        rsync -a --exclude=".git" --exclude="node_modules" --exclude="dist" --exclude=".turbo" \
              "$MONOREPO_WEBSDK/" "packages/web-sdk/"
        STANDALONE_WEBSDK_ACCESSIBLE=false
    fi

    # Apply monorepo-specific web-sdk changes
    print_status "Applying web-sdk changes made in monorepo..."

    # Add unique files from monorepo web-sdk
    if [ -f "$TEMP_DIR/unique_to_monorepo_sdk.txt" ] && [ -s "$TEMP_DIR/unique_to_monorepo_sdk.txt" ]; then
        print_status "Adding new web-sdk files that are unique to monorepo..."
        while IFS= read -r rel_path; do
            target_path="packages/web-sdk/$rel_path"
            target_dir=$(dirname "$target_path")
            mkdir -p "$target_dir"
            cp "$TEMP_DIR/websdk_files/$rel_path" "$target_path"
            print_info "Added monorepo-specific web-sdk file: $rel_path"
        done < "$TEMP_DIR/unique_to_monorepo_sdk.txt"
    fi

    # Apply modifications from monorepo web-sdk
    if [ -f "$TEMP_DIR/modified_in_monorepo_sdk.txt" ] && [ -s "$TEMP_DIR/modified_in_monorepo_sdk.txt" ]; then
        print_status "Applying web-sdk modifications from monorepo..."
        while IFS= read -r rel_path; do
            target_path="packages/web-sdk/$rel_path"
            if [ -f "$TEMP_DIR/websdk_changes/$rel_path.patch" ]; then
                # Try to apply the patch, but don't fail if it doesn't apply cleanly
                patch -p0 "$target_path" < "$TEMP_DIR/websdk_changes/$rel_path.patch" || {
                    print_warning "Web-SDK patch couldn't be applied cleanly to $rel_path - manual merge required"
                    # Copy the monorepo version with a .monorepo extension for manual merging
                    cp "$MONOREPO_WEBSDK/$rel_path" "$target_path.monorepo"
                    print_info "Created $target_path.monorepo for manual merge"
                }
                print_info "Applied monorepo changes to web-sdk file: $rel_path"
            fi
        done < "$TEMP_DIR/modified_in_monorepo_sdk.txt"
    fi

    # Create README note about web-sdk source
    cat > "packages/web-sdk/README.monorepo.md" << EOF
# Web SDK in Monorepo

This package was incorporated from the standalone web-sdk repository's $SDK_BRANCH branch with monorepo-specific changes applied.

## Source Information
- Base: Standalone web-sdk repository, $SDK_BRANCH branch
- Monorepo-specific changes: $(wc -l < "$TEMP_DIR/modified_in_monorepo_sdk.txt" 2>/dev/null || echo 0) files modified
- Monorepo-specific additions: $(wc -l < "$TEMP_DIR/unique_to_monorepo_sdk.txt" 2>/dev/null || echo 0) files added

## Recent commits from standalone repository:
$(echo "$SDK_COMMIT_INFO")

## Original authors:
$SDK_AUTHOR_LIST

EOF

    # Create a detailed list of web-sdk changes if there are any
    if [ -f "$TEMP_DIR/modified_in_monorepo_sdk.txt" ] && [ -s "$TEMP_DIR/modified_in_monorepo_sdk.txt" ] || [ -f "$TEMP_DIR/unique_to_monorepo_sdk.txt" ] && [ -s "$TEMP_DIR/unique_to_monorepo_sdk.txt" ]; then
        cat > "packages/web-sdk/MONOREPO_CHANGES.md" << EOF
# Monorepo-Specific Changes to Web SDK

This document lists the changes that were made to the web-sdk in the monorepo that were not present in the original standalone repository.

## Modified Files

The following files had monorepo-specific modifications:

$(if [ -f "$TEMP_DIR/modified_in_monorepo_sdk.txt" ] && [ -s "$TEMP_DIR/modified_in_monorepo_sdk.txt" ]; then
    cat "$TEMP_DIR/modified_in_monorepo_sdk.txt" | sed 's/^/- /'
else
    echo "No files were modified in the monorepo."
fi)

## Added Files

The following files were unique to the monorepo version:

$(if [ -f "$TEMP_DIR/unique_to_monorepo_sdk.txt" ] && [ -s "$TEMP_DIR/unique_to_monorepo_sdk.txt" ]; then
    cat "$TEMP_DIR/unique_to_monorepo_sdk.txt" | sed 's/^/- /'
else
    echo "No files were added in the monorepo."
fi)

EOF
        git add "packages/web-sdk/MONOREPO_CHANGES.md"
        print_info "Created MONOREPO_CHANGES.md with details about web-sdk modifications"
    fi

    git add packages/web-sdk
    print_info "Added web-sdk package with monorepo changes"

    # Step 6: Copy monorepo configuration files to root
    print_status "Copying monorepo configuration files to root..."
    while read -r file; do
        base_name=$(basename "$file")
        cp "$file" "./" || print_warning "Could not copy $base_name to root"
        git add "$base_name"
        print_info "Added configuration file: $base_name"
    done < "$TEMP_DIR/monorepo_root_files.txt"

    # Step 7: Create documentation files
    print_status "Creating documentation files..."

    # Create QA priority files documentation
    if [ -f "$TEMP_DIR/qa_priority_files.txt" ] || [ -f "$TEMP_DIR/qa_deleted_files_to_respect.txt" ]; then
        cat > "QA_PRIORITIZED_FILES.md" << EOF
# QA-Prioritized Files and Deletions

## Modified Files

The following files were recently modified in the QA branch and also had changes in the monorepo.
**The QA branch versions were preserved** as per the priority rule.

If you need to incorporate monorepo-specific changes to these files, please do so manually:

$(if [ -f "$TEMP_DIR/qa_priority_files.txt" ] && [ -s "$TEMP_DIR/qa_priority_files.txt" ]; then
    cat "$TEMP_DIR/qa_priority_files.txt" | sed 's/^/- /'
else
    echo "No files were prioritized from QA branch."
fi)

## Deleted Files

The following files were **deleted in the QA branch** but exist in the monorepo.
These deletions were respected and the files were not re-added.

$(if [ -f "$TEMP_DIR/qa_deleted_files_to_respect.txt" ] && [ -s "$TEMP_DIR/qa_deleted_files_to_respect.txt" ]; then
    cat "$TEMP_DIR/qa_deleted_files_to_respect.txt" | sed 's/^/- /'
else
    echo "No files deleted in QA branch needed to be respected."
fi)

EOF
        git add "QA_PRIORITIZED_FILES.md"
        print_info "Created QA_PRIORITIZED_FILES.md with notes about preserved QA changes"
    fi

    # Create monorepo conversion documentation
    cat > "MONOREPO_CONVERSION.md" << EOF
# Monorepo Conversion

This branch represents the conversion of the standalone webapp repository to a monorepo structure.

## Changes Made

1. **Directory Structure**:
   - Moved all webapp files to \`apps/webapp/\`
   - Created monorepo directory structure with \`apps/\` and \`packages/\` folders
   - Added \`packages/web-sdk/\` from the monorepo

2. **Configuration**:
   - Added monorepo-specific configuration files at the root level
   - Added pnpm workspace and Turborepo configuration

3. **QA Branch Integrity**:
   - Preserved all QA branch changes and files
   - Deleted files in QA branch remain deleted
   - Recent changes in QA branch are preserved

## File Changes Summary

$(cat "$TEMP_DIR/summary.txt")

## Next Steps

After reviewing this conversion:

1. Install dependencies with \`pnpm install\`
2. Test the webapp with \`pnpm dev\`
3. Build all packages with \`pnpm build\`

This conversion preserves the Git history of the standalone repository while adding the monorepo structure.
EOF

    git add "MONOREPO_CONVERSION.md"
    print_info "Created MONOREPO_CONVERSION.md with conversion details"

    # Step 8: Collect author information and create commit
    print_status "Collecting author information from recent commits..."
    AUTHOR_LIST=$(git log -n 50 --format="%an <%ae>" | sort -u | sed 's/^/- /')
    COMMIT_INFO=$(git log -n 10 --oneline)

    # Create commit for the monorepo conversion with author attribution
    git commit -m "Convert to complete monorepo structure

This commit converts the repository from a standalone webapp to a complete monorepo structure:
- Moved all webapp files to apps/webapp/
- Added packages/web-sdk/ directory
- Added monorepo configuration files
- Preserved all QA branch changes

Recent contributors whose work is preserved in this conversion:
$AUTHOR_LIST

See MONOREPO_CONVERSION.md for more details."

    print_status "Monorepo conversion completed successfully!"
    print_info "New branch '$NEW_BRANCH' contains the converted monorepo structure"
    print_info "To push these changes: git push origin $NEW_BRANCH"

else
    # Just show what would happen in dry run mode
    print_info "Dry run complete. Here's what would happen:"
    print_info "1. Create monorepo directory structure (apps/ and packages/)"
    print_info "2. Move all standalone webapp files to apps/webapp/"
    print_info "3. Apply webapp-specific changes from monorepo (new files and modifications)"
    print_info "4. Copy web-sdk package from monorepo to packages/web-sdk/"
    print_info "5. Copy monorepo configuration files to root"

    if [ "$PLATFORM_DISCOVERY_EXISTS" = false ]; then
        print_info "6. Remove platform-discovery files that were deleted in QA branch"
    fi

    print_info "7. Create documentation files (QA_PRIORITIZED_FILES.md, MONOREPO_CONVERSION.md)"
    print_info "8. Commit all changes with attribution information"

    # Show detailed file statistics
    cat "$TEMP_DIR/summary.txt"
fi

# Clean up
print_status "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

print_status "Done!"
