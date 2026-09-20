const dbService = require('../services/dbService');
const aiService = require('../services/aiService');

async function runTest() {
  console.log('--- Testing dbService ---');
  const notes = dbService.getAllNotes();
  console.log('Notes count:', notes.length);

  const sample = notes[0];
  console.log('Sample note title:', sample.title);
  console.log('Sample note category:', sample.category);

  const searchRes = dbService.searchDatabase('fe');
  console.log('Search for "fe":', searchRes.totalMatches, 'matches');

  const newNote = dbService.createNote({
    title: 'Test Note 2026',
    category: 'daily_text',
    year: 2026,
    month: 'Septiembre',
    content: 'Prueba de nota con fe y confianza en las promesas.',
    tags: ['test', 'fe']
  });
  console.log('Created note ID:', newNote.id);

  const found = dbService.getNoteById(newNote.id);
  console.log('Found created note:', found.title);

  console.log('--- Testing AI Service local fallback ---');
  const corrected = await aiService.improveNoteWithAI('esta es una nota de prueva sin mayusculas .', 'correct', 'Prueba');
  console.log('Corrected text:', corrected);

  const improved = await aiService.improveNoteWithAI('ideas para el estudio personal de jacob y su paciencia', 'improve', 'Jacob');
  console.log('Improved text:', improved);

  const delOk = dbService.deleteNote(newNote.id);
  console.log('Deleted test note:', delOk);

  console.log('--- ALL TESTS COMPLETED SUCCESSFULLY! ---');
}

runTest().catch(console.error);
