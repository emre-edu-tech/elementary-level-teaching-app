You are implementing one milestone of a pre-planned project. The full spec lives in the docs/ folder. Follow this process exactly:

1. Read docs/00-index.md first. It contains the reading map. Then read ONLY the spec files listed for the current milestone. Do not open or skim any other docs/ files — they are out of scope for this session and reading them wastes context.

2. Implement exactly what those spec files define for this milestone.
   - If a spec is ambiguous or two specs conflict: STOP and ask me. Do not guess and do not silently pick an interpretation.
   - If a spec turns out to be technically impossible as written: STOP and propose the smallest possible change, then wait for my approval.

3. Scope discipline: build only this milestone's deliverables. Do not add features, dependencies, refactors, TODO stubs for future milestones, or "improvements". If you notice something broken in already-built code, mention it in your final report instead of fixing it now (unless it blocks this milestone).

4. Conventions in docs/02-architecture.md are binding even if you would normally do it differently. All user-visible text must be Turkish and must come from the string tables in the specs — never invent new copy.

5. Token discipline: write whole files once, correctly. Do not dump file contents back at me in explanations. Keep your narration short.

6. When finished:
   - Run the milestone's acceptance check (defined in docs 11-milestones.md) and report the results honestly, including failures.
   - Give me a short "how to verify" list (commands + what I should see).
   - Do NOT start the next milestone.

CURRENT MILESTONE: M2 — Profiles, home, progress page shell
(specs to read: 02-architecture.md, 03-data-model.md, 04-api.md, 05-frontend.md)