#!/usr/bin/env python3
import urllib.request
import re
import json
import os
import sys

def fetch_scholar_data(scholar_id="ovT7Ao4AAAAJ"):
    url = f"https://scholar.google.com/citations?user={scholar_id}&hl=en&pagesize=100"
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching Google Scholar profile: {e}", file=sys.stderr)
        return None

    # 1. Parse citation indices
    # Google Scholar layout: <td class="gsc_rsb_std">value</td>
    # The order is:
    # 0: Citations (All)
    # 1: Citations (Since 2019/2021)
    # 2: h-index (All)
    # 3: h-index (Since 2019/2021)
    # 4: i10-index (All)
    # 5: i10-index (Since 2019/2021)
    stats_found = re.findall(r'<td class="gsc_rsb_std">(\d+)</td>', html)

    citations = 196  # fallback default
    h_index = 8
    i10_index = 7

    if len(stats_found) >= 6:
        citations = int(stats_found[0])
        h_index = int(stats_found[2])
        i10_index = int(stats_found[4])
        print(f"Scraped stats -> Citations: {citations}, h-index: {h_index}, i10-index: {i10_index}")
    else:
        print("Could not find all stats in expected format, using parsed values or defaults.", file=sys.stderr)
        if len(stats_found) >= 1:
            citations = int(stats_found[0])
        if len(stats_found) >= 3:
            h_index = int(stats_found[2])
        if len(stats_found) >= 5:
            i10_index = int(stats_found[4])

    # 2. Parse publications
    publications = []
    rows = re.findall(r'<tr class="gsc_a_tr">.*?</tr>', html, re.DOTALL)
    print(f"Found {len(rows)} publication rows.")

    for row in rows:
        # Title & link
        title_match = re.search(r'class="gsc_a_at"[^>]*>(.*?)</a>', row)
        title = title_match.group(1) if title_match else "No Title"
        # Clean HTML tags inside title if any
        title = re.sub(r'<[^>]+>', '', title)

        href_match = re.search(r'href="([^"]*)"', title_match.group(0) if title_match else "")
        link = ""
        if href_match:
            link = "https://scholar.google.com" + href_match.group(1).replace("&amp;", "&")

        # Authors & journal (div class="gs_gray")
        divs = re.findall(r'<div class="gs_gray">(.*?)</div>', row)
        authors = divs[0] if len(divs) > 0 else "No Authors"
        authors = re.sub(r'<[^>]+>', '', authors)  # clean tags

        journal = divs[1] if len(divs) > 1 else "No Journal/Source"
        # Journal/Source might contain extra spans, clean them
        journal = re.sub(r'<[^>]+>', ' ', journal)
        journal = ' '.join(journal.split())

        # Citations
        cit_match = re.search(r'class="gsc_a_ac[^"]*"[^>]*>(.*?)</a>', row)
        cit_count_str = cit_match.group(1).strip() if cit_match else "0"
        if not cit_count_str or cit_count_str == "&nbsp;":
            cit_count = 0
        else:
            try:
                cit_count = int(cit_count_str)
            except ValueError:
                cit_count = 0

        # Year
        year_match = re.search(r'class="gsc_a_h[^"]*"[^>]*>(.*?)</span>', row)
        year_str = year_match.group(1).strip() if year_match else "N/A"
        try:
            year = int(year_str) if year_str != "N/A" and year_str else None
        except ValueError:
            year = None

        # Determine open access and fallback pdf download option
        # Try to guess DOI or specific PDF link if open access
        # For Google Scholar, we don't have direct pdf links easily, but we can set up standard ones or search.
        is_oa = False
        # If the journal has words like "Springer", "Elsevier", "King Saud", it could have open access
        if "King Saud" in journal or "gll.urk" in journal or "Larhyss" in journal:
            is_oa = True

        publications.append({
            "title": title,
            "authors": authors,
            "journal": journal,
            "citations": cit_count,
            "year": year if year else year_str,
            "link": link,
            "is_oa": is_oa
        })

    data = {
        "stats": {
            "citations": citations,
            "h_index": h_index,
            "i10_index": i10_index,
            "works_count": len(publications)
        },
        "publications": publications
    }

    return data

def main():
    print("Fetching Google Scholar data...")
    data = fetch_scholar_data()
    if data is None:
        print("Failed to scrape. Generating fallback fallback data structure.")
        # Create a basic fallback data structure using default stats
        data = {
            "stats": {
                "citations": 196,
                "h_index": 8,
                "i10_index": 7,
                "works_count": 12
            },
            "publications": []
        }

    # Ensure assets/data/ directory exists
    os.makedirs("assets/data", exist_ok=True)
    filepath = "assets/data/scholar_stats.json"

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved stats and {len(data['publications'])} publications to {filepath}")

if __name__ == "__main__":
    main()
