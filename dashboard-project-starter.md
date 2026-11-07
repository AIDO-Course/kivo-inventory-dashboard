# Lesson 3 Dashboard Project: Brief and Build Prompts (reusable)

> **For Claude Code:** This file is the brief for a NEW dashboard project. Read all of it before you do anything.
> This file lives in `E:\AIDO OCT 2026\Workspace\`. Every project it creates goes in its own subfolder there:
> `E:\AIDO OCT 2026\Workspace\<project-name>\`.
> Every time this file is used, you start a **brand-new project from zero**. Begin with **Prompt 0 (Project intake)**:
> ask the user the intake questions and wait for the answers. Don't assume which dashboard to build.
> Then work **only on the stage the user asks for** (Prompt 1, 2, 3...). Never jump ahead.
> In particular, **do not write any dashboard code until SPEC.md and Practice.md are committed**.
> The grader checks the git history for this order.

---

## Part A: The assignment

### Task 1: Build one dashboard with mock data

**Requirements:**
- Choose **one** dashboard:
  - 4.1 Customer service (customer tickets)
  - 4.2 Smart lead management
  - 4.3 HR (employee onboarding)
  - 4.4 Inventory and logistics

  (The user picks one in Prompt 0. Each run of this file builds one new project.)
- Use **mock data** only, with no real backend.
- Build it **from the spec**, like the bakery dashboard in class. The dashboard must match the spec exactly.

**In this file:** Prompt 1 (write the spec), Prompt 4 (build v1 from the spec), and Prompt 5 (pass/fail self-check against the spec).

### Task 2: What to submit

**Requirements:**
1. **SPEC.md:** the project spec, created with Claude. It must exist before any code: who it's for, what it is and isn't, where it runs, features ranked Must/Should/Later, design rules, data, and checkable "done means" lines.
2. **Practice.md:** the project's working rules, including saving and updating on GitHub. That means commit and push for every finished feature, one request per commit, a README kept up to date, the spec kept in sync, and an Issue for any bug found along the way.
3. **A link to the GitHub repo.** In Prompt 0, Claude asks you whether the repo should be **public** or **private**. If you choose private, Claude asks for the teacher's GitHub username and adds them as a collaborator in Prompt 2.
4. **Bonus:** connect the repo to GitHub Pages.

**In this file:**

| Requirement | Prompt |
|---|---|
| Choose dashboard + project name | Prompt 0 (Claude asks you) |
| SPEC.md | Prompt 1, and Prompt 2 commits it first |
| Practice.md | Prompt 3, which also adds CLAUDE.md |
| Your prepared skills (e.g. ui-ux-design) | Prompt 3b copies them from Workspace into .claude/skills/ |
| Repo link (public, or private + teacher added) | Prompt 0 asks whether you have a repo URL or want Claude to create one, and public or private; Prompt 2 connects or creates it and adds the teacher if private |
| Bonus: GitHub Pages | Prompt 6 |

Run the prompts in order, and Task 2's submission files come out of the same work as Task 1.

### What the teacher grades (from the teacher's message)
- **The spec is written first and the dashboard is built from it.** A spec written after the build doesn't count. *"Written before, it is a spec. Written after the code, the same sentences are an excuse."*
- **The dashboard matches the spec 100%.** If the spec says "no red", there is no red anywhere. Every colour, size, feature and "not" item is checked.
- **The spec reads like a client brief that had real thought put into it.** It is portfolio material.

---

## Part B: The method from Lesson 3 (rules Claude must follow)

| Source | Rule |
|---|---|
| Lecture, *How to Develop with Claude Code* | The spec answers 5 questions: **Who** (roles, and who is *not* a user), **What it is / is not**, **Where** it runs, **Features** (Must / Should / Later, each written as a user sentence), and **Done means** (checkable lines that become the tests). The lecture says 1–3 pages; the teacher's own bakery spec is longer and very detailed, so detail wins. It lives in the repo next to the code. |
| Same lecture | Every request goes through the same 4 steps: **Review** (does it fit the spec?) → **Build** → **Test** → **Commit** (one request, one commit, with a "why" that references the spec). |
| Same lecture | A bug outside the request goes into a **GitHub Issue** (title, steps, expected, actual). Never fix it silently. Close it with "Fixes #N". |
| Same lecture | When Claude does the wrong thing, **fix Practice.md, not the chat.** |
| Lecture 03 (Git/GitHub) | Start with `git status`. Make small, frequent commits whose messages say why. Never commit secrets: `.env` goes in `.gitignore`. Git is the undo button (revert). |
| Cheatsheet | Setup checklist: Git, a repo on GitHub, `.gitignore` with `.env`, SPEC.md, Practice.md, **CLAUDE.md containing `@Practice.md`**, tests. |
| Teacher's live session | His order: logo + SPEC.md → *"print every gh CLI command you use"* → create the GitHub repo and save → Practice.md (commit and push every approved feature; create and keep updating the README) → build v1 for GitHub Pages → *"commit and push automatically"* → make the repo public and enable Pages → a change request (with a new practice rule: **update SPEC.md to match**) → show the last commit id → **revert**. |
| Example repo (`MaceTenth/bakery-sales-dashboard`) | Files: `spec.md`, `practice.md`, `README.md`, `.gitignore`, `index.html`, `style.css`, `app.js`, `assets/`. Plain HTML/CSS/JS, no build step. The spec has a palette with hex values and contrast ratios, sizes in px, an ASCII layout, metric formulas, a sample JSON payload, UI states, accessibility rules, and an acceptance checklist. The README has features, "Not built yet", the live link, how to run locally, and a table of files. |

---

## Part C: The prompts (send one at a time, and check each result before the next)

**Before you start:**
- Git and the GitHub CLI are installed, and you have run `gh auth login`.
- Optional: have a logo image for the fictional client ready (you can give its path in Prompt 0).

---

### Prompt 0: Project intake (start a new project from zero)

```
Read dashboard-project-starter.md fully. We are at Prompt 0: start a NEW project from zero.
Do not create any files yet. First ask me these questions (use your question tool if you have one,
otherwise list them) and WAIT for my answers:

