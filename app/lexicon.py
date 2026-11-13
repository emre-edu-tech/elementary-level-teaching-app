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


# Letters (docs/08-content-tr.md §Letters): char | TTS name | accepted STT
# variants (pre-normalization; normalization strips spaces/punctuation and maps
# ı->i). Used by the server for STT matching in M6 and injected into the
# frontend as window.GAME_CONFIG.lexicon.letters ({char, lower, name} only).
_LETTER_ROWS = [
    ("A", "a", "a", ("a",)),
    ("B", "b", "be", ("be", "beh", "b")),
    ("C", "c", "ce", ("ce", "ceh", "c")),
    ("Ç", "ç", "çe", ("çe", "çeh", "ç")),
    ("D", "d", "de", ("de", "deh", "d")),
    ("E", "e", "e", ("e",)),
    ("F", "f", "fe", ("fe", "feh", "f")),
    ("G", "g", "ge", ("ge", "geh", "g")),
    ("Ğ", "ğ", "yumuşak ge", ("yumusakge", "yumusakgeh", "yumusak ge")),
    ("H", "h", "he", ("he", "heh", "h")),
    ("I", "ı", "ı", ("ı",)),
    ("İ", "i", "i", ("i",)),
    ("J", "j", "je", ("je", "jeh", "j")),
    ("K", "k", "ke", ("ke", "keh", "k")),
    ("L", "l", "le", ("le", "leh", "l")),
    ("M", "m", "me", ("me", "meh", "m")),
    ("N", "n", "ne", ("ne", "neh", "n")),
    ("O", "o", "o", ("o",)),
    ("Ö", "ö", "ö", ("ö",)),
    ("P", "p", "pe", ("pe", "peh", "p")),
    ("R", "r", "re", ("re", "reh", "r")),
    ("S", "s", "se", ("se", "seh", "s")),
    ("Ş", "ş", "şe", ("şe", "şeh", "ş")),
    ("T", "t", "te", ("te", "teh", "t")),
    ("U", "u", "u", ("u",)),
    ("Ü", "ü", "ü", ("ü",)),
    ("V", "v", "ve", ("ve", "veh", "v")),
    ("Y", "y", "ye", ("ye", "yeh", "y")),
    ("Z", "z", "zed", ("zed", "zedh", "z")),
]

LETTERS = [
    {"char": char, "lower": lower, "name": name, "variants": list(variants)}
    for char, lower, name, variants in _LETTER_ROWS
]


def letters():
    """Frontend shape for window.GAME_CONFIG.lexicon.letters — no variants."""
    return [{"char": l["char"], "lower": l["lower"], "name": l["name"]}
            for l in LETTERS]


def letter_variants(char):
    """Accepted STT variants for a letter, e.g. 'B' -> ['be', 'beh', 'b']."""
    for l in LETTERS:
        if l["char"] == char:
            return list(l["variants"])
    raise ValueError(f"letter_variants: bilinmeyen harf {char!r}")
