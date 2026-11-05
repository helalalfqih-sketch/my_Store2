#!/usr/bin/env python3
"""Assert visible Android text or return coordinates for an accessible native control."""
import argparse
import re
import sys
import xml.etree.ElementTree as ET

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--expect")
    group.add_argument("--tap")
    group.add_argument("--expect-product", action="store_true")
    args = parser.parse_args()
    root = ET.parse(args.file).getroot()
    nodes = [n.attrib for n in root.iter("node")]
    if args.expect_product:
        products = [node for node in nodes if node.get("clickable") == "true"
                    and node.get("content-desc", "").startswith("عرض ")
                    and node.get("content-desc") != "عرض الكل"]
        if not products:
            print("No Shopify product cards visible on the Android screen", file=sys.stderr)
            raise SystemExit(1)
        print("Visible Shopify product cards:", len(products))
        return
    if args.expect:
        if not any(args.expect in (n.get("text", "") + " " + n.get("content-desc", "")) for n in nodes):
            print("Missing text: " + args.expect, file=sys.stderr)
            raise SystemExit(1)
        print("UI text verified: " + args.expect)
        return
    candidates = [n for n in nodes if n.get("clickable") == "true"
                  and (n.get("content-desc") == args.tap or n.get("text") == args.tap)]
    if not candidates:
        print("Missing clickable target: " + args.tap, file=sys.stderr)
        raise SystemExit(2)
    m = re.fullmatch(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", candidates[0].get("bounds", ""))
    if not m:
        raise SystemExit("Invalid target bounds")
    x1, y1, x2, y2 = map(int, m.groups())
    if x2 <= x1 or y2 <= y1:
        raise SystemExit("Invalid target geometry")
    print((x1 + x2) // 2, (y1 + y2) // 2)

if __name__ == "__main__":
    main()