1. Which dashboard do you want to build?
   4.1 Customer service (customer tickets)
   4.2 Smart lead management
   4.3 HR (employee onboarding)
   4.4 Inventory and logistics
2. What is the project name? (it is used for the folder and the GitHub repo, e.g. "inventory-logistics-dashboard")
3. Who is the fictional client? (company name and type of business, in one sentence)
4. Do you have a logo? If yes, give me its file path.
5. GitHub repo: do you already have a repo, or should I create one?
   - I have one: give me its URL (it should be empty; if it already has commits, I will show them and ask you before doing anything).
   - Create it: I will create it with the GitHub CLI (gh), named after the project.
6. Should the GitHub repo be PUBLIC or PRIVATE? (For an existing repo, I will check its current visibility and ask before changing it.)
   - Public: the teacher can open the link directly (recommended; also needed for free GitHub Pages).
   - Private: give me the teacher's GitHub username, and I will add them as a collaborator.

After I answer:
- Create a new, empty folder for the project inside the Workspace folder:
  E:\AIDO OCT 2026\Workspace\<project-name>\   (the same folder as this file).
  Work ONLY inside that project folder from now on. Never put project files directly in Workspace.
  If a folder with that name already exists and is not empty, stop and ask me.
- Copy this brief into it (so it is versioned with the project), and copy the logo to assets/ if I gave one.
- Check that the prepared skills exist in E:\AIDO OCT 2026\Workspace (subfolders with a SKILL.md, e.g. ui-ux-design\SKILL.md). They are copied into the project in Prompt 3b. If none exist, tell me.
- Do NOT create any code. Then summarise my answers in 6 lines and wait for me to send Prompt 1.
```

---

### Prompt 1: Write SPEC.md (no code)

```
We are at Prompt 1. Use the answers from Prompt 0 (dashboard type, project name, client, logo).
Do NOT write any code, HTML, CSS or JS. Your only output is a file named SPEC.md in the project folder.

PROJECT
- Client (fictional): <from Prompt 0>.
- Product: the <dashboard type from Prompt 0> dashboard, with MOCK DATA only, no backend.
- Logo: assets/<logo file> (if provided). Derive the palette from it; otherwise propose a palette and ask me.
- For the roles, features, metrics and data model, use the matching column of the
  "Suggestions per dashboard type" table below as a STARTING POINT. Adapt it to the client and ask me
  before including anything that is unclear.

