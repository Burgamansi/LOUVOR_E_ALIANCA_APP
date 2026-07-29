// Transposition utility for musical chords

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'C#': 1, 'DB': 1,
  'D': 2, 'D#': 3, 'EB': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'GB': 6,
  'G': 7, 'G#': 8, 'AB': 8,
  'A': 9, 'A#': 10, 'BB': 10,
  'B': 11
};

/**
 * Transposes a single note by semitones offset.
 */
export function transposeNote(note: string, semitones: number, useFlats = false): string {
  const upperNote = note.toUpperCase();
  const idx = NOTE_TO_INDEX[upperNote];
  if (idx === undefined) return note;

  let newIdx = (idx + semitones) % 12;
  if (newIdx < 0) newIdx += 12;

  const scale = useFlats ? CHROMATIC_FLATS : CHROMATIC_SCALE;
  return scale[newIdx];
}

/**
 * Transposes a full chord name e.g. "G", "D7", "Am", "F#/G#", "Cmaj7/E"
 */
export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  if (semitones === 0) return chord;

  // Split chord by slash if it's a bass note e.g. C/G
  const parts = chord.split('/');
  const mainPart = parts[0];
  const bassPart = parts[1];

  const transposedMain = mainPart.replace(/([A-G][#b]?)/g, (match) => {
    return transposeNote(match, semitones, useFlats);
  });

  if (bassPart) {
    const transposedBass = bassPart.replace(/([A-G][#b]?)/g, (match) => {
      return transposeNote(match, semitones, useFlats);
    });
    return `${transposedMain}/${transposedBass}`;
  }

  return transposedMain;
}

export const KEY_LIST = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Extracts root note index from key string e.g. "G" -> 7, "Am" -> 9, "F#m" -> 6
 */
export function getKeyNoteIndex(keyString: string): number {
  const match = keyString.match(/^([A-G][#b]?)/i);
  if (!match) return 0;
  const root = match[1].toUpperCase();
  return NOTE_TO_INDEX[root] ?? 0;
}

/**
 * Calculates semitone distance between originalKey and targetKey
 */
export function calculateSemitones(originalKey: string, targetKey: string): number {
  const origIdx = getKeyNoteIndex(originalKey);
  const targetIdx = getKeyNoteIndex(targetKey);
  let diff = targetIdx - origIdx;
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;
  return diff;
}

/**
 * Gets the current transposed key name given original key and semitones
 */
export function getTransposedKeyName(originalKey: string, semitones: number): string {
  const match = originalKey.match(/^([A-G][#b]?)(.*)$/i);
  if (!match) return originalKey;
  const rootNote = match[1];
  const suffix = match[2] || '';
  const transposedRoot = transposeNote(rootNote, semitones);
  return `${transposedRoot}${suffix}`;
}

/**
 * Transposes line containing chords or whole block text.
 */
export function transposeChordBlock(text: string, semitones: number): string {
  if (semitones === 0) return text;

  // Simple chord detection regex matching common notation
  const chordRegex = /\b[A-G][#b]?(?:m|maj|dim|aug|sus[24]?|add[91113]?|[2456789]|11|13)*(?:\/[A-G][#b]?)?\b/g;

  return text.replace(chordRegex, (match) => {
    return transposeChord(match, semitones);
  });
}
