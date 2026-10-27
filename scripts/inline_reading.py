#!/usr/bin/env python3
"""Apply and audit curated inline reading links without rewriting poem text.

Run from any directory:
  python scripts/inline_reading.py apply
  python scripts/inline_reading.py check --baseline 39a3d35
  python scripts/inline_reading.py archive --output-dir ../library/of-another-shore/inline

The HTML contains ordinary anchors; this script is not loaded by the site.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
# Text, Wikipedia article, expected occurrences (normally one per work).
LINKS = {
    'adobar.html': [('adobo', 'Philippine_adobo', 1), ('shōyu', 'Soy_sauce', 1), ('kombu', 'Kombu', 1), ('Palayok', 'Palayok', 1), ('Asian Financial Crisis', '1997_Asian_financial_crisis', 1)],
    'afterwemisrememberthegrains.html': [('harlequin', 'Harlequin', 1)],
    'argence.html': [('tiyanak', 'Tiyanak', 1), ('scoria', 'Scoria', 1), ('siyokoy', 'Siyokoy', 1), ('LLM', 'Large_language_model', 1), ('cyanobacteria', 'Cyanobacteria', 1), ('tidally locked', 'Tidal_locking', 1), ('wooly mammoth', 'Woolly_mammoth', 1)],
    'blueprint.html': [('Hubert Vos', 'Hubert_Vos', 1), ('caldera', 'Caldera', 1)],
    'dungan.html': [('人魂', 'Hitodama', 1), ('Xジェンダー', 'X-gender', 1)],
    'ediacaranhotline.html': [('ediacaran', 'Ediacaran', 1)],
    'escarpmentpinks.html': [('narras', 'Pterocarpus_indicus', 1)],
    'index.html': [('Encarta', 'Encarta', 1), ('Ordovician', 'Ordovician', 1), ('Andromeda', 'Andromeda_Galaxy', 1)],
    'inmanchuria.html': [('loess', 'Loess', 1), ('jurchens', 'Jurchen_people', 1), ('siberian high', 'Siberian_High', 1), ('Cy Coleman', 'Cy_Coleman', 1), ('Art Tatum', 'Art_Tatum', 1)],
    'iwantedtothinkabouttimeiwanted.html': [('Cleopatra', 'Cleopatra', 1), ('Great Pyramid', 'Great_Pyramid_of_Giza', 1), ('brown tree snake', 'Brown_tree_snake', 1), ('1997 Asian Financial Crisis', '1997_Asian_financial_crisis', 1), ('CRISPR', 'CRISPR', 1), ('DC over AC', 'War_of_the_currents', 1), ('Great Oxygenation Event', 'Great_Oxidation_Event', 1), ('神奈川条約 Kanagawa Jōyaku', 'Treaty_of_Kanagawa', 1), ('Toba Supervolcano eruption', 'Toba_catastrophe_theory', 1), ('Chicxulub', 'Chicxulub_crater', 1), ('Wrangel Island', 'Wrangel_Island', 1), ("Wright brothers' first flight", 'Wright_brothers', 1)],
    'memorypalace.html': [('Piranesi', 'Giovanni_Battista_Piranesi', 1), ('nautiloid', 'Nautiloid', 1), ('山椒', 'Zanthoxylum_piperitum', 1)],
    'moonmilk.html': [('Lethe', 'Lethe', 7)],
    'nightbus.html': [('the pacific ocean', 'Pacific_Ocean', 1)],
    'quoineconomics.html': [('currency', 'Currency', 1)],
    'sanddollarexchange.html': [('sand dollar', 'Sand_dollar', 1), ('pogs', 'Pogs', 1)],
    'sandstoneschistandesite.html': [('Zhangjiajie', 'Wulingyuan', 1), ('quartz sandstone', 'Sandstone', 1), ('Manhattan schist', 'Manhattan_schist', 1), ('Andesite', 'Andesite', 1), ('Ring of Fire', 'Ring_of_Fire', 1)],
}

def url(slug):
    return 'https://en.wikipedia.org/wiki/' + quote(slug, safe="_()'")

class Page(HTMLParser):
    def __init__(self, source, filename):
        super().__init__(convert_charrefs=False)
        self.lines = [0]
        for line in source.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(line))
        self.filename = filename
        self.body = False
        self.hidden = 0
        self.anchors = []
        self.headings = 0
        self.text = []
        self.links = []
        self.breaks = 0
        self.edits = []
        self.counts = Counter()
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'br': self.breaks += 1
        if tag == 'body': self.body = True
        if tag in ('script', 'style'): self.hidden += 1
        if tag in ('h1', 'h2', 'h3'): self.headings += 1
        if tag == 'a':
            assert not self.anchors, f'{self.filename}: nested anchors'
            self.anchors.append(attrs)
            self.links.append((attrs.get('href'), attrs.get('class', '')))

    def handle_endtag(self, tag):
        if tag == 'body': self.body = False
        if tag in ('script', 'style'): self.hidden -= 1
        if tag in ('h1', 'h2', 'h3'): self.headings -= 1
        if tag == 'a' and self.anchors: self.anchors.pop()

    def handle_data(self, data):
        if not self.body or self.hidden: return
        self.text.append(data)
        if self.anchors: return
        if self.headings and self.filename not in ('blueprint.html', 'ediacaranhotline.html'): return
        line, column = self.getpos()
        start = self.lines[line - 1] + column
        for needle, slug, expected in LINKS.get(self.filename, []):
            for match in re.finditer(re.escape(needle), data):
                if self.counts[needle] >= expected: break
                self.counts[needle] += 1
                title = 'Wikipedia: ' + slug.replace('_', ' ')
                anchor = f'<a class="reference-link" href="{escape(url(slug), quote=True)}" title="{escape(title, quote=True)}">{needle}</a>'
                self.edits.append((start + match.start(), start + match.end(), anchor))

    def handle_entityref(self, name):
        if self.body and not self.hidden: self.text.append('&' + name + ';')

    def handle_charref(self, name):
        if self.body and not self.hidden: self.text.append('&#' + name + ';')

def apply():
    for filename in LINKS:
        path = ROOT / filename
        source = path.read_text(encoding='utf-8')
        page = Page(source, filename)
        if any('reference-link' in classes.split() for _, classes in page.links):
            print(f'{filename}: already linked (run check to audit)')
            continue
        for start, end, anchor in sorted(page.edits, reverse=True):
            source = source[:start] + anchor + source[end:]
        source = source.replace('</head>', '<link rel="stylesheet" href="inline-reading.css">\n</head>', 1)
        path.write_text(source, encoding='utf-8')
        print(f'{filename}: {len(page.edits)} links')

def check(baseline):
    total = 0
    for filename, entries in LINKS.items():
        source = (ROOT / filename).read_text(encoding='utf-8')
        page = Page(source, filename)
        actual = Counter(href for href, classes in page.links if 'reference-link' in classes.split())
        expected = Counter({url(slug): count for _, slug, count in entries})
        assert actual == expected, f'{filename}: link counts differ: {actual - expected}; missing {expected - actual}'
        assert 'href="inline-reading.css"' in source, filename
        if baseline:
            old = subprocess.check_output(['git', 'show', f'{baseline}:{filename}'], cwd=ROOT).decode('utf-8')
            previous = Page(old, filename)
            assert ' '.join(''.join(page.text).split()) == ' '.join(''.join(previous.text).split()), f'{filename}: body text changed'
            assert page.breaks == previous.breaks, f'{filename}: line breaks changed'
            previous_links = Counter(previous.links)
            # Repair the pre-existing misspelling while retaining its internal route.
            if filename == 'blueprint.html':
                previous_links[('inmanchuria.html', '')] += previous_links.pop(('inmachuria.html', ''), 0)
            assert not previous_links - Counter(page.links), f'{filename}: existing links changed'
        total += sum(actual.values())
        print(f'{filename}: {sum(actual.values())} links; text and previous links preserved')
    print(f'{total} inline links across {len(LINKS)} pages')

def archive(output):
    output.mkdir(parents=True, exist_ok=True)
    def save(slug):
        path = output / (slug + '.html')
        if path.exists(): return slug + ': already retained'
        try:
            request = Request(url(slug), headers={'User-Agent': 'OfAnotherShore-reading-archive/1.0'})
            with urlopen(request, timeout=20) as response: data = response.read()
            assert b'<html' in data.lower(), 'response is not HTML'
            assert b'Wikipedia' in data, 'response is not a Wikipedia page'
            path.write_bytes(data)
            return f'{slug}: retained {len(data)} bytes'
        except Exception as error:
            return f'{slug}: NOT RETAINED: {error}'
    slugs = sorted({slug for entries in LINKS.values() for _, slug, _ in entries})
    with ThreadPoolExecutor(max_workers=4) as workers:
        results = list(workers.map(save, slugs))
    for result in results: print(result)
    if any('NOT RETAINED' in result for result in results):
        raise SystemExit(1)

def main():
    if sys.platform == 'win32': sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('action', choices=('apply', 'check', 'archive'))
    parser.add_argument('--baseline', help='Git revision for poem-text and prior-link comparison')
    parser.add_argument('--output-dir', type=Path, help='Directory for downloaded article HTML')
    args = parser.parse_args()
    if args.action == 'apply': apply()
    elif args.action == 'check': check(args.baseline)
    elif args.output_dir: archive(args.output_dir.resolve())
    else: parser.error('archive requires --output-dir')

if __name__ == '__main__': main()