WRITE SPEC.md AS A REAL CLIENT SPEC, WITH EXACTLY THESE SECTIONS. Make it complete and specific, at the
level of detail of the teacher's bakery example: exact hex values, px sizes, formulas and checkable
criteria. Read that example first: https://github.com/MaceTenth/bakery-sales-dashboard/blob/main/spec.md
(e.g. gh api repos/MaceTenth/bakery-sales-dashboard/contents/spec.md -H "Accept: application/vnd.github.raw").
Use it for structure and depth only; never copy its content. Don't pad it, and don't cut detail to save space.

# <Project name>: <Dashboard type> Dashboard
A two-sentence summary, plus the 3 questions the dashboard answers at a glance
(e.g. "What is about to run out?", "Which shipments are late?", "How much stock value do we hold?").

## 0. Design principles
A table of 4–6 principles, each with "what it means in practice" (e.g. Desktop-first; Glanceable:
one hero number, then tiles, then detail; Big touch targets; Brand-led; Colour is never the only signal).

## 1. Who
- Each user is a ROLE with context (where they are, which device, how long they look).
  (See "Suggestions per dashboard type" for typical roles.)
- One sentence per role: what they NEED to do.
- "Not users:" (who never sees this screen).

## 2. What it is / What it is not
- IT IS: one paragraph, max 4 sentences.
- IT IS NOT: an explicit list (always include: no login or user accounts, no real database or API,
  no editing of real data, no sending emails/SMS, no dark mode in v1, plus the type-specific items
  from the suggestions table). This list is where scope creep dies, so make it thorough.

## 3. Where
- Static single-page web app, hosted on GitHub Pages. Plain, modern web standards only:
  HTML5 + modern CSS + modern vanilla JavaScript (ES2022+ modules). NO frameworks
  (no React, Angular, Vue, Svelte, jQuery), NO CSS frameworks (no Bootstrap/Tailwind), no build step.
  The look must still be top quality: a polished, professional, modern design.
- State explicitly: desktop-first or mobile-first, which devices, and the breakpoints
  (e.g. <600px phone, 600–1023 tablet, ≥1024 desktop). No horizontal scroll from 320px to 1440px.
- A "Responsive behaviour" table: for each breakpoint, the layout (columns, KPI tiles per row, where
  navigation goes, which panels sit side by side), max content width, and what happens to long text
  (e.g. truncate with an ellipsis). Nothing is hidden on small screens unless the spec says so.

## 4. Features
Must / Should / Later. Write EVERY feature as: "As <role>, I can <action> so that <reason>."
Start from the Must/Should/Later suggestions for the chosen type (table below).

## 5. Design rules
- Brand assets / logo: file names (assets/logo.*), where it appears (header, favicon), its exact size
  in px, which background it sits on, clear space around it, and the don'ts (no recolouring, stretching,
  rotating, shadows, or shrinking below a minimum size). If there is no logo, define a simple wordmark.
- Palette: named tokens + HEX (from the logo + one complementary accent), each with its role.
  Give a table of WCAG 2.1 AA contrast ratios for every text/background pair used.
- Explicit colour rules, including at least one forbidden colour/use
  (e.g. "Red is used ONLY for out-of-stock / delayed status, never for decoration").
  Colour is never the only signal: status always shows a word and/or an icon too.
- Typography: font families, sizes in px (KPI value, titles, body, min caption size).
- Sizes: minimum touch target (e.g. 48×48px), button heights, icon sizes; icons always have a text label.
- Shape: card radius, borders, spacing scale, page padding per breakpoint.
- An ASCII drawing of the main screen layout (header, KPI row, chart, tables, alerts).

## 6. Components
For each component (header, KPI tiles, filters, main data table, alerts list, chart(s), navigation,
buttons): what it shows, its sizes and colours (token names), and how it behaves (tap/click, hover,
selected state, what opens).
- Charts: which series use which colour token (series must differ by hue, not only lightness),
  tooltip on tap/click (not only hover), max number of gridlines, axis label size.
- Buttons: a table of button types (Primary, Secondary, Tertiary/ghost, Danger) with height, fill,
  label colour and when to use each. Focus ring (width, colour, offset) and pressed state.

