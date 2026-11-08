/**
 * Spanish Syllabification Engine (Silabeador en Español)
 * Splits Spanish words and sentences into exact phonetic syllables for reading instruction.
 */

// Consonant groups that never separate when followed by a vowel
const INSEPARABLE_CONSONANTS = new Set([
  'bl', 'cl', 'fl', 'gl', 'pl',
  'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr',
  'ch', 'll', 'rr'
]);

function isVowel(char: string): boolean {
  return /[aeiouáéíóúü]/i.test(char);
}

function isStrongVowel(char: string): boolean {
  return /[aeoáéó]/i.test(char);
}

function isAccentedWeakVowel(char: string): boolean {
  return /[íú]/i.test(char);
}

/**
 * Splits a single Spanish word into its syllables
 */
export function splitWordIntoSyllables(word: string): string[] {
  // If word has punctuation attached (e.g. "mima."), separate punctuation
  const match = word.match(/^([^\wáéíóúüñ]*)([\wáéíóúüñ]+)([^\wáéíóúüñ]*)$/i);
  if (!match) {
    return [word];
  }

  const prefix = match[1];
  const core = match[2];
  const suffix = match[3];

  if (core.length <= 2) {
    return [prefix + core + suffix];
  }

  const chars = core.split('');
  const cutPositions: number[] = []; // Indices where a syllable ends
  const n = chars.length;

  // Find all vowel groups / nuclei
  const vowelIndices: number[] = [];
  for (let i = 0; i < n; i++) {
    if (isVowel(chars[i])) {
      vowelIndices.push(i);
    }
  }

  // If 0 or 1 vowel, it's a monosyllable
  if (vowelIndices.length <= 1) {
    return [prefix + core + suffix];
  }

  // Iterate between consecutive vowel peaks
  for (let k = 0; k < vowelIndices.length - 1; k++) {
    const v1 = vowelIndices[k];
    const v2 = vowelIndices[k + 1];

    // Number of consonants between the two vowels
    const consonantsBetween = v2 - v1 - 1;

    if (consonantsBetween === 0) {
      // Two vowels side by side: check for hiatus vs diphthong
      const char1 = chars[v1].toLowerCase();
      const char2 = chars[v2].toLowerCase();

      // Hiatus: two strong vowels (e.g., 'ca-os', 'le-er', 'te-a-tro')
      // OR strong + accented weak (e.g., 'tí-a', 'ma-íz', 'ba-úl')
      const isHiatus = 
        (isStrongVowel(char1) && isStrongVowel(char2)) ||
        (isAccentedWeakVowel(char1) && isVowel(char2)) ||
        (isVowel(char1) && isAccentedWeakVowel(char2)) ||
        (char1 === char2); // equal vowels: 'cre-er'

      if (isHiatus) {
        cutPositions.push(v1 + 1);
      }
      // Otherwise it's a diphthong: stays together
    } else if (consonantsBetween === 1) {
      // V-C-V: the consonant goes with the second syllable (e.g., 'ca-sa', 'co-he-te')
      cutPositions.push(v1 + 1);
    } else if (consonantsBetween === 2) {
      // V-C-C-V:
      // Check if the pair is inseparable (br, bl, cr, cl, etc.)
      const pair = (chars[v1 + 1] + chars[v1 + 2]).toLowerCase();
      if (INSEPARABLE_CONSONANTS.has(pair)) {
        // Both go to the second syllable (e.g., 'li-bro', 'a-plau-so')
        cutPositions.push(v1 + 1);
      } else {
        // One consonant goes to the first, the other to the second (e.g., 'es-tre-lla', 'al-to')
        cutPositions.push(v1 + 2);
      }
    } else if (consonantsBetween === 3) {
      // V-C-C-C-V:
      // The last pair is usually inseparable (e.g., 'es-tre-lla', 'com-prar')
      const lastPair = (chars[v2 - 2] + chars[v2 - 1]).toLowerCase();
      if (INSEPARABLE_CONSONANTS.has(lastPair)) {
        cutPositions.push(v2 - 2);
      } else {
        cutPositions.push(v2 - 1);
      }
    } else if (consonantsBetween >= 4) {
      // e.g. 'cons-truir'
      cutPositions.push(v1 + 3);
    }
  }

  // Slice the word based on cut positions
  const syllables: string[] = [];
  let lastCut = 0;
  for (const cut of cutPositions) {
    if (cut > lastCut && cut <= n) {
      syllables.push(core.slice(lastCut, cut));
      lastCut = cut;
    }
  }
  if (lastCut < n) {
    syllables.push(core.slice(lastCut));
  }

  // Attach prefix to first syllable and suffix to last syllable
  if (syllables.length > 0) {
    syllables[0] = prefix + syllables[0];
    syllables[syllables.length - 1] = syllables[syllables.length - 1] + suffix;
  } else {
    return [prefix + core + suffix];
  }

  return syllables;
}

export interface SyllableToken {
  id: string; // unique identifier
  text: string; // the syllable text (e.g. "Mi", "ma", "má.")
  wordIndex: number;
  syllableIndexInWord: number;
  globalIndex: number;
  cleanText: string; // without punctuation for pronunciation
}

export interface WordToken {
  wordIndex: number;
  rawText: string;
  cleanText: string;
  syllables: SyllableToken[];
}

/**
 * Splits an entire sentence into words and structured syllable tokens
 */
export function parseSentenceSyllables(sentence: string): { words: WordToken[]; allSyllables: SyllableToken[] } {
  if (!sentence.trim()) return { words: [], allSyllables: [] };

  const rawWords = sentence.trim().split(/\s+/);
  const words: WordToken[] = [];
  const allSyllables: SyllableToken[] = [];
  let globalCounter = 0;

  rawWords.forEach((w, wIdx) => {
    const rawSyllables = splitWordIntoSyllables(w);
    const syllableTokens: SyllableToken[] = rawSyllables.map((syl, sylIdx) => {
      const clean = syl.replace(/[^\wáéíóúüñ]/gi, '');
      const token: SyllableToken = {
        id: `syl-${wIdx}-${sylIdx}`,
        text: syl,
        wordIndex: wIdx,
        syllableIndexInWord: sylIdx,
        globalIndex: globalCounter++,
        cleanText: clean
      };
      allSyllables.push(token);
      return token;
    });

    words.push({
      wordIndex: wIdx,
      rawText: w,
      cleanText: w.replace(/[^\wáéíóúüñ]/gi, ''),
      syllables: syllableTokens
    });
  });

  return { words, allSyllables };
}
