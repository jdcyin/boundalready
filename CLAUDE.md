# Bound Already

Jason's personal reading site: a shelf of the books he has read, his short reflections on each, a lending library for his paper copies, and a form for recommendations. Static HTML/CSS/JS, no build step, hosted on GitHub Pages.

- Repo: `jdcyin/boundalready` (public; branch `main`, Pages serves the repo root)
- Live: https://jasonyin.com/boundalready/ (his GitHub account's custom domain is jasonyin.com)
- Planned: own domain `boundalready.com`, bought on Cloudflare; email `jy@boundalready.com` forwarded to Gmail via Cloudflare Email Routing; forms via Formspree. Steps are in `README.md`. No `CNAME` file until the domain exists.

## Files

```
index.html      all pages live here as <main class="page"> sections; hash routing (#home #archive #borrow #recommend; #about opens an overlay)
css/style.css   all styles; light and dark tokens at the top
js/books.js     BOOKS: the reading list (the only file to touch when adding a book, plus its cover)
js/app.js       everything else: settings, spines, shelf, archives, pop-out, lending, forms, About, router
covers/<id>.jpg one portrait cover per book (about 330x500 or larger)
favicon.svg, .nojekyll, README.md (owner's how-to: add a book, deploy, domain, email)
```

## Data (js/books.js)

Each book: `id, title, titleEn?, author, last, year, month, day, country[], genre, lang, readIn[], format, onLoan, pages, color, cover, reflection`.

- `title` is the title in the original language when the book was read in a non-English language or is originally Chinese (e.g. `兄弟`); `titleEn` is then the English title. Display is always via `fullTitle(b)`, giving `兄弟 (Brothers)`. Never render `b.title` directly.
- `readIn` lists the languages he read it in (Jason is expanding into other languages; this is shown in the pop-out as "Read in …" and as the LANGUAGE grouping in Archives). Use "Chinese" (not "Mandarin") so the grouping stays consistent.
- `year:null` means the date is unknown: sorts last, grouped under "Undated".
- `reflection` is Jason's own words, kept verbatim (including his phrasing). Blank line = new paragraph; a paragraph starting with a quotation mark renders as a blockquote.
- `onLoan:true` marks a lent-out book (visitors see "On loan"). There is no owner login on the static site.
- `pages` sets spine thickness; `genre` and `lang` are kept but not displayed.

## Pages and behaviour

- **Shelf (home):** big centred BOUND ALREADY title, then one line of books that drifts slowly left forever (wheel/drag/arrow keys move it; no pause on hover). Every book appears exactly once; the row is duplicated once only to make the loop seamless, and if the books are too few to be wider than the screen plus a turned book, the spare space is spread evenly between them. A random `FACE_OUT_SHARE` (30%) of books face out showing covers; about half the rest lean left or right.
  - Click 1: the book stands up straight, turns to show its cover (red "Open" ribbon), glides to the centre, and its title/author appear below. It reshelves 5 s (`RESHELVE_MS`) after that first click, and the shelf resumes drifting.
  - Click 2: opens the pop-out and reshelves the book immediately.
  - Loop maths: `x` is kept within one period (`applyPos`), period is re-measured every frame (turned books widen it), and centring takes the shortest way round the loop. Don't reintroduce `x % period` on an unbounded `x`; that caused jumps.
- **Spines:** hand-designed per edition in `SPINES` (js/app.js) to match each cover's colours and lettering (fonts: Anton, Bebas Neue, Jost, Pinyon Script, Yellowtail, EB Garamond, Playfair Display, Josefin Sans, Archivo Black, Noto Serif TC). Parts stack top to bottom; `lines` sit side by side; `up:1` = upright CJK; `logo` = publisher oval. A book without a spec gets a random plain style.
- **Archives:** heading + "Archive of what I've read. Filter by category." and an ALL · COUNTRY · LANGUAGE · YEAR · AUTHOR toggle. Cover tiles; no counts. ALL is newest first.
- **Book pop-out:** cover, title, "Read in …", the reflection (ends with a small red square), and the Borrow box. No other metadata.
- **Lend:** "Lending library" heading, three steps (Click a book. Click Borrow. / I'll get in touch and hand or post you my copy. / Write me a note in it, return it when done, and tell me what you thought.), then a grid of paper copies.
- **Recommend:** RECOMMEND heading, "Tell me a book worth reading, and why.", fields Title, Author, "Why did you enjoy it?", Your name ("This will be anonymised.").
- **About:** an overlay, not a page. On the shelf, the books rush left first; elsewhere it opens in place. The book is a 3D "house edition" in the site's own style: solid ink cover (theme tokens, so it inverts in dark mode) with BOUND / ALREADY in the display serif, a fine inset rule and the red square; a spine on its left side and page edges on its right (`.ab-obj`, thickness `--t`). It arrives turned to show the spine (`show`), swings to face you (`face`), rests, then opens (`open`). Left page: "CHINESE IDIOM" + "Ten thousand bound books; ten thousand journeys abound." centred, contact shown as JY@BOUNDALREADY.COM (CSS uppercase; Copy copies the lowercase address) at the foot; right page 讀萬卷書 / 行萬里路 vertical, read top to bottom, right to left, no punctuation.
- **Forms:** `sendMessage()` posts to Formspree when `FORMSPREE_ID` is set, otherwise opens a `mailto:` to `CONTACT_EMAIL`. Borrow requests set `_replyto` when the contact is an email.

## Design

Jason wants it clean and editorial (Monocle / The Economist), simple, and never "AI-looking". Keep copy minimal; he removes descriptions he doesn't need.

- Light theme by default (eggshell `--paper:#F6F3EC`), dark via the toggle (remembered in localStorage). All colours are tokens in `:root` and both dark blocks.
- Type: Cormorant Garamond (display, uppercase titles), Source Serif 4 (body, titles), Archivo (small uppercase labels), with Noto Serif TC as the CJK fallback.
- One accent, red `--accent:#B0201B`. Hairline rules, square buttons, no rounded cards.
- The Chinese font is loaded with `text=`: only the listed characters exist. **When a new book or text adds Chinese characters, add them (URL-encoded) to the Noto Serif TC link in index.html** and to the comment above it.
- Works at phone width (390 px): menu on its own row, title on one line, About book scaled.

## Working on it

- Windows machine; the folder lives in Google Drive, which re-saves files (you may see "file changed on disk" and LF/CRLF warnings; both are harmless). Check `git diff` before committing.
- Preview: open `index.html` directly, or render with headless Edge (`msedge --headless=new --screenshot`). Edge won't go below ~500 px wide, so test phone width by loading the page in a 390 px `<iframe>` inside a small harness page. Keep preview/test files in a scratch folder, not the repo.
- After changes: `node --check js/app.js`, bump the `?v=` version tag on the css/js links in `index.html` (use the date; add a suffix like `-2` for a second change that day) so browsers don't keep stale copies, commit with a descriptive message, push to `main`. Pages redeploys in about a minute; GitHub's cache can still hold `index.html` itself for up to 10 minutes, so tell Jason a hard refresh (Ctrl/Cmd + Shift + R) shows it immediately.
- Covers: prefer the exact edition Jason links. Amazon images work by ISBN-10 (`images-na.ssl-images-amazon.com/images/P/<ISBN10>.01.LZZZZZZZ.jpg`), Open Library by ISBN. If only a photo exists (e.g. a box set), recreate the flat cover as an HTML page and screenshot it at 330x500 @2x.