## 7. Data
- Define every metric with a formula (see the suggestions table for the chosen type).
- Data model: every entity and its fields (see the suggestions table).
- A sample mock JSON payload (a few rows of each entity), plus a "Mock data" subsection that specifies
  the FULL data set as an established business, not a brand-new one:
  - History: at least 2–3 years of records, up to today, so trends, month-over-month and
    year-over-year comparisons, and seasonality are meaningful.
  - Volume: realistic for the client's size (e.g. thousands of rows of the main entity, not 40).
    State the exact counts and the date range.
  - Realism: realistic distributions and patterns (busy and quiet seasons, weekday/weekend
    differences, gradual growth, a few outliers and problem cases such as overdue, late or lost items),
    consistent relationships between entities, and plausible values (prices, durations, scores).
  - Generation: a seeded generator script (scripts/generate-data.js, Node, no dependencies; same seed =
    same data every time) writes data/mock-data.json. Both are committed. The site only reads the JSON,
    so there is still no build step, numbers are reproducible and tests are stable.
  - Privacy: names, companies, emails and phone numbers look real but are invented. No real people,
    no real ID numbers, and use reserved formats for contact details (e.g. @example.com emails).

## 8. States & interaction
For each state, what the user sees and the exact message text:
- Loading: skeleton cards (which colour token).
- Empty: no results for a filter (message + a button to clear filters).
- Error: a banner with a Retry button; the last numbers stay visible and are marked as stale.
- A "Data as of <date/time>" caption, so it is clear the numbers are mock data at a point in time.
Interaction: what each filter does, that everything updates without a page reload, gestures always
have a visible button too, motion (e.g. numbers count up in ≤ 600 ms) and prefers-reduced-motion.

## 9. Accessibility
- All text meets WCAG 2.1 AA (4.5:1, large text 3:1), as tabled in section 5.
- Touch targets ≥ the minimum from section 5.
- Every icon has a visible text label and an accessible name.
- Every chart has a text summary (e.g. "Open tickets peaked on Monday at 142") and a data-table toggle.
- Layout holds up to 200% text zoom without overlap.
- Full keyboard navigation with a visible focus ring.
- Light mode only in v1 (dark mode is on the "IT IS NOT" list).

## 10. Technical notes
- Stack: HTML-based, no frameworks (no React/Angular/Vue/jQuery, no Bootstrap/Tailwind), no build step.
- HTML: semantic HTML5 (header, nav, main, section, table with caption/th scope, button, dialog),
  ARIA only where native elements are not enough, valid markup.
- CSS: modern CSS: custom properties for every design token (colours, spacing, radius, shadows,
  font sizes), CSS Grid and Flexbox layout, clamp() for fluid type and spacing, container queries
  where useful, :focus-visible styles, @media (prefers-reduced-motion), smooth transitions,
  logical properties. Organised with @layer (reset, tokens, layout, components, utilities).
- JavaScript: vanilla ES2022+ in ES modules (type="module"), split into small modules
  (e.g. data.js, state.js, charts.js, table.js, main.js). No inline handlers, no global variables.
  Use Intl.NumberFormat / Intl.DateTimeFormat for numbers, currency and dates.
- Charts: hand-built inline SVG, or ONE small chart library from a CDN pinned to an exact version.
- File structure: index.html, css/, js/, data/, assets/, tests/, scripts/ (mock data generator).
- Favicon made from the logo. Installable as a PWA is optional (Later).
- Performance budget: first meaningful paint < 2 s on 4G; mock data loaded without blocking the page.
- Quality bar: no console errors, Lighthouse Performance/Accessibility/Best Practices ≥ 90,
  no secrets in the repo.

## 11. Done means (acceptance criteria)
For EVERY Must feature, 1–3 lines that can PASS or FAIL, with numbers where possible.
Example: "Filtering by status 'Open' shows only rows with status = Open,
and the KPI tiles update without a page reload."
Plus global checklist items: [ ] only palette colours are used; [ ] no horizontal scroll 320–1440px;
[ ] every touch target ≥ the minimum; [ ] every icon has a label; [ ] all text meets AA contrast;
[ ] nothing from the "IT IS NOT" list exists in the app.

