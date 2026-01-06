#!/bin/bash
# Remove all node_modules folders recursively from the current directory

find . -type d -name "node_modules" -prune -exec rm -rf '{}' +