#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Add CONST object to dist/ui.js"""
import sys

# Force UTF-8 output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

filepath = r"C:\Users\micha\source\repos\UI\dist\ui.js"

# Read file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find insertion point
marker = "const SIZE_TOGGLE_CHECKBOX = 16;"

# New code to insert
const_object = """

// ═══════════════════════════════════════════════════════════════
//   CONST OBJECT (for module compatibility)
// ═══════════════════════════════════════════════════════════════
// Group all constants into CONST object for code that uses "CONST.X"

const CONST = {
    HEIGHT_BUTTON,
    HEIGHT_SLIDER,
    HEIGHT_TOGGLE,
    HEIGHT_SECTION,
    HEIGHT_TEXT_LINE,
    SPACING_ITEM,
    SPACING_PADDING,
    HEIGHT_HEADER,
    SIZE_BUTTON,
    SPACING_BUTTON,
    WIDTH_SCROLLBAR,
    MIN_THUMB_HEIGHT,
    HEIGHT_SLIDER_TRACK,
    RADIUS_SLIDER_THUMB,
    SIZE_TOGGLE_CHECKBOX
};"""

# Replace
if marker in content:
    content = content.replace(marker, marker + const_object)
    print("OK: CONST object added")
else:
    print("ERROR: Marker not found")
    sys.exit(1)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("OK: File updated")