RULES FOR YOU
- Ask me about anything unclear BEFORE writing. Don't fill blanks with guesses.
- Every rule must be specific enough that two people would agree on whether the dashboard meets it.
- Every sentence must be useful to a developer. Don't write code.
```

**Then:** read SPEC.md yourself and edit anything you disagree with. This is where most of the grade comes from.

#### Suggestions per dashboard type (starting points for SPEC.md; adapt them, don't copy blindly)

| | 4.1 Customer service | 4.2 Smart leads | 4.3 HR onboarding | 4.4 Inventory & logistics |
|---|---|---|---|---|
| **Roles** | Support team lead (desktop), Support agent (desktop, all day), Customer-experience manager (weekly review) | Sales manager (desktop), Sales rep (phone, between calls), Marketing manager (campaign view) | HR manager (desktop), Onboarding coordinator (desktop), Hiring/team manager (phone, quick check) | Operations manager (desktop, morning review), Warehouse supervisor (tablet on the floor), Buyer (desktop, reorders) |
| **Not users** | Customers, finance | The leads themselves, customers | The new employees, payroll | Customers, suppliers, drivers |
| **Must** | KPI tiles (open, new today, overdue vs SLA, avg first-response time, CSAT); ticket table with search, filter (status, priority, channel, agent) and sort; tickets by status/channel chart; SLA-breach alerts list | KPI tiles (new leads, qualified, conversion %, pipeline value); leads table with lead score, filter (stage, source, owner, score) and sort; pipeline by stage chart; "hot leads" list (score ≥ threshold) | KPI tiles (starting this month, in onboarding, completion %, overdue tasks); new-hires table with filter (department, start date, status, buddy); checklist progress per hire; overdue-tasks alerts | KPI tiles (SKUs, stock value, low stock, out of stock, in transit, late, on-time %); low-stock/reorder alerts; inventory table with filter (category, warehouse, status) and sort; shipments list with status and ETA; stock by category/warehouse chart |
| **Should** | Ticket volume trend (30 days), agent workload view, CSV export | Lead-source performance, follow-up due today, CSV export | Onboarding timeline per hire, department breakdown, CSV export | 30-day stock movement trend, warehouse switcher, CSV export |
| **Later** | Real helpdesk integration, auto-assignment, notifications | Real CRM integration, AI score model, email sequences | HRIS integration, e-signature, reminders | Real WMS/ERP data, reorder suggestions, supplier performance |
| **Type-specific "IT IS NOT"** | Not a ticketing system (no replying to customers) | Not a CRM (no editing or contacting leads) | Not a payroll or HRIS system (no salaries, no personal ID numbers) | Not a purchasing system (no placing orders, no editing stock) |
| **Metric examples** | Overdue = now > created_at + SLA hours and status ≠ Closed; CSAT = avg rating (1–5) | Conversion % = won ÷ total leads in period; Score = defined weighted rule (state it) | Completion % = done tasks ÷ total tasks per hire; Overdue = due_date < today and not done | Stock value = Σ qty × unit_cost; Low = qty ≤ reorder_point; On-time % = delivered by ETA ÷ delivered |
| **Data model** | ticket: id, customer, subject, channel, priority, status, agent, created_at, first_response_at, resolved_at, csat | lead: id, name, company, source, stage, owner, score, value, created_at, last_contact | hire: id, name, role, department, start_date, manager, buddy, status; task: hire_id, title, owner, due_date, done | product: sku, name, category, warehouse, qty, reorder_point, unit_cost, supplier; shipment: id, origin, destination, status, ship_date, eta, carrier |

**About the data:** it is mock data, but it must look and behave like real data from a business that
has been running for years (2–3+ years of history, realistic volume, seasonality, trends and problem cases).
It must not contain anyone's real personal data: names and contacts look real but are invented,
there are no real ID numbers, and emails use reserved domains such as example.com.

---

### Prompt 2: Connect or create the GitHub repo, and commit the spec first

```
We are at Prompt 2. From now on, print every gh CLI command you use before running it.
Work inside the project folder created in Prompt 0.
1. git init (branch main).
2. Create .gitignore with: .env, .env.*, .DS_Store, Thumbs.db, node_modules/, *.log, and .claude/* with the exception !.claude/skills/ (so project skills are committed)
3. Run git status, then stage ONLY SPEC.md, .gitignore, dashboard-project-starter.md and assets/ (if present).
4. Commit: "Add <dashboard type> dashboard spec" with a body that says it is the spec, written before any code.
5. Connect the GitHub repo, depending on my Prompt 0 answer:
   a) I GAVE A REPO URL: check it with gh repo view <url> (visibility, and whether it has commits).
      If it is not empty, show me what is there and ask before continuing. Never force-push.
      If its visibility differs from my answer, ask me before changing it (gh repo edit --visibility).
      Then: git remote add origin <url> and git push -u origin main.
   b) CREATE IT: gh repo create <project name from Prompt 0> --public or --private (as I chose)
      --source . --remote origin --push.
6. If the repo is PRIVATE: add the teacher as a collaborator with
   gh api -X PUT repos/<owner>/<repo>/collaborators/<teacher-username> -f permission=pull
   (show me the command first and ask me to confirm), then confirm the invitation was sent.
Show me the repo URL and git log --oneline.
```

---

### Prompt 3: Create Practice.md and CLAUDE.md

```
We are at Prompt 3. Create Practice.md with the working rules below (keep the wording clear, it is
read by both Claude and humans), and create CLAUDE.md containing exactly one line:  @Practice.md
Then commit "Add Practice.md working rules and CLAUDE.md" and push.

Practice.md content:

# How we work on this project
Project: <project name>, a <dashboard type> dashboard. Source of truth: SPEC.md. Read SPEC.md before ANY change.

## 1. Every request: the same 4 steps
1. Review: Does the request fit SPEC.md? Name the feature and its priority (Must/Should/Later).
   If it is on the "IT IS NOT" list or contradicts the spec, say so and STOP.
   If anything is unclear, ask. Never fill a blank with a guess.
   Write a short plan (3–5 lines) and wait for my approval.
2. Build: Make only the approved change. Nothing extra and no "while I'm here" edits.
3. Test: Run ALL tests. Add at least one test for the new behaviour, taken from the
   "Done means" lines in SPEC.md. "It looks right" is not a test. Report pass/fail.
4. Commit: One request = one commit. Then push to origin.

## 2. Git and GitHub rules
- Always start with git status. Stage only the files for this change (no scratch files).
- Commit message: line 1 = what changed; body = why; last line = spec reference,
  e.g. "Spec: Features / Must / low-stock alerts". Add "Fixes #N" when it closes an issue.
- Commit and push automatically after every approved, tested change. Don't batch features
  and don't leave finished work unpushed.
- Print every gh CLI command you use.
- Never commit secrets, keys or .env files.
- For larger or risky changes, work on a branch (git switch -c <feature>) and open a PR (gh pr create).

## 3. README.md
- Keep README.md at the root with: the logo, what the dashboard is (one paragraph), a status line
  (e.g. "v1: all numbers are mock data, no backend"), the current feature list, "Not built yet",
  how to run it locally (e.g. python -m http.server 8765), the live GitHub Pages link, a table of
  files with their purpose, and a link to SPEC.md.
- If README.md does not exist yet, create it with the first feature.
- Update it in the SAME commit as the feature it describes.

## 4. Keep SPEC.md in sync
- If a change request changes design, colours, sizes or features, update SPEC.md in the SAME
  commit, so SPEC.md and the dashboard never disagree.
- The dashboard must never contain anything SPEC.md forbids.

## 5. Bugs outside the request
- Don't fix them silently and don't just mention them in chat. Open a GitHub Issue:
  gh issue create with Title, Steps, Expected, Actual, and "Found while: <request>".
- Then continue with the original request.

## 6. When something goes wrong
- To undo a commit: show the last commit id (git log --oneline), then git revert <id> and push.
- If Claude did the wrong thing, fix this file (Practice.md), not the chat, and commit it.

## 7. Skills
- Before planning or building, read the skills in .claude/skills/ (each SKILL.md) and use every skill
  whose description fits the task (e.g. ui-ux-design for any design, layout, colour, typography,
  chart or table work, and dataviz for charts if installed). Name the skills you used in your plan and in your final report.
- Order of authority: SPEC.md > Practice.md > skills. A skill may improve HOW something is built,
  but it never overrides the spec (e.g. a design skill must not add colours, fonts or features the spec
  does not allow). If a skill conflicts with the spec, follow the spec and tell me about the conflict.
```

---

### Prompt 3b: Add the prepared skills to the project

```
We are at Prompt 3b. The user has prepared Claude Code skills in the Workspace folder.
Each skill is a folder that contains a SKILL.md file, e.g.:
E:\AIDO OCT 2026\Workspace\ui-ux-design\SKILL.md
1. Find every skill folder directly inside E:\AIDO OCT 2026\Workspace (any subfolder that contains SKILL.md).
   If none is found, stop and tell me.
2. COPY each skill folder, with all its files, into the project as .claude/skills/<skill-folder-name>/
   (e.g. .claude/skills/ui-ux-design/SKILL.md). This is where Claude Code loads project skills from.
   Never edit, move or delete the originals in Workspace.
3. Make sure .gitignore ignores .claude/ EXCEPT the skills, so the skills are committed with the project:
   .claude/*
   !.claude/skills/
4. Read every copied SKILL.md fully. Report each skill's name and when it should be used.
5. Update CLAUDE.md so it is read at the start of every session, with these lines:
   @Practice.md
   Project skills live in .claude/skills/. Read each SKILL.md there before planning or building,
   and use every skill whose description fits the task.
6. Commit "Add project skills copied from Workspace" and push.
From now on, follow the skills together with Practice.md (order of authority: SPEC.md > Practice.md > skills).
```

If you add or update a skill in Workspace later, ask Claude to copy it into the project again and commit
it as its own change ("Update skills from Workspace").

---

### Prompt 4: Build v1 from the spec

```
We are at Prompt 4. Read SPEC.md, Practice.md and every SKILL.md in .claude/skills/. Follow Practice.md step 1: show me the plan first,
including which skills you will use for each part (ui-ux-design for all visual and UX work, and the
dataviz skill for every chart if it is installed, as the teacher did in class).
After I approve, build dashboard v1 EXACTLY as SPEC.md says:
- Static site with the file structure from SPEC.md section 10, ready for GitHub Pages.
- Plain modern HTML5, CSS and vanilla JavaScript (ES modules) only. No React, Angular, Vue, jQuery,
  Bootstrap or Tailwind, and no build step. The design must still look professional and polished.
- Implement ALL "Must" features. Should/Later only if the spec says so for v1.
- Every colour comes from the spec's tokens (CSS variables). No other colours.
- Respect every size, font, breakpoint and "IT IS NOT" rule.
- Add tests for the "Done means" lines (e.g. tests/tests.html or a node script with no dependencies)
  and run them.
- Create README.md as described in Practice.md.
- Serve it locally (ES modules do not work from file://), e.g. python -m http.server 8765, open
  http://localhost:8765 so I can see v1, check the browser console has no errors,
  then commit and push (one commit: "Add dashboard v1").
```

---

### Prompt 5: Check the build against the spec, line by line

```
We are at Prompt 5. Audit the dashboard against SPEC.md line by line:
every "Done means" line, every design rule (colours used in CSS/JS vs the palette, sizes, fonts,
icon labels, contrast), every breakpoint (check 320, 375, 768, 1024, 1440px for horizontal scroll),
every "IT IS NOT" item (confirm none exists), the mock data rules in section 7 (history, volume,
no real personal data), and the quality bar in section 10 (no console errors, Lighthouse scores,
no frameworks used).
Output a table: Spec line | PASS/FAIL | evidence.
Fix every FAIL as its own commit (spec reference in the message). If a FAIL is really a bug outside
the scope, open a GitHub Issue instead. Re-run the tests, then push.
```

---

### Prompt 6 (bonus): GitHub Pages

```
We are at Prompt 6. Check the GitHub Pages options for this repo. If the repo is private, tell me that free GitHub Pages
needs a public repo (or a paid plan) and ask me whether to make it public before continuing. Then
enable GitHub Pages from the main branch (root), wait until it is live, and open the live URL to verify.
Add the live link to README.md, then commit and push.
```

---

## Part D: Before you submit

- [ ] `git log --oneline` shows the order spec → practice → code.
- [ ] Every colour, size, font and feature in the dashboard matches SPEC.md, and nothing on the "IT IS NOT" list exists.
- [ ] SPEC.md was updated in the same commit as any change to the design.
- [ ] README.md is current and includes the live link.
- [ ] The repo is public, or the teacher has been added as a collaborator.
- [ ] Submit: the repo link, SPEC.md, Practice.md, and the GitHub Pages link (bonus).
