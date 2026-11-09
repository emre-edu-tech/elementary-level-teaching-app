# Turkish lexicon (numbers). Source of truth: docs/08-content-tr.md §Numbers.
# Used by the server (STT matching in M5/M6) and injected into the frontend via
# play.html (window.GAME_CONFIG.lexicon.numberWords) — single source of truth,
# no duplicated content in JS.

_UNITS = {1: "bir", 2: "iki", 3: "üç", 4: "dört", 5: "beş",
          6: "altı", 7: "yedi", 8: "sekiz", 9: "dokuz"}
_TENS = {20: "yirmi", 30: "otuz", 40: "kırk", 50: "elli",
         60: "altmış", 70: "yetmiş", 80: "seksen", 90: "doksan"}


def _build_number_words():
    """Turkish number words are fully regular — build 1–100 per the rules:
    1–10 base words, 11–19 'on' + unit, 21–99 tens word + space + unit."""
    words = {}
    for n in range(1, 10):
        words[n] = _UNITS[n]
    words[10] = "on"
    for n in range(11, 20):
        words[n] = "on " + _UNITS[n - 10]
    for tens in range(20, 100, 10):
        words[tens] = _TENS[tens]
        for unit in range(1, 10):
            words[tens + unit] = _TENS[tens] + " " + _UNITS[unit]
    words[100] = "yüz"
    return words


_NUMBER_WORDS = _build_number_words()


def numberWord(n):
    """Turkish word for n, e.g. 21 -> 'yirmi bir'. Raises out-of-range."""
    if isinstance(n, bool) or not isinstance(n, int) or not 1 <= n <= 100:
        raise ValueError(f"numberWord: 1-100 dışı değer {n!r}")
    return _NUMBER_WORDS[n]


def number_words():
    """str(n) -> word map for window.GAME_CONFIG.lexicon.numberWords."""
    return {str(n): word for n, word in _NUMBER_WORDS.items()}
