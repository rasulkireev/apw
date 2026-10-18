# Evidence and claim policy

2026-10-18: Poetry's official installer is `https://install.python-poetry.org`, piped to `python3 -` on Linux/macOS/WSL (https://python-poetry.org/docs/#installation). The old `python-poetry/poetry/master/get-poetry.py` URL returns 404. Poetry 2.x requires separate shell/export plugins for the existing `poetry shell` and `poetry export` examples (https://python-poetry.org/docs/managing-environments/#activating-the-environment, https://python-poetry.org/docs/cli/#export). Correct both existing installer examples and the Django guide's plugin prerequisites; preserve historical init output and the author's experience. This is not a complete revalidation of the Django or ERC20 walkthrough.

Confirmed from repository: Astro static site; file-backed content in `src/content`; routing and metadata in `src/pages` and `src/layouts`. These are implementation facts, not claims that every deployed page is correct.

Only technical identity checks are currently automated. No full editorial claim audit has been completed. Do not report articles as fact-checked because these rules pass. When correcting a factual claim, retain dated primary-source evidence privately and add a targeted regression rule when practical. Personal anecdotes must come from the author, never inferred or fabricated.

Verified 2026-10-17: Windows Command Prompt activates a Python virtual environment using `<venv>\Scripts\activate.bat`; the Jupyter tutorial's environment is named `DS`. PowerShell uses a different script. Source: [Python venv documentation](https://docs.python.org/3/library/venv.html#how-venvs-work). This verifies the activation instruction only, not the full historical tutorial.
