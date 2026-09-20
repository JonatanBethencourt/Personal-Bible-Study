const fs = require('fs');
const path = require('path');
const { extractTextFromFile, cleanText } = require('./docParser');

const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');
const APUNTES_DIR = path.join(__dirname, '..', 'apuntes');

const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function parseDateComponents(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.includes('-')) return null;
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return {
    year: isNaN(y) ? 2026 : y,
    month: (m >= 1 && m <= 12) ? SPANISH_MONTHS[m - 1] : '',
    day: isNaN(d) ? null : d
  };
}

const BACKUPS_DIR = path.join(__dirname, '..', 'data', 'backups');

function getDefaultCategories() {
  return [
    { id: 'daily_text', name: 'Daily Text Comments', icon: '🌅', isSystem: true, subCategories: [] },
    {
      id: 'events',
      name: 'Events',
      icon: '🏛️',
      isSystem: true,
      subCategories: [
        { id: 'bethel_talks', name: 'Bethel Talks', icon: '🎤', isSystem: true },
        { id: 'annual_meeting', name: 'Annual Meeting', icon: '🌐', isSystem: true },
        { id: 'gilead_meeting', name: 'Gilead Meeting', icon: '🎓', isSystem: true },
        { id: 'others', name: 'Others', icon: '📂', isSystem: true }
      ]
    },
    { id: 'spiritual_notes', name: 'Spiritual Notes', icon: '💡', isSystem: true, subCategories: [] }
  ];
}

function getInitialDb() {
  return {
    config: {
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      targetScore: 100,
      pointsPerQuestion: 5,
      availableYears: [2025, 2026, 2027, 2028]
    },
    categories: getDefaultCategories(),
    notes: [],
    topics: [],
    questions: [],
    history: []
  };
}

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.config) parsed.config = getInitialDb().config;
      if (!Array.isArray(parsed.config.availableYears)) {
        parsed.config.availableYears = [2025, 2026, 2027, 2028];
      }
      if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
        parsed.categories = getDefaultCategories();
      }
      if (!Array.isArray(parsed.notes)) parsed.notes = [];
      if (!Array.isArray(parsed.topics)) parsed.topics = [];
      if (!Array.isArray(parsed.questions)) parsed.questions = [];
      if (!Array.isArray(parsed.history)) parsed.history = [];
      return parsed;
    }
  } catch (err) {
    console.error('[DB] Error leyendo database.json:', err.message);
  }
  const init = getInitialDb();
  saveDb(init);
  return init;
}

