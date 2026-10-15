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

After changing anything in `css/` or `js/`, bump the `?v=` date on those links in `index.html` so visitors' browsers load the new version. If you don't see a change right after pushing, do a hard refresh (Ctrl/Cmd + Shift + R).

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

Borrow requests and recommendations go to `jy@boundalready.com`, which forwards to Gmail:

```
visitor presses Send  →  Formspree  →  jy@boundalready.com  →  Cloudflare Email Routing  →  Gmail
```

Until Formspree is set up, pressing Send opens the visitor's own email app with the message filled in, addressed to `jy@boundalready.com`.

### 1. Forward jy@boundalready.com to Gmail (Cloudflare, free)

1. In Cloudflare, open the boundalready.com domain → **Email → Email Routing** → **Get started**.
2. Create the address `jy@boundalready.com`, with your Gmail address as the destination.
3. Cloudflare emails your Gmail a confirmation link; click it.
4. Let Cloudflare add the email DNS records it offers (MX and TXT). They sit alongside the GitHub Pages records without conflict.
5. Test it: send an email from another account to `jy@boundalready.com` and check it arrives in Gmail.

### 2. Make the forms send directly (Formspree, free up to 50 messages a month)

1. Sign up at formspree.io and create a new form. Set it to deliver to `jy@boundalready.com`, and confirm that address when Formspree emails it (the confirmation arrives in Gmail via step 1).
2. The form's endpoint looks like `https://formspree.io/f/abcdwxyz`. Copy the id at the end (`abcdwxyz`) into `FORMSPREE_ID` near the top of `js/app.js`, then commit and push.
3. In the Formspree form's settings, add `boundalready.com` as an allowed domain so only your site can use it.
4. Send yourself a test recommendation from the live site.

Borrow requests where the visitor leaves an email address as their contact arrive with that address as reply-to, so you can answer straight from Gmail.

Optional: to reply *as* `jy@boundalready.com` rather than your Gmail address, add it in Gmail under **Settings → Accounts → Send mail as**. That needs an outgoing mail (SMTP) service, since Cloudflare only handles incoming mail.
