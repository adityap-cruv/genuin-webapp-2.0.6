#!/usr/bin/env bash
# This script scans for React.FC components and provides suggestions for migration
# It also offers an interactive mode to help migrate specific components

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== React.FC Migration Helper =====${NC}"
echo "This script will help migrate React.FC components to function declarations"
echo "for better compatibility with React 19."
echo ""

# Function to find all React.FC components
find_fc_components() {
  echo -e "${YELLOW}Searching for React.FC components...${NC}"

  # Find all React.FC occurrences in .tsx files
  grep -r "React\.FC" --include="*.tsx" . | sort

  echo ""
  echo -e "${GREEN}Finished scanning for React.FC components.${NC}"
  echo ""
}

# Function to provide migration instructions
print_migration_guide() {
  echo -e "${BLUE}Migration Guide:${NC}"
  echo "To update React.FC components, replace patterns like:"
  echo ""
  echo -e "${RED}const MyComponent: React.FC<MyProps> = ({ prop1, prop2 }) => {${NC}"
  echo "  // component code"
  echo -e "${RED}}${NC}"
  echo ""
  echo "with:"
  echo ""
  echo -e "${GREEN}function MyComponent({ prop1, prop2 }: MyProps) {${NC}"
  echo "  // component code"
  echo -e "${GREEN}}${NC}"
  echo ""
  echo "This removes React.FC and follows the React team's recommended approach for React 19."
  echo ""
}

# Function to attempt automatic migration of a single file
attempt_migration() {
  local file="$1"
  echo -e "${BLUE}Attempting to migrate:${NC} $file"

  # Create a backup
  cp "$file" "${file}.bak"

  # Attempt to migrate React.FC components
  sed -i.tmp -E 's/const ([A-Za-z0-9_]+): React\.FC<([A-Za-z0-9_]+)> = \(\{([^}]*)\}\) => \{/function \1({\3}: \2) {/g' "$file"
  sed -i.tmp -E 's/const ([A-Za-z0-9_]+): React\.FC = \(\) => \{/function \1() {/g' "$file"
  sed -i.tmp -E 's/const ([A-Za-z0-9_]+): React\.FC = \(\{([^}]*)\}\) => \{/function \1({\2}) {/g' "$file"

  # Remove the temp file
  rm -f "${file}.tmp"

  echo -e "${GREEN}Migration attempt completed.${NC}"
  echo "Please review the changes and test thoroughly."
  echo "If the migration was not successful, you can restore from ${file}.bak"
}

# Function to update useRef null initialization
update_useref() {
  local file="$1"
  echo -e "${BLUE}Attempting to update useRef in:${NC} $file"

  # Create a backup
  cp "$file" "${file}.bak"

  # Update useRef without initialization to include null
  sed -i.tmp -E 's/const ([A-Za-z0-9_]+): any = useRef\(\)/const \1 = useRef<HTMLDivElement>(null)/g' "$file"
  sed -i.tmp -E 's/const ([A-Za-z0-9_]+): any = useRef$/const \1 = useRef<HTMLDivElement>(null)/g' "$file"
  sed -i.tmp -E 's/const ([A-Za-z0-9_]+) = useRef\(\)/const \1 = useRef<HTMLDivElement>(null)/g' "$file"

  # Remove the temp file
  rm -f "${file}.tmp"

  echo -e "${GREEN}useRef update attempt completed.${NC}"
  echo "Please review the changes and test thoroughly."
  echo "If the update was not successful, you can restore from ${file}.bak"
}

# Interactive mode function
interactive_mode() {
  echo -e "${CYAN}===== Interactive Migration Mode =====${NC}"
  echo "This will help you migrate a specific component file."
  echo ""
  read -p "Enter the path to the component file to migrate: " file_path

  if [ ! -f "$file_path" ]; then
    echo -e "${RED}Error: File not found.${NC}"
    return 1
  fi

  echo ""
  echo -e "${YELLOW}Choose migration type:${NC}"
  echo "1. Migrate React.FC to function declaration"
  echo "2. Update useRef initializations"
  echo "3. Both"
  echo "4. Cancel"
  echo ""
  read -p "Enter your choice (1-4): " choice

  case "$choice" in
    1)
      attempt_migration "$file_path"
      ;;
    2)
      update_useref "$file_path"
      ;;
    3)
      attempt_migration "$file_path"
      update_useref "$file_path"
      ;;
    4)
      echo "Operation cancelled."
      ;;
    *)
      echo -e "${RED}Invalid choice.${NC}"
      ;;
  esac
}

# Main execution
if [ "$1" == "--interactive" ] || [ "$1" == "-i" ]; then
  interactive_mode
else
  find_fc_components
  print_migration_guide

  echo -e "${BLUE}===== React.FC Migration Process =====${NC}"
  echo "1. Start with the most important components first (e.g., providers, layouts)"
  echo "2. Update each component and test thoroughly"
  echo "3. Pay special attention to components using children or forwardRef"
  echo "4. Consider adding eslint rules to prevent new React.FC usage"
  echo ""
  echo -e "${YELLOW}Note: This is a manual process that requires careful attention${NC}"
  echo "to ensure type correctness and component behavior."
  echo ""
  echo -e "${CYAN}For interactive migration mode, run:${NC}"
  echo "./scripts/react-fc-migration.sh --interactive"
fi
