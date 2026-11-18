const ACCENTED = 'ąćęłńóśźż';
const PLAIN = 'acelnoszz';

export const fold = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(
      /[óąćęłńśźż]/g,
      (letter) => PLAIN[ACCENTED.indexOf(letter)] ?? letter,
    );
