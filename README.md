# Bound Already

A bookshelf of what I've read. Plain HTML, CSS and JavaScript: no build step, no framework. GitHub Pages serves it as is.

```
index.html      the page (all sections live here; the menu switches between them)
css/style.css   all styling, light and dark
js/books.js     the reading list: edit this to add a book
js/app.js       the shelf, archives, lending, forms, about
covers/         one cover image per book, named <id>.jpg
favicon.svg     browser tab icon
.nojekyll       tells GitHub Pages to serve files as they are
```

## Preview it on your computer

Open `index.html` in a browser. Everything works except sending forms, which needs the site to be online or Formspree set up (see below).

## Add a book

1. Save the cover as `covers/<id>.jpg`, where `<id>` is a short lowercase name such as `the-plague`. A portrait image around 330×500 is plenty.
2. In `js/books.js`, copy an entry, change the details and the `id`, and paste your notes into `reflection`.
3. Optional: give it a spine that matches the cover by adding an entry to `SPINES` near the top of `js/app.js` (copy a similar one). Without one it gets a plain coloured spine.

To mark a book as lent out, set `onLoan:true` on it in `js/books.js`; set it back to `false` when it's returned.

## Put it online with GitHub Pages

1. Create a new repository on GitHub, e.g. `boundalready`, and push these files to the `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. After a minute the site is live at `https://<your-username>.github.io/boundalready/`.

## Connect boundalready.com (once you've bought it)

1. At your domain registrar, add these DNS records:
   - `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - a `CNAME` record for `www` pointing to `<your-username>.github.io`
2. In the repository: **Settings → Pages → Custom domain**, enter `boundalready.com` and save. GitHub adds a `CNAME` file to the repository for you.
3. Once the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.

## Email and forms

- **jy@boundalready.com:** GitHub Pages doesn't provide email. Either forward it to your existing inbox for free (for example Cloudflare Email Routing, or the registrar's own forwarding), or use a paid mailbox such as Google Workspace.
- **Borrow requests and recommendations:** until set up, pressing Send opens the visitor's email app with the message filled in to `jy@boundalready.com`. To have forms send directly instead:
  1. Make a free account at formspree.io and create a form that delivers to `jy@boundalready.com`.
  2. Copy the form's id (the part after `/f/` in its endpoint) into `FORMSPREE_ID` at the top of `js/app.js`.