function createLocalBackup(db) {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hourStr = String(now.getHours()).padStart(2, '0');
    const backupFile = path.join(BACKUPS_DIR, `backup_${dateStr}_${hourStr}h.json`);
    
    if (!fs.existsSync(backupFile)) {
      fs.writeFileSync(backupFile, JSON.stringify(db, null, 2), 'utf8');
      
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
        .map(f => ({ name: f, path: path.join(BACKUPS_DIR, f), time: fs.statSync(path.join(BACKUPS_DIR, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
      
      if (files.length > 30) {
        files.slice(30).forEach(f => {
          try { fs.unlinkSync(f.path); } catch (e) {}
        });
      }
    }
  } catch (err) {
    console.error('[DB Backup] Error creando copia de seguridad local:', err.message);
  }
}

function saveDb(db) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    createLocalBackup(db);
  } catch (err) {
    console.error('[DB] Error guardando database.json:', err.message);
  }
}

function getAllTopics() {
  const db = loadDb();
  return db.topics.map(t => {
    const questionsCount = db.questions.filter(q => q.topicId === t.id).length;
    return {
      ...t,
      questionsCount
    };
  });
}

function getTopicById(topicId) {
  const db = loadDb();
  return db.topics.find(t => t.id === topicId);
}

function shuffleQuestionOptions(q) {
  const letters = ['A', 'B', 'C', 'D'];
  const correctText = q.options[q.correctAnswer] || q.options.A;
  const texts = [q.options.A, q.options.B, q.options.C, q.options.D];

  for (let i = texts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [texts[i], texts[j]] = [texts[j], texts[i]];
  }

  const newOptions = {
    A: texts[0],
    B: texts[1],
    C: texts[2],
    D: texts[3]
  };

  const newCorrectIndex = texts.indexOf(correctText);
  const newCorrectLetter = newCorrectIndex >= 0 ? letters[newCorrectIndex] : 'A';

  return {
    ...q,
    options: newOptions,
    correctAnswer: newCorrectLetter
  };
}

function getQuestionsByTopicIds(topicIds = [], limit = 30) {
  const db = loadDb();
  let candidateQuestions = db.questions;
  
  if (topicIds && topicIds.length > 0) {
    candidateQuestions = candidateQuestions.filter(q => topicIds.includes(q.topicId));
  }
  
  // Barajar aleatoriamente las preguntas (Fisher-Yates)
  const shuffled = [...candidateQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Barajar también las opciones de cada pregunta para que la respuesta correcta nunca esté en una posición fija
  return shuffled.slice(0, limit).map(q => shuffleQuestionOptions(q));
}

function addQuestionsToTopic(topicId, newQuestions = []) {
  const db = loadDb();
  const topic = db.topics.find(t => t.id === topicId);
  if (!topic) throw new Error('Tema no encontrado');
  
  const saved = [];
  for (const q of newQuestions) {
    // Validar estructura de pregunta
    if (!q.question || !q.options || !q.correctAnswer) continue;
    
    // Evitar duplicados exactos en el mismo tema
    const existing = db.questions.find(
      x => x.topicId === topicId && x.question.trim().toLowerCase() === q.question.trim().toLowerCase()
    );
    if (existing) continue;
    
    const questionObj = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      topicId: topic.id,
      topicTitle: topic.title,
      question: q.question.trim(),
      options: {
        A: (q.options.A || '').trim(),
        B: (q.options.B || '').trim(),
        C: (q.options.C || '').trim(),
        D: (q.options.D || '').trim()
      },
      correctAnswer: q.correctAnswer.toUpperCase().trim(),
      explanation: (q.explanation || 'Respuesta basada en los apuntes del tema.').trim(),
      difficulty: q.difficulty || 'normal',
      stats: {
        timesAsked: 0,
        timesCorrect: 0
      },
      createdAt: new Date().toISOString()
    };
    
    const randomizedObj = shuffleQuestionOptions(questionObj);
    
    db.questions.push(randomizedObj);
    saved.push(randomizedObj);
  }
  
  topic.updatedAt = new Date().toISOString();
  saveDb(db);
  return saved;
}

function updateQuestionStat(questionId, isCorrect) {
  const db = loadDb();
  const q = db.questions.find(item => item.id === questionId);
  if (q) {
    if (!q.stats) q.stats = { timesAsked: 0, timesCorrect: 0 };
    q.stats.timesAsked += 1;
    if (isCorrect) q.stats.timesCorrect += 1;
    saveDb(db);
  }
}

function recordGame(gameSummary) {
  const db = loadDb();
  db.history.unshift({
    id: 'game_' + Date.now(),
    date: new Date().toISOString(),
    score: gameSummary.score || 0,
    targetScore: gameSummary.targetScore || 100,
    won: gameSummary.won || false,
    selectedTopics: gameSummary.selectedTopics || [],
    totalQuestions: gameSummary.totalQuestions || 0,
    correctAnswers: gameSummary.correctAnswers || 0
  });
  // Mantener últimos 50 juegos
  if (db.history.length > 50) db.history = db.history.slice(0, 50);
  saveDb(db);
}

function getConfig() {
  const db = loadDb();
  return db.config;
}

function updateConfig(newConfig) {
  const db = loadDb();
  db.config = {
    ...db.config,
    ...newConfig
  };
  saveDb(db);
  return db.config;
}

async function syncApuntesFolder() {
  if (!fs.existsSync(APUNTES_DIR)) {
    fs.mkdirSync(APUNTES_DIR, { recursive: true });
    return [];
  }
  
  const files = fs.readdirSync(APUNTES_DIR);
  const supportedExtensions = ['.txt', '.md', '.docx', '.pdf'];
  const db = loadDb();
  const discoveredTopics = [];
  
  for (const file of files) {
    if (file.startsWith('~$') || file.startsWith('.')) continue;
    const ext = path.extname(file).toLowerCase();
    if (!supportedExtensions.includes(ext)) continue;
    
    const filePath = path.join(APUNTES_DIR, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;
    
    // Si es un archivo .txt acompañante de un .pdf con el mismo nombre base, omitirlo
    if (ext === '.txt') {
      const companionPdf = file.replace(/\.txt$/i, '.pdf');
      if (files.includes(companionPdf)) {
        continue;
      }
    }

    // El título se toma del nombre del archivo sin extensión
    const title = path.basename(file, ext).replace(/[_-]+/g, ' ').trim();
    
    const fileKnownMap = {
      'books of the bible.docx': 'note_apuntes_books_bible',
      'jacob.txt': 'note_apuntes_jacob',
      'kings of juda and israel.txt': 'note_apuntes_kings_1',
      'kings of juda and israel 1.txt': 'note_apuntes_kings_2',
      'kings of juda and israel.pdf': 'note_apuntes_kings_1',
      'kings of juda and israel 1.pdf': 'note_apuntes_kings_2'
    };
    const knownNoteId = fileKnownMap[file.toLowerCase()];

    const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const tNorm = norm(title);
    const fNorm = norm(file);

    let topic = db.topics.find(t => {
      if (knownNoteId && (t.id === knownNoteId || t.noteId === knownNoteId)) return true;
      const ntNorm = norm(t.title);
      const nfNorm = norm(t.fileName);
      const nidNorm = norm(t.id || t.noteId);
      return (
        (nfNorm && (nfNorm === fNorm || nfNorm.includes(fNorm) || fNorm.includes(nfNorm))) ||
        ntNorm === tNorm ||
        ntNorm.includes(tNorm) ||
        tNorm.includes(ntNorm) ||
        nidNorm.includes(tNorm) ||
        nidNorm.includes(fNorm)
      );
    });

    if (!topic) {
      // Extraer muestra de texto para el resumen
      let sampleText = '';
      try {
        const fullText = await extractTextFromFile(filePath);
        sampleText = cleanText(fullText).slice(0, 500);
      } catch (err) {
        console.warn(`[Sync] No se pudo leer muestra de ${file}:`, err.message);
      }
      
      topic = {
        id: 'topic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title,
        fileName: file,
        fileExt: ext,
        fileSize: stat.size,
        rawTextSnippet: sampleText,
        createdAt: stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString()
      };
      db.topics.push(topic);
      discoveredTopics.push(topic);
    }

    // Sincronizar también en db.notes para que aparezca en el cuaderno
    const existingNote = db.notes.find(n => {
      if (knownNoteId && n.id === knownNoteId) return true;
      const ntNorm = norm(n.title);
      const nidNorm = norm(n.id);
      return (
        n.id === topic.id ||
        ntNorm === tNorm ||
        ntNorm.includes(tNorm) ||
        tNorm.includes(ntNorm) ||
        nidNorm.includes(tNorm) ||
        nidNorm.includes(fNorm)
      );
    });
    if (!existingNote) {
      let fullContent = '';
      try {
        const rawExtracted = await extractTextFromFile(filePath);
        fullContent = `# ${title}\n\n` + cleanText(rawExtracted);
      } catch (e) {
        fullContent = topic.rawTextSnippet ? `# ${title}\n\n` + topic.rawTextSnippet : `# ${title}\n\n(Archivo importado: ${file})`;
      }

      const noteFromTopic = {
        id: topic.id,
        category: 'spiritual_notes',
        subCategory: '',
        year: 2026,
        month: '',
        day: null,
        title,
        date: stat.mtime.toISOString().split('T')[0],
        icon: '📜',
        content: fullContent,
        tags: [ext.replace('.', ''), 'apuntes', 'estudio personal'],
        createdAt: stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString()
      };
      db.notes.push(noteFromTopic);
    }
  }
  
  saveDb(db);
  return discoveredTopics;
}

function seedInitialNotesIfEmpty(db) {
  if (db.notes && db.notes.length > 0) return;

  const now = new Date().toISOString();
  const sampleNotes = [
    {
      id: 'note_daily_2026_09_17',
      category: 'daily_text',
      year: 2026,
      month: 'Septiembre',
      day: 17,
      subCategory: '',
      title: 'Texto Diario: El valor incalculable de la fe sincera',
      date: '2026-09-17',
      icon: '🌅',
      content: `# Texto Diario — 17 de Septiembre de 2026\n\n> "La fe es la certeza de lo que se espera, la demostración de realidades que no se ven." — Hebreos 11:1\n\n### Puntos Clave del Comentario Matutino:\n- La fe verdadera no es una simple emoción pasajera, sino una convicción basada en pruebas sólidas.\n- Los patriarcas como Abrahán y Jacob confiaron plenamente en las promesas de Dios a pesar de no ver su cumplimiento inmediato.\n- En momentos de incertidumbre, orar y meditar en la fidelidad demostrada por Jehová fortalece nuestro corazón.\n\n💡 **Aplicación personal:** Dedicar hoy 10 minutos a repasar cómo Jehová ha respondido mis oraciones recientes.`,
      tags: ['fe', 'oración', 'hebreos'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'note_event_bethel_01',
      category: 'events',
      subCategory: 'bethel_talks',
      year: 2026,
      month: '',
      day: null,
      title: 'Bethel Talk: Cómo mantener la devoción en un mundo cambiante',
      date: '2026-09-10',
      icon: '🎤',
      content: `# Discurso Matutino de Betel\n\n**Discursante:** Miembro del Comité de Sucursal\n**Tema principal:** Fidelidad en las pequeñas responsabilidades cotidianas (Lucas 16:10).\n\n### Ideas destacadas:\n1. La rutina espiritual diaria (lectura bíblica, consideración del texto diario y oración constante) es el ancla que protege nuestra espiritualidad.\n2. La humildad frente a las correcciones o cambios de circunstancias nos acerca más a nuestros hermanos.\n3. Mantener el ojo sencillo y enfocarse en el ministerio y en las promesas del Reino.`,
      tags: ['bethel', 'fidelidad', 'humildad'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'note_spiritual_01',
      category: 'spiritual_notes',
      subCategory: '',
      year: 2026,
      month: '',
      day: null,
      title: 'Perlas Espirituales: La paciencia de Jacob en Harán',
      date: '2026-09-05',
      icon: '💡',
      content: `# Estudio Personal: La perseverancia de Jacob\n\n- **Lectura:** Génesis 29 al 31.\n- A pesar de los engaños continuos de su tío Labán, quien le cambió el salario diez veces, Jacob nunca tomó represalias con maldad.\n- Puso su confianza en que Dios haría justicia a su debido tiempo.\n- **Lección práctica:** Cuando alguien en el trabajo o en la vida diaria nos trate injustamente, imitar la paciencia de Jacob y dejar los asuntos en manos de Dios.`,
      tags: ['jacob', 'paciencia', 'estudio personal'],
      createdAt: now,
      updatedAt: now
    }
  ];

  db.notes = sampleNotes;

  // Sincronizar estas notas en topics
  sampleNotes.forEach(note => {
    const topicObj = {
      id: note.id,
      title: note.title,
      isNote: true,
      noteId: note.id,
      category: note.category,
      subCategory: note.subCategory || '',
      date: note.date,
      icon: note.icon || '📝',
      rawTextSnippet: (note.content || '').slice(0, 500),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    };
    const idx = db.topics.findIndex(t => t.id === note.id);
    if (idx >= 0) db.topics[idx] = topicObj;
    else db.topics.push(topicObj);
  });

  saveDb(db);
}

function getAllNotes(filter = {}) {
  const db = loadDb();
  seedInitialNotesIfEmpty(db);

  let notes = db.notes || [];

  if (filter.category) {
    notes = notes.filter(n => n.category === filter.category);
  }
  if (filter.subCategory) {
    notes = notes.filter(n => n.subCategory === filter.subCategory);
  }
  if (filter.year) {
    notes = notes.filter(n => Number(n.year) === Number(filter.year));
  }
  if (filter.month) {
    notes = notes.filter(n => String(n.month).toLowerCase() === String(filter.month).toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    notes = notes.filter(n => 
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some(tag => tag.toLowerCase().includes(q))) ||
      (n.date && n.date.includes(q))
    );
  }

  // Añadir contador de preguntas disponibles para cada nota
  return notes.map(n => {
    const questionsCount = (db.questions || []).filter(q => q.topicId === n.id).length;
    return {
      ...n,
      questionsCount
    };
  }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

function getNoteById(id) {
  const db = loadDb();
  const note = (db.notes || []).find(n => n.id === id);
  if (!note) return null;
  const questions = (db.questions || []).filter(q => q.topicId === id);
  return {
    ...note,
    questions,
    questionsCount: questions.length
  };
}

function createNote(data) {
  const db = loadDb();
  if (!Array.isArray(db.notes)) db.notes = [];

  const now = new Date().toISOString();
  const id = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const dateStr = data.date || new Date().toISOString().split('T')[0];
  const dateParsed = parseDateComponents(dateStr);

  const year = data.year ? Number(data.year) : (dateParsed ? dateParsed.year : 2026);
  const month = data.month || (dateParsed ? dateParsed.month : '');
  const day = data.day ? Number(data.day) : (dateParsed ? dateParsed.day : null);

  if (year && Array.isArray(db.config.availableYears) && !db.config.availableYears.includes(year)) {
    db.config.availableYears.push(year);
    db.config.availableYears.sort((a, b) => a - b);
  }

  const newNote = {
    id,
    category: data.category || 'spiritual_notes', // 'daily_text', 'events', 'spiritual_notes'
    subCategory: data.subCategory || '',
    year: (data.category === 'daily_text' || year) ? year : null,
    month,
    day,
    title: (data.title || 'Nueva Nota').trim(),
    date: dateStr,
    icon: data.icon || (data.category === 'daily_text' ? '🌅' : data.category === 'events' ? '🏛️' : '💡'),
    content: data.content || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: now,
    updatedAt: now
  };

  db.notes.unshift(newNote);

  // Sincronizar en topics para poder jugarla
  const topicObj = {
    id: newNote.id,
    title: newNote.title,
    isNote: true,
    noteId: newNote.id,
    category: newNote.category,
    subCategory: newNote.subCategory || '',
    date: newNote.date,
    icon: newNote.icon,
    rawTextSnippet: newNote.content.slice(0, 500),
    createdAt: now,
    updatedAt: now
  };
  db.topics.unshift(topicObj);

  saveDb(db);
  return newNote;
}

function updateNote(id, data) {
  const db = loadDb();
  const index = (db.notes || []).findIndex(n => n.id === id);
  if (index === -1) return null;

  const current = db.notes[index];
  const now = new Date().toISOString();

  const dateStr = data.date || current.date || new Date().toISOString().split('T')[0];
  const dateParsed = parseDateComponents(dateStr);

  const year = data.year !== undefined ? Number(data.year) : (dateParsed ? dateParsed.year : current.year);
  const month = data.month !== undefined ? data.month : (dateParsed ? dateParsed.month : current.month);
  const day = data.day !== undefined ? Number(data.day) : (dateParsed ? dateParsed.day : current.day);

  if (year && Array.isArray(db.config.availableYears) && !db.config.availableYears.includes(year)) {
    db.config.availableYears.push(year);
    db.config.availableYears.sort((a, b) => a - b);
  }

  const category = data.category !== undefined ? data.category : current.category;
  const subCategory = category === 'events' ? (data.subCategory !== undefined ? data.subCategory : (current.subCategory || '')) : '';

  let content = current.content;
  if (data.content !== undefined) {
    if (typeof data.content === 'string' && data.content.trim().length === 0 && current.content && current.content.trim().length > 40) {
      console.warn(`[DB] Intento de sobreescribir contenido existente de '${current.title}' con texto vacío bloqueado por seguridad.`);
    } else {
      content = data.content;
    }
  }

  const updatedNote = {
    ...current,
    ...data,
    category,
    subCategory,
    content,
    date: dateStr,
    year,
    month,
    day,
    id: current.id, // proteger ID
    createdAt: current.createdAt,
    updatedAt: now
  };

  db.notes[index] = updatedNote;

  // Actualizar también en topics
  const topicIndex = (db.topics || []).findIndex(t => t.id === id || t.noteId === id);
  if (topicIndex >= 0) {
    db.topics[topicIndex] = {
      ...db.topics[topicIndex],
      title: updatedNote.title,
      category: updatedNote.category,
      subCategory: updatedNote.subCategory || '',
      date: updatedNote.date,
      icon: updatedNote.icon,
      rawTextSnippet: (updatedNote.content || '').slice(0, 500),
      updatedAt: now
    };
  }

  saveDb(db);
  return updatedNote;
}

function getMonthDocument(year, month) {
  const numYear = parseInt(year, 10) || 2026;
  const mName = (month || 'Septiembre').trim();
  const docId = `daily_text_${numYear}_${mName}`;

  const db = loadDb();
  if (!Array.isArray(db.notes)) db.notes = [];

  // Buscar si ya existe el documento mensual
  let monthDoc = db.notes.find(n => 
    n.id === docId || 
    (n.category === 'daily_text' && Number(n.year) === numYear && n.month === mName && n.isMonthDoc)
  );

  if (monthDoc) {
    return monthDoc;
  }

  // Comprobar si existen notas diarias sueltas previas para consolidar
  const legacyNotes = db.notes.filter(n => 
    n.category === 'daily_text' && 
    Number(n.year) === numYear && 
    n.month === mName && 
    !n.isMonthDoc
  );

  const mIdx = SPANISH_MONTHS.indexOf(mName);
  const mNum = mIdx >= 0 ? mIdx + 1 : 9;
  const dateStr = `${numYear}-${String(mNum).padStart(2, '0')}-01`;

  if (legacyNotes.length > 0) {
    // Ordenar cronológicamente por día ascendente
    legacyNotes.sort((a, b) => (Number(a.day) || 1) - (Number(b.day) || 1));

    let content = `# 🌅 Daily Text Comments — ${mName} ${numYear}\n\n`;
    legacyNotes.forEach(ln => {
      const dNum = ln.day || (parseDateComponents(ln.date) ? parseDateComponents(ln.date).day : 1);
      const dTitle = ln.title || `Entrada del día ${dNum}`;
      content += `---\n## 📅 DÍA ${dNum} • ${dTitle}\n\n${(ln.content || '').trim()}\n\n`;
    });

    monthDoc = {
      id: docId,
      category: 'daily_text',
      subCategory: '',
      isMonthDoc: true,
      year: numYear,
      month: mName,
      day: null,
      title: `Daily Text — ${mName} ${numYear}`,
      date: dateStr,
      icon: '🌅',
      content: content.trim() + '\n',
      tags: ['daily_text', String(numYear), mName],
      createdAt: legacyNotes[0].createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Reemplazar las notas individuales por el documento mensual consolidado
    db.notes = db.notes.filter(n => 
      !(n.category === 'daily_text' && Number(n.year) === numYear && n.month === mName && !n.isMonthDoc)
    );
    db.notes.unshift(monthDoc);

    // Actualizar topics
    db.topics = (db.topics || []).filter(t => t.id !== docId && !legacyNotes.some(ln => ln.id === t.id));
    db.topics.unshift({
      id: monthDoc.id,
      title: monthDoc.title,
      isNote: true,
      noteId: monthDoc.id,
      category: 'daily_text',
      subCategory: '',
      date: monthDoc.date,
      icon: '🌅',
      rawTextSnippet: monthDoc.content.slice(0, 500),
      createdAt: monthDoc.createdAt,
      updatedAt: monthDoc.updatedAt
    });

    saveDb(db);
    return monthDoc;
  }

  // Si no hay notas previas, crear un documento mensual nuevo y listo
  monthDoc = {
    id: docId,
    category: 'daily_text',
    subCategory: '',
    isMonthDoc: true,
    year: numYear,
    month: mName,
    day: null,
    title: `Daily Text — ${mName} ${numYear}`,
    date: dateStr,
    icon: '🌅',
    content: `# 🌅 Daily Text Comments — ${mName} ${numYear}\n\n*Cuaderno mensual de estudio. Pulsa "+ Añadir Día a ${mName}" para registrar tus apuntes matutinos.*\n`,
    tags: ['daily_text', String(numYear), mName],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.notes.unshift(monthDoc);
  db.topics = db.topics || [];
  db.topics.unshift({
    id: monthDoc.id,
    title: monthDoc.title,
    isNote: true,
    noteId: monthDoc.id,
    category: 'daily_text',
    subCategory: '',
    date: monthDoc.date,
    icon: '🌅',
    rawTextSnippet: monthDoc.content.slice(0, 500),
    createdAt: monthDoc.createdAt,
    updatedAt: monthDoc.updatedAt
  });

  saveDb(db);
  return monthDoc;
}

function appendDayToMonth(year, month, dayData = {}) {
  const monthDoc = getMonthDocument(year, month);
  const db = loadDb();
  const index = (db.notes || []).findIndex(n => n.id === monthDoc.id);

  const dayNum = parseInt(dayData.day, 10) || 1;
  const dayTitle = (dayData.title || `Entrada del día ${dayNum}`).trim();
  const scripture = (dayData.scripture || '').trim();
  const weekday = dayData.weekday || 'Día';
  const customContent = (dayData.content || '').trim();

  // Al principio de la entrada: Fecha marcada y Título destacado
  let dayBlock = `\n\n---\n## 📅 DÍA ${dayNum} • Fecha: ${weekday}, ${dayNum} de ${month} de ${year}\n# ✍️ Título: ${dayTitle}\n`;
  if (scripture) {
    dayBlock += `> 📖 **Texto Bíblico:** "${scripture}"\n\n`;
  }
  if (customContent) {
    dayBlock += customContent + '\n';
  } else {
    dayBlock += `### Puntos Clave del Estudio:\n- \n- \n\n💡 **Aplicación personal:**\n`;
  }

  const now = new Date().toISOString();
  const updatedContent = ((monthDoc.content || '').trim() + dayBlock).trim() + '\n';

  const updatedDoc = {
    ...monthDoc,
    content: updatedContent,
    updatedAt: now
  };

  if (index >= 0) {
    db.notes[index] = updatedDoc;
  } else {
    db.notes.unshift(updatedDoc);
  }

  // Sincronizar topic
  const topicIdx = (db.topics || []).findIndex(t => t.id === monthDoc.id || t.noteId === monthDoc.id);
  if (topicIdx >= 0) {
    db.topics[topicIdx].rawTextSnippet = updatedDoc.content.slice(0, 500);
    db.topics[topicIdx].updatedAt = now;
  }

  saveDb(db);
  return updatedDoc;
}

function getFolderDocuments(category, subCategory = '') {
  const db = loadDb();
  const notes = db.notes || [];

  if (category === 'events') {
    if (subCategory) {
      return notes.filter(n => n.category === 'events' && n.subCategory === subCategory);
    }
    return notes.filter(n => n.category === 'events');
  }

  if (category === 'spiritual_notes') {
    return notes.filter(n => n.category === 'spiritual_notes');
  }

  if (category === 'daily_text') {
    return notes.filter(n => n.category === 'daily_text');
  }

  return notes;
}

function getAvailableYears() {
  const db = loadDb();
  const years = new Set(db.config.availableYears || [2025, 2026, 2027, 2028]);
  (db.notes || []).forEach(n => {
    if (n.year) years.add(Number(n.year));
  });
  return Array.from(years).sort((a, b) => a - b);
}

function addAvailableYear(year) {
  const numYear = parseInt(year, 10);
  if (isNaN(numYear) || numYear < 1900 || numYear > 2100) return getAvailableYears();
  const db = loadDb();
  if (!Array.isArray(db.config.availableYears)) db.config.availableYears = [2025, 2026, 2027, 2028];
  if (!db.config.availableYears.includes(numYear)) {
    db.config.availableYears.push(numYear);
    db.config.availableYears.sort((a, b) => a - b);
    saveDb(db);
  }
  return db.config.availableYears;
}

function deleteTopic(topicId) {
  const db = loadDb();
  const topicIndex = db.topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return false;

  const topic = db.topics[topicIndex];

  // Eliminar preguntas asociadas
  db.questions = db.questions.filter(q => q.topicId !== topicId);

  // Eliminar archivo de apuntes si existe
  if (topic.fileName) {
    const filePath = path.join(APUNTES_DIR, topic.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('No se pudo borrar archivo físico:', e.message);
      }
    }
  }

  // Eliminar nota correspondiente si fue creada como nota
  if (topic.isNote || topic.noteId) {
    const nId = topic.noteId || topic.id;
    db.notes = (db.notes || []).filter(n => n.id !== nId);
  }

  db.topics.splice(topicIndex, 1);
  saveDb(db);
  return true;
}

function deleteNote(id) {
  const db = loadDb();
  const noteIndex = (db.notes || []).findIndex(n => n.id === id);
  if (noteIndex === -1) return false;

  db.notes.splice(noteIndex, 1);

  // Eliminar de topics y de preguntas asociadas
  db.topics = (db.topics || []).filter(t => t.id !== id && t.noteId !== id);
  db.questions = (db.questions || []).filter(q => q.topicId !== id);

  saveDb(db);
  return true;
}

function searchDatabase(query) {
  if (!query || typeof query !== 'string') {
    return { query: '', totalMatches: 0, notes: [], topics: [], questions: [] };
  }

  const db = loadDb();
  const term = query.toLowerCase().trim();
  if (term.length === 0) {
    return { query: '', totalMatches: 0, notes: [], topics: [], questions: [] };
  }

  const matchedNotes = [];
  for (const n of (db.notes || [])) {
    const titleMatch = n.title && n.title.toLowerCase().includes(term);
    const contentMatch = n.content && n.content.toLowerCase().includes(term);
    const tagMatch = n.tags && n.tags.some(t => t.toLowerCase().includes(term));
    const dateMatch = n.date && n.date.includes(term);

    if (titleMatch || contentMatch || tagMatch || dateMatch) {
      let snippet = '';
      if (contentMatch) {
        const lower = n.content.toLowerCase();
        const pos = lower.indexOf(term);
        const start = Math.max(0, pos - 50);
        const end = Math.min(n.content.length, pos + term.length + 50);
        snippet = (start > 0 ? '...' : '') + n.content.substring(start, end).replace(/\n/g, ' ') + (end < n.content.length ? '...' : '');
      } else {
        snippet = (n.content || '').substring(0, 100).replace(/\n/g, ' ') + '...';
      }

      matchedNotes.push({
        ...n,
        matchSnippet: snippet,
        matchedIn: titleMatch ? 'title' : contentMatch ? 'content' : tagMatch ? 'tag' : 'date'
      });
    }
  }

  const matchedTopics = [];
  for (const t of (db.topics || [])) {
    if (t.isNote) continue; // ya incluido en notes
    const titleMatch = t.title && t.title.toLowerCase().includes(term);
    const snippetMatch = t.rawTextSnippet && t.rawTextSnippet.toLowerCase().includes(term);
    if (titleMatch || snippetMatch) {
      matchedTopics.push(t);
    }
  }

  const matchedQuestions = [];
  for (const q of (db.questions || [])) {
    const qMatch = q.question && q.question.toLowerCase().includes(term);
    const expMatch = q.explanation && q.explanation.toLowerCase().includes(term);
    if (qMatch || expMatch) {
      matchedQuestions.push(q);
    }
  }

  return {
    query,
    totalMatches: matchedNotes.length + matchedTopics.length + matchedQuestions.length,
    notes: matchedNotes,
    topics: matchedTopics,
    questions: matchedQuestions
  };
}

function getAllCategories() {
  const db = loadDb();
  if (!Array.isArray(db.categories) || db.categories.length === 0) {
    db.categories = getDefaultCategories();
    saveDb(db);
  }
  return db.categories;
}

function addCategory({ name, icon, parentId }) {
  if (!name || !name.trim()) throw new Error('El nombre de la categoría es obligatorio');
  const db = loadDb();
  if (!Array.isArray(db.categories) || db.categories.length === 0) {
    db.categories = getDefaultCategories();
  }

  const cleanName = name.trim();
  const cleanIcon = (icon && icon.trim()) ? icon.trim() : (parentId ? '📂' : '📁');
  const catId = 'cat_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);

  if (parentId) {
    const parent = db.categories.find(c => c.id === parentId);
    if (!parent) throw new Error('Categoría padre no encontrada');
    if (!Array.isArray(parent.subCategories)) parent.subCategories = [];
    const newSub = {
      id: catId,
      name: cleanName,
      icon: cleanIcon,
      isSystem: false,
      parentId: parentId
    };
    parent.subCategories.push(newSub);
    saveDb(db);
    return newSub;
  } else {
    const newCat = {
      id: catId,
      name: cleanName,
      icon: cleanIcon,
      isSystem: false,
      subCategories: []
    };
    db.categories.push(newCat);
    saveDb(db);
    return newCat;
  }
}

function deleteCategory(categoryId) {
  const db = loadDb();
  if (!Array.isArray(db.categories)) return false;

  const catIndex = db.categories.findIndex(c => c.id === categoryId);
  if (catIndex !== -1) {
    if (db.categories[catIndex].isSystem) {
      throw new Error('No se pueden eliminar las categorías del sistema');
    }
    db.categories.splice(catIndex, 1);
    saveDb(db);
    return true;
  }

  for (const cat of db.categories) {
    if (Array.isArray(cat.subCategories)) {
      const subIdx = cat.subCategories.findIndex(s => s.id === categoryId);
      if (subIdx !== -1) {
        if (cat.subCategories[subIdx].isSystem) {
          throw new Error('No se pueden eliminar las subcategorías del sistema');
        }
        cat.subCategories.splice(subIdx, 1);
        saveDb(db);
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  loadDb,
  saveDb,
  getAllTopics,
  getTopicById,
  getQuestionsByTopicIds,
  addQuestionsToTopic,
  updateQuestionStat,
  recordGame,
  getConfig,
  updateConfig,
  syncApuntesFolder,
  deleteTopic,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getMonthDocument,
  appendDayToMonth,
  getFolderDocuments,
  searchDatabase,
  getAvailableYears,
  addAvailableYear,
  getAllCategories,
  addCategory,
  deleteCategory,
  DB_PATH,
  BACKUPS_DIR,
  APUNTES_DIR
};

