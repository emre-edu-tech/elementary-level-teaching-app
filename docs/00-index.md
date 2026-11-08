# Spec Index — SayıHarf (working title)

Turkish learning app for pre-school / 1st-grade children: numbers (1–100) and
the 29-letter Turkish alphabet, with voice-answer activities powered by STT.

## How to use these specs (for the coding agent)

1. Work milestone by milestone (see `11-milestones.md`). For each milestone,
   read ONLY the files listed in the reading map below. Do not read other files.
2. Every file is < 100 lines. If you think you need more context, the answer is
   in the files listed for your milestone — not elsewhere.
3. All user-visible text MUST be Turkish. UI strings and content rules live in
   `08-content-tr.md` and `05-frontend.md`. Never invent new Turkish copy —
   reuse the strings defined there, or follow their style if a new one is
   unavoidable.
4. Do not add features, dependencies, or abstractions beyond what the specs
   describe. Scope boundaries are in `01-overview.md`.

## Reading map

| Milestone                          | Read these files        |
|------------------------------------|-------------------------|
| 1. Project skeleton                | 01, 02, 03              |
| 2. Profiles + home + progress page | 02, 03, 04, 05          |
| 3. Number tap games (4)            | 04, 05, 06              |
| 4. Letter games (2)                | 05, 07                  |
| 5. Mic-test page + STT pipeline    | 02, 04, 08, 09, 10      |
| 6. Voice games (2)                 | 05, 06 (§voice_numbers), 07 (§voice_letters), 08, 09, 10 |
| 7. Sticker board + polish          | 03, 04, 05              |
| 8. Final polish + README           | 01, 11                  |

## File contents at a glance

- `01-overview.md` — product, audience, scope IN/OUT
- `02-architecture.md` — stack, project tree, config, build/run commands, VPS deployment
- `03-data-model.md` — SQLite schema, db helper conventions
- `04-api.md` — every route and JSON contract
- `05-frontend.md` — design rules for kids, shared JS helpers (TTS, sounds, recorder UI)
- `06-games-numbers.md` — logic of the 4 number games incl. voice_numbers
- `07-games-letters.md` — logic of the 2 letter games incl. voice_letters
- `08-content-tr.md` — Turkish lexicon rules, 29-letter table, STT answer variants
- `09-stt-capture.md` — browser side: mic capture, recorder module, mic-test page
- `10-stt-server.md` — faster-whisper integration, normalization, matching rules
- `11-milestones.md` — build order, deliverables, acceptance criteria
