# LLM generation with a validation layer

We need to generate Japanese-style name candidates along two creative axes — sound-based (響き名) and meaning-based (意味名, fed by free-text roots) — while guaranteeing that every surname is a real Japanese surname (実在姓制約) and that kanji/readings are valid. We decided to use an LLM for generation, backed by a post-generation validation layer that checks candidates against a real-surname list, a kanji dictionary, and reading-plausibility rules, regenerating on failure.

A pure-LLM approach (A) was rejected because it cannot be trusted to honour the real-surname constraint and may invent readings/meanings. A rules/dictionary-only approach (C) was rejected because it cannot turn free-text roots into creative meaning-based names. A split (D: LLM for meaning-axis, rules for sound-axis) is viable but adds pipeline complexity for little gain over a single validated LLM path.

**Consequences**: Generation is non-deterministic by nature (acceptable — it powers the "もっと出す" regenerate feature and variety is desirable). The real-surname list and kanji dictionary become required data dependencies. Etymology for the meaning axis is initially LLM-derived, with a dictionary-first fallback to be considered if reliability demands it.
