const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:9000', 'http://127.0.0.1:9000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Globalni prefiks za API rute
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.url}`);
  next();
});

// JWT Secret
const JWT_SECRET = "bebetter-secret-key";

// Database connection
const pool = mysql.createPool({
  host: "ucka.veleri.hr",
  user: "sjuresko",
  password: "11",
  database: "sjuresko",
  connectionLimit: 10
});

// Convert pool.query to promise version
const query = (sql, params) => new Promise((resolve, reject) => {
  pool.query(sql, params, (error, results) => {
    if (error) reject(error);
    else resolve(results);
  });
});

// Middleware za provjeru admin uloge
const authenticateAdmin = (req, res, next) => {
  console.log('Admin middleware - user:', req.user);
  if (req.user && req.user.uloga === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Pristup dozvoljen samo administratorima' });
  }
};

// Middleware za provjeru tokena
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Nedostaje token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verifikacija error:', err);
      return res.status(403).json({ error: 'Neispravan token' });
    }
    console.log('Verificiran korisnik:', user);
    req.user = user;
    next();
  });
};

// API endpoints za FAQ
app.get('/api/faq', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM FAQ ORDER BY id DESC');
    console.log('FAQ podaci:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dohvaćanju FAQ-a:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju FAQ-a' });
  }
});

app.post('/api/faq', authenticateToken, async (req, res) => {
  if (req.user.uloga !== 'admin') {
    return res.status(403).json({ error: 'Samo administratori mogu dodavati FAQ' });
  }

  const { pitanje, odgovor, kategorija } = req.body;
  try {
    if (!pitanje || !odgovor) {
      return res.status(400).json({ error: 'Pitanje i odgovor su obavezni' });
    }

    const result = await query(
      'INSERT INTO FAQ (pitanje, odgovor, kategorija) VALUES (?, ?, ?)',
      [pitanje, odgovor, kategorija]
    );
    
    const [newFaq] = await query('SELECT * FROM FAQ WHERE id = ?', [result.insertId]);
    res.status(201).json(newFaq);
  } catch (error) {
    console.error('Greška pri dodavanju FAQ-a:', error);
    res.status(500).json({ error: 'Greška pri dodavanju FAQ-a' });
  }
});

app.put('/api/faq/:id', authenticateToken, async (req, res) => {
  if (req.user.uloga !== 'admin') {
    return res.status(403).json({ error: 'Samo administratori mogu uređivati FAQ' });
  }

  const { id } = req.params;
  const { pitanje, odgovor, kategorija } = req.body;
  try {
    await query(
      'UPDATE FAQ SET pitanje = ?, odgovor = ?, kategorija = ? WHERE id = ?',
      [pitanje, odgovor, kategorija, id]
    );
    res.json({ id, pitanje, odgovor, kategorija });
  } catch (error) {
    res.status(500).json({ error: 'Greška pri ažuriranju FAQ-a' });
  }
});

app.delete('/api/faq/:id', authenticateToken, async (req, res) => {
  if (req.user.uloga !== 'admin') {
    return res.status(403).json({ error: 'Samo administratori mogu brisati FAQ' });
  }

  const { id } = req.params;
  try {
    await query('DELETE FROM FAQ WHERE id = ?', [id]);
    res.json({ message: 'FAQ uspješno obrisan' });
  } catch (error) {
    res.status(500).json({ error: 'Greška pri brisanju FAQ-a' });
  }
});

// API endpoints za obavijesti
app.get('/api/notices', async (req, res) => {
  try {
    const rows = await query(`
      SELECT o.*, k.ime, k.prezime 
      FROM Obavijesti o 
      LEFT JOIN Korisnici k ON o.autor_id = k.id 
      ORDER BY o.datum_objave DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Greška pri dohvaćanju obavijesti:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju obavijesti' });
  }
});

app.post('/api/notices', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { naslov, sadrzaj } = req.body;
    const result = await query(
      'INSERT INTO Obavijesti (naslov, sadrzaj, autor_id, datum_objave) VALUES (?, ?, ?, NOW())',
      [naslov, sadrzaj, req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Obavijest uspješno dodana' });
  } catch (error) {
    console.error('Greška pri dodavanju obavijesti:', error);
    res.status(500).json({ error: 'Greška pri dodavanju obavijesti' });
  }
});

app.put('/api/notices/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { naslov, sadrzaj } = req.body;
    await query(
      'UPDATE Obavijesti SET naslov = ?, sadrzaj = ? WHERE id = ?',
      [naslov, sadrzaj, id]
    );
    res.json({ message: 'Obavijest uspješno ažurirana' });
  } catch (error) {
    console.error('Greška pri ažuriranju obavijesti:', error);
    res.status(500).json({ error: 'Greška pri ažuriranju obavijesti' });
  }
});

app.delete('/api/notices/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM Obavijesti WHERE id = ?', [id]);
    res.json({ message: 'Obavijest uspješno obrisana' });
  } catch (error) {
    console.error('Greška pri brisanju obavijesti:', error);
    res.status(500).json({ error: 'Greška pri brisanju obavijesti' });
  }
});

// API endpoints za vjezbe
app.get('/api/vjezbe', authenticateToken, async (req, res) => {
  try {
    const vjezbe = await query('SELECT * FROM Vjezbe');
    console.log('Dohvaćene vježbe iz baze:', vjezbe);
    res.json(vjezbe);
  } catch (error) {
    console.error('Greška pri dohvaćanju vježbi:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju vježbi' });
  }
});

// API endpoints za dnevnik treninga
app.get('/api/dnevnik', authenticateToken, async (req, res) => {
  try {
    console.log('Dohvaćanje treninga za korisnika:', req.user.id);
    
    // Dohvati sve treninge
    const treninzi = await query(
      `SELECT t.*, 
              GROUP_CONCAT(
                JSON_OBJECT(
                  'id', tv.id,
                  'vjezba_id', tv.vjezba_id,
                  'naziv', v.naziv,
                  'broj_setova', tv.broj_setova,
                  'broj_ponavljanja', tv.broj_ponavljanja,
                  'tezina', tv.tezina
                )
              ) as vjezbe
       FROM DnevnikTreninga t
       LEFT JOIN TreningVjezbe tv ON t.id = tv.trening_id
       LEFT JOIN Vjezbe v ON tv.vjezba_id = v.id
       WHERE t.korisnik_id = ? AND t.zavrsen = 0
       GROUP BY t.id
       ORDER BY t.datum DESC, t.id DESC`,
      [req.user.id]
    );

    // Pretvori string vjezbi u JSON array
    const treninziSVjezbama = treninzi.map(t => ({
      ...t,
      vjezbe: t.vjezbe ? JSON.parse(`[${t.vjezbe}]`) : []
    }));

    console.log('Dohvaćeni treninzi:', treninziSVjezbama);
    res.json(treninziSVjezbama);
  } catch (error) {
    console.error('Greška pri dohvaćanju treninga:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju treninga' });
  }
});

app.post('/api/dnevnik', authenticateToken, async (req, res) => {
  try {
    console.log('Primljeni podaci za novi trening:', req.body);
    const { tip_treninga, datum, trajanje, tezina_treninga, biljeske, vjezbe } = req.body;

    // Prvo spremi trening
    const result = await query(
      'INSERT INTO DnevnikTreninga (korisnik_id, tip_treninga, datum, trajanje, tezina_treninga, biljeske) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, tip_treninga, datum, trajanje, tezina_treninga || null, biljeske || null]
    );

    const treningId = result.insertId;
    console.log('Spremljen trening s ID:', treningId);

    // Ako postoje vježbe, spremi ih
    if (Array.isArray(vjezbe) && vjezbe.length > 0) {
      console.log('Spremanje vježbi za trening:', vjezbe);
      
      // Pripremi SQL za batch insert
      const values = vjezbe.map(v => [
        treningId,
        v.vjezba_id,
        v.broj_setova || null,
        v.broj_ponavljanja || null,
        v.tezina || null
      ]);
      
      await query(
        `INSERT INTO TreningVjezbe 
         (trening_id, vjezba_id, broj_setova, broj_ponavljanja, tezina) 
         VALUES ?`,
        [values]
      );
      
      console.log('Vježbe uspješno spremljene');
    }

    res.json({ 
      id: treningId,
      message: 'Trening uspješno dodan' 
    });
  } catch (error) {
    console.error('Greška pri dodavanju treninga:', error);
    res.status(500).json({ error: 'Greška pri dodavanju treninga' });
  }
});

app.delete('/api/dnevnik/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Provjeri postoji li trening i pripada li korisniku
    const [trening] = await query(
      'SELECT * FROM DnevnikTreninga WHERE id = ? AND korisnik_id = ?',
      [id, req.user.id]
    );

    if (!trening) {
      return res.status(404).json({ error: 'Trening nije pronađen' });
    }

    // Prvo obriši povezane vježbe
    await query('DELETE FROM TreningVjezbe WHERE trening_id = ?', [id]);
    
    // Zatim obriši trening
    await query('DELETE FROM DnevnikTreninga WHERE id = ?', [id]);

    res.json({ message: 'Trening uspješno obrisan' });
  } catch (error) {
    console.error('Greška pri brisanju treninga:', error);
    res.status(500).json({ error: 'Greška pri brisanju treninga' });
  }
});

// Endpoint za završavanje treninga
app.post('/api/dnevnik/:id/zavrsi', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Provjeri postoji li trening i pripada li korisniku
    const [trening] = await query(
      `SELECT t.*, 
              GROUP_CONCAT(
                JSON_OBJECT(
                  'id', tv.id,
                  'vjezba_id', tv.vjezba_id,
                  'naziv', v.naziv,
                  'broj_setova', tv.broj_setova,
                  'broj_ponavljanja', tv.broj_ponavljanja,
                  'tezina', tv.tezina
                )
              ) as vjezbe
       FROM DnevnikTreninga t
       LEFT JOIN TreningVjezbe tv ON t.id = tv.trening_id
       LEFT JOIN Vjezbe v ON tv.vjezba_id = v.id
       WHERE t.id = ? AND t.korisnik_id = ?
       GROUP BY t.id`,
      [id, req.user.id]
    );

    if (!trening) {
      return res.status(404).json({ error: 'Trening nije pronađen' });
    }

    // Označi trening kao završen
    await query(
      'UPDATE DnevnikTreninga SET zavrsen = 1 WHERE id = ?',
      [id]
    );

    // Dodaj u završene treninge
    await query(
      'INSERT INTO ZavrseniTreninzi (korisnik_id, trening_id, datum , trajanje) VALUES (?, ?, NOW(), ?)',
      [req.user.id, id, trening.trajanje]
    );

    res.json({ message: 'Trening uspješno završen' });
  } catch (error) {
    console.error('Greška pri završavanju treninga:', error);
    res.status(500).json({ error: 'Greška pri završavanju treninga' });
  }
});

// API endpoints za planove treninga
app.get('/api/planovi', authenticateToken, async (req, res) => {
  try {
    const planovi = await query(`
      SELECT 
        p.*,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', pv.id,
            'vjezba_id', pv.vjezba_id,
            'naziv', v.naziv,
            'preporuceni_setovi', pv.preporuceni_setovi,
            'preporucena_ponavljanja', pv.preporucena_ponavljanja,
            'redoslijed', pv.redoslijed
          )
        ) as vjezbe
      FROM PlanoviTreninga p
      LEFT JOIN PlanVjezbe pv ON p.id = pv.plan_id
      LEFT JOIN Vjezbe v ON pv.vjezba_id = v.id
      GROUP BY p.id
      ORDER BY p.naziv
    `);

    res.json(planovi);
  } catch (error) {
    console.error('Greška pri dohvaćanju planova:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju planova' });
  }
});

app.post('/api/planovi', authenticateToken, async (req, res) => {
  try {
    const { naziv, opis, tezina_plana, procijenjeno_trajanje, vjezbe } = req.body;

    const result = await query(
      'INSERT INTO PlanoviTreninga (naziv, opis, tezina_plana, trajanje_dana, korisnik_id) VALUES (?, ?, ?, ?, ?)',
      [naziv, opis, tezina_plana, procijenjeno_trajanje, req.user.id]
    );

    if (vjezbe && vjezbe.length > 0) {
      console.log('Spremanje vježbi:', vjezbe);
      
      // Pripremi SQL za batch insert
      const vjezbeValues = vjezbe.map(v => [
        result.insertId,
        v.vjezba_id,
        v.preporuceni_setovi,
        v.preporucena_ponavljanja,
        v.tezina
      ]);
      
      await query(
        'INSERT INTO PlanVjezbe (plan_id, vjezba_id, preporuceni_setovi, preporucena_ponavljanja, tezina) VALUES ?',
        [vjezbeValues]
      );
      
      console.log('Vježbe spremljene');
    }

    res.status(201).json({ message: 'Plan treninga uspješno dodan', id: result.insertId });
  } catch (error) {
    console.error('Greška pri dodavanju plana:', error);
    res.status(500).json({ error: 'Greška pri dodavanju plana' });
  }
});

// API endpoint za dodavanje vježbe u plan
app.post('/api/planovi/:planId/vjezbe', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const { dan_index, vjezba } = req.body;
    
    console.log('Primljeni podaci:', { planId, dan_index, vjezba });

    // Provjeri postoji li plan
    const planovi = await query(
      'SELECT * FROM PlanoviTreninga WHERE id = ? AND korisnik_id = ?',
      [planId, req.user.id]
    );
    
    console.log('Pronađeni planovi:', planovi);

    if (!planovi || planovi.length === 0) {
      return res.status(404).json({ error: 'Plan nije pronađen' });
    }

    // Dodaj vježbu u plan
    const result = await query(
      'INSERT INTO PlanVjezbe (plan_id, vjezba_id, dan_index, broj_setova, broj_ponavljanja, tezina) VALUES (?, ?, ?, ?, ?, ?)',
      [planId, vjezba.vjezba_id, dan_index, vjezba.broj_setova, vjezba.broj_ponavljanja, vjezba.tezina || 0]
    );
    
    console.log('Rezultat dodavanja:', result);

    res.status(201).json({
      id: result.insertId,
      plan_id: planId,
      vjezba_id: vjezba.vjezba_id,
      dan_index,
      broj_setova: vjezba.broj_setova,
      broj_ponavljanja: vjezba.broj_ponavljanja,
      tezina: vjezba.tezina || 0
    });
  } catch (error) {
    console.error('Greška pri dodavanju vježbe u plan:', error);
    res.status(500).json({ error: 'Greška pri dodavanju vježbe u plan' });
  }
});

// API endpoints za napredak
app.get('/api/napredak', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM Napredak WHERE korisnik_id = ? ORDER BY datum DESC',
      [req.user.id]
    );
    res.json(result);
  } catch (error) {
    console.error('Greška pri dohvaćanju napretka:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju podataka o napretku' });
  }
});

app.post('/api/napredak', authenticateToken, async (req, res) => {
  try {
    const { datum, tip_napretka, vrijednost, biljeska } = req.body;

    const result = await query(
      `INSERT INTO Napredak (korisnik_id, datum, tip_napretka, vrijednost, biljeska)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, datum, tip_napretka, vrijednost, biljeska]
    );

    res.status(201).json({
      message: 'Napredak uspješno zabilježen',
      id: result.insertId
    });
  } catch (error) {
    console.error('Greška pri bilježenju napretka:', error);
    res.status(500).json({ error: 'Greška pri spremanju napretka' });
  }
});

app.delete('/api/napredak/:id', authenticateToken, async (req, res) => {
  try {
    // Provjeri postoji li zapis i pripada li korisniku
    const [zapis] = await query(
      'SELECT * FROM Napredak WHERE id = ? AND korisnik_id = ?',
      [req.params.id, req.user.id]
    );

    if (!zapis) {
      return res.status(404).json({ error: 'Zapis nije pronađen' });
    }

    await query('DELETE FROM Napredak WHERE id = ?', [req.params.id]);

    res.json({ message: 'Zapis uspješno obrisan' });
  } catch (error) {
    console.error('Greška pri brisanju zapisa:', error);
    res.status(500).json({ error: 'Greška pri brisanju zapisa o napretku' });
  }
});

// API endpoint za statistiku treninga
app.get('/api/statistika', authenticateToken, async (req, res) => {
  try {
    console.log('Dohvaćanje statistike za korisnika:', req.user.id);

    // Dohvati ukupan broj treninga
    const [ukupnoTreninga] = await query(
      'SELECT COUNT(*) as count FROM DnevnikTreninga WHERE korisnik_id = ?',
      [req.user.id]
    );
    
    // Dohvati broj treninga ovaj tjedan
    const [treninziTjedan] = await query(`
      SELECT COUNT(*) as count 
      FROM DnevnikTreninga 
      WHERE korisnik_id = ? 
      AND YEARWEEK(datum, 1) = YEARWEEK(CURDATE(), 1)
    `,
      [req.user.id]
    );
    
    // Dohvati prosječno trajanje treninga
    const [prosjecnoTrajanje] = await query(
      'SELECT AVG(trajanje) as prosjek FROM DnevnikTreninga WHERE korisnik_id = ?',
      [req.user.id]
    );
    
    // Dohvati ukupno sati treninga
    const [ukupnoSati] = await query(
      'SELECT SUM(trajanje) as ukupno FROM DnevnikTreninga WHERE korisnik_id = ?',
      [req.user.id]
    );
    
    const statistika = {
      ukupnoTreninga: parseInt(ukupnoTreninga.count) || 0,
      treninziTjedan: parseInt(treninziTjedan.count) || 0,
      prosjecnoTrajanje: Math.round(prosjecnoTrajanje.prosjek) || 0,
      ukupnoSati: Math.round((ukupnoSati.ukupno || 0) / 60)
    };

    console.log('Finalna statistika:', statistika);
    res.json(statistika);
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju statistike' });
  }
});

// Dohvaćanje svih planova treninga za korisnika
app.get('/api/planovi-treninga', authenticateToken, async (req, res) => {
  try {
    console.log('Dohvaćanje planova za korisnika:', req.user.id);
    
    // Dohvati sve planove
    const planovi = await query(
      'SELECT * FROM PlanoviTreninga WHERE korisnik_id = ? ORDER BY datum_kreiranja DESC',
      [req.user.id]
    );
    
    console.log('Dohvaćeni osnovni planovi:', planovi);

    // Za svaki plan dohvati njegove vježbe
    const planoviSVjezbama = await Promise.all(planovi.map(async (plan) => {
      console.log('Dohvaćanje vježbi za plan:', plan.id);
      
      const vjezbe = await query(
        `SELECT pv.*, v.naziv as vjezba_naziv 
         FROM PlanVjezbe pv 
         JOIN Vjezbe v ON pv.vjezba_id = v.id 
         WHERE pv.plan_id = ?
         ORDER BY pv.dan_index, pv.id`,
        [plan.id]
      );
      
      console.log('Dohvaćene vježbe za plan', plan.id, ':', vjezbe);

      return {
        ...plan,
        vjezbe
      };
    }));

    console.log('Dohvaćeni planovi s vježbama:', JSON.stringify(planoviSVjezbama, null, 2));
    res.json(planoviSVjezbama);
  } catch (error) {
    console.error('Greška pri dohvaćanju planova:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju planova treninga' });
  }
});

app.get('/api/planovi-treninga/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Dohvaćanje plana ID:', req.params.id);
    
    // Prvo dohvati osnovne podatke plana
    const [plan] = await query(
      'SELECT * FROM PlanoviTreninga WHERE id = ? AND korisnik_id = ?',
      [req.params.id, req.user.id]
    );

    if (!plan) {
      console.log('Plan nije pronađen');
      return res.status(404).json({ error: 'Plan nije pronađen' });
    }

    // Zatim dohvati vježbe s nazivima
    const vjezbe = await query(
      `SELECT pv.*, v.naziv as vjezba_naziv 
       FROM PlanVjezbe pv 
       JOIN Vjezbe v ON pv.vjezba_id = v.id 
       WHERE pv.plan_id = ?
       ORDER BY pv.dan_index, pv.id`,
      [req.params.id]
    );

    console.log('Dohvaćene vježbe:', vjezbe);

    // Vrati plan s vježbama
    res.json({
      ...plan,
      vjezbe
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju plana:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju plana treninga' });
  }
});

app.put('/api/planovi-treninga/:id', authenticateToken, async (req, res) => {
  try {
    const { naziv, opis, tezina_plana, trajanje_dana, dani } = req.body;
    console.log('Primljeni podaci za ažuriranje:', req.body);

    // Provjeri postoji li plan i pripada li korisniku
    const [plan] = await query(
      'SELECT * FROM PlanoviTreninga WHERE id = ? AND korisnik_id = ?',
      [req.params.id, req.user.id]
    );

    if (!plan) {
      return res.status(404).json({ error: 'Plan nije pronađen' });
    }

    // Ažuriraj osnovne podatke o planu
    await query(
      'UPDATE PlanoviTreninga SET naziv = ?, opis = ?, tezina_plana = ?, trajanje_dana = ? WHERE id = ?',
      [naziv, opis, tezina_plana, trajanje_dana, req.params.id]
    );

    // Za svaki dan u zahtjevu
    for (let i = 0; i < dani.length; i++) {
      const dan = dani[i];
      const dan_index = i + 1;

      // Ako dan ima vježbe
      if (dan.vjezbe && Array.isArray(dan.vjezbe)) {
        for (const vjezba of dan.vjezbe) {
          // Provjeri postoji li već ta vježba u tom danu
          const [postojecaVjezba] = await query(
            'SELECT * FROM PlanVjezbe WHERE plan_id = ? AND vjezba_id = ? AND dan_index = ?',
            [req.params.id, vjezba.vjezba_id, dan_index]
          );

          if (postojecaVjezba) {
            // Ako vježba postoji, ažuriraj postojeću
            await query(
              'UPDATE PlanVjezbe SET broj_setova = ?, broj_ponavljanja = ?, tezina = ? WHERE id = ?',
              [vjezba.broj_setova, vjezba.broj_ponavljanja, vjezba.tezina || 0, postojecaVjezba.id]
            );
          } else {
            // Ako vježba ne postoji, dodaj novu
            await query(
              'INSERT INTO PlanVjezbe (plan_id, vjezba_id, dan_index, broj_setova, broj_ponavljanja, tezina) VALUES (?, ?, ?, ?, ?, ?)',
              [req.params.id, vjezba.vjezba_id, dan_index, vjezba.broj_setova, vjezba.broj_ponavljanja, vjezba.tezina || 0]
            );
          }
        }

        // Obriši vježbe koje više nisu u planu za taj dan
        const vjezbeIds = dan.vjezbe.map(v => v.vjezba_id);
        if (vjezbeIds.length > 0) {
          await query(
            'DELETE FROM PlanVjezbe WHERE plan_id = ? AND dan_index = ? AND vjezba_id NOT IN (?)',
            [req.params.id, dan_index, vjezbeIds]
          );
        }
      }
    }

    res.json({ message: 'Plan treninga uspješno ažuriran' });
  } catch (error) {
    console.error('Greška pri ažuriranju plana:', error);
    res.status(500).json({ error: 'Greška pri ažuriranju plana treninga: ' + error.message });
  }
});

app.delete('/api/planovi-treninga/:id', authenticateToken, async (req, res) => {
  try {
    // Provjeri postoji li plan i pripada li korisniku
    const [plan] = await query(
      'SELECT * FROM PlanoviTreninga WHERE id = ? AND korisnik_id = ?',
      [req.params.id, req.user.id]
    );

    if (!plan) {
      return res.status(404).json({ error: 'Plan nije pronađen' });
    }

    // Brisanje plana (CASCADE će automatski obrisati i povezane vježbe)
    await query('DELETE FROM PlanoviTreninga WHERE id = ?', [req.params.id]);

    res.json({ message: 'Plan treninga uspješno obrisan' });
  } catch (error) {
    console.error('Greška pri brisanju plana:', error);
    res.status(500).json({ error: 'Greška pri brisanju plana treninga' });
  }
});

// Endpoint za dodavanje vježbe u plan treninga
app.post('/api/planovi-treninga/:planId/vjezbe', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.params;
    const { dan_index, vjezba } = req.body;

    // Provjeri postoji li plan
    const plan = await query(
      'SELECT * FROM PlanoviTreninga WHERE id = ? AND korisnik_id = ?',
      [planId, req.user.id]
    );

    if (!plan) {
      return res.status(404).json({ error: 'Plan nije pronađen' });
    }

    // Dodaj vježbu u plan
    const result = await query(
      'INSERT INTO PlanVjezbe (plan_id, vjezba_id, dan_index, broj_setova, broj_ponavljanja, tezina) VALUES (?, ?, ?, ?, ?, ?)',
      [planId, vjezba.vjezba_id, dan_index, vjezba.broj_setova, vjezba.broj_ponavljanja, vjezba.tezina || 0]
    );

    res.status(201).json({
      id: result.insertId,
      plan_id: planId,
      vjezba_id: vjezba.vjezba_id,
      dan_index,
      broj_setova: vjezba.broj_setova,
      broj_ponavljanja: vjezba.broj_ponavljanja,
      tezina: vjezba.tezina || 0
    });
  } catch (error) {
    console.error('Greška pri dodavanju vježbe u plan:', error);
    res.status(500).json({ error: 'Greška pri dodavanju vježbe u plan' });
  }
});

// Dohvaćanje završenih treninga za korisnika
app.get('/api/zavrseni-treninzi', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT 
        zt.*,
        dt.tip_treninga,
        dt.tezina_treninga,
        dt.datum as datum_treninga,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', tv.id,
              'naziv', v.naziv,
              'broj_setova', tv.broj_setova,
              'broj_ponavljanja', tv.broj_ponavljanja,
              'tezina', tv.tezina
            )
          )
          FROM TreningVjezbe tv
          JOIN Vjezbe v ON tv.vjezba_id = v.id
          WHERE tv.trening_id = dt.id
        ) as vjezbe
      FROM ZavrseniTreninzi zt
      JOIN DnevnikTreninga dt ON zt.trening_id = dt.id
      WHERE zt.korisnik_id = ?
      ORDER BY zt.datum DESC
    `;
    
    console.log('Dohvaćanje završenih treninga za korisnika:', userId);
    const results = await query(sql, [userId]);
    
    // Parsiranje JSON stringa vježbi u array
    const treninziSVjezbama = results.map(trening => ({
      ...trening,
      vjezbe: trening.vjezbe ? JSON.parse(trening.vjezbe) : []
    }));

    console.log('Pronađeno završenih treninga:', treninziSVjezbama.length);
    res.json(treninziSVjezbama);
  } catch (error) {
    console.error('Detaljna greška pri dohvaćanju završenih treninga:', error);
    res.status(500).json({ 
      error: 'Greška pri dohvaćanju završenih treninga',
      details: error.message 
    });
  }
});

// Dodavanje završenog treninga
app.post('/api/zavrseni-treninzi', authenticateToken, async (req, res) => {
  try {
    const { trening_id, datum_zavrsetka, trajanje, potrosene_kalorije } = req.body;
    const korisnik_id = req.user.id;

    const sql = `
      INSERT INTO ZavrseniTreninzi 
      (korisnik_id, trening_id, datum_zavrsetka, trajanje, potrosene_kalorije)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    console.log('Dodavanje završenog treninga:', sql);
    await query(sql, [korisnik_id, trening_id, datum_zavrsetka, trajanje, potrosene_kalorije]);
    res.json({ message: 'Trening uspješno dodan u završene' });
  } catch (error) {
    console.error('Greška pri dodavanju završenog treninga:', error);
    res.status(500).json({ error: 'Greška pri dodavanju završenog treninga' });
  }
});

// Dohvaćanje statistike treninga za korisnika
app.get('/api/statistika-korisnika', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // SQL upit za ukupan broj treninga
    const ukupnoTreningaQuery = `
      SELECT COUNT(*) as ukupno
      FROM ZavrseniTreninzi
      WHERE korisnik_id = ?
    `;

    // SQL upit za broj treninga ovaj tjedan
    const treninziTjedanQuery = `
      SELECT COUNT(*) as tjednoTreninga
      FROM ZavrseniTreninzi
      WHERE korisnik_id = ? 
      AND YEARWEEK(datum, 1) = YEARWEEK(CURDATE(), 1)
    `;

    // SQL upit za prosječno trajanje i ukupne sate
    const trajanjeQuery = `
      SELECT 
        AVG(trajanje) as prosjekMinuta,
        SUM(trajanje) as ukupnoMinuta
      FROM ZavrseniTreninzi
      WHERE korisnik_id = ?
    `;

    // Dohvaćanje podataka
    const [ukupnoResult] = await query(ukupnoTreningaQuery, [userId]);
    const [tjednoResult] = await query(treninziTjedanQuery, [userId]);
    const [trajanjeResult] = await query(trajanjeQuery, [userId]);

    // Izračun sati i minuta
    const ukupnoMinuta = trajanjeResult.ukupnoMinuta || 0;
    const sati = Math.floor(ukupnoMinuta / 60);
    const minute = ukupnoMinuta % 60;

    // Formatiranje rezultata
    const statistika = {
      ukupnoTreninga: ukupnoResult.ukupno || 0,
      treninziTjedan: tjednoResult.tjednoTreninga || 0,
      prosjecnoTrajanje: Math.round(trajanjeResult.prosjekMinuta || 0),
      ukupnoSati: sati,
      ukupnoMinuta: minute
    };

    res.json(statistika);
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike:', error);
    res.status(500).json({ 
      error: 'Greška pri dohvaćanju statistike',
      details: error.message 
    });
  }
});

// Dohvaćanje statistike sustava za admina
app.get('/api/admin/statistics', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    // Ukupan broj korisnika
    const [ukupnoKorisnika] = await query(
      'SELECT COUNT(*) as count FROM Korisnici'
    );

    // Ukupan broj treninga
    const [ukupnoTreninga] = await query(
      'SELECT COUNT(*) as count FROM DnevnikTreninga'
    );

    // Broj aktivnih korisnika u zadnjih 30 dana
    const [aktivniKorisnici] = await query(
      `SELECT COUNT(DISTINCT korisnik_id) as count 
       FROM DnevnikTreninga 
       WHERE datum >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );

    // Prosječno trajanje treninga
    const [prosjecnoTrajanje] = await query(
      `SELECT ROUND(AVG(trajanje)) as prosjek 
       FROM ZavrseniTreninzi`
    );

    const statistika = {
      ukupnoKorisnika: ukupnoKorisnika.count || 0,
      ukupnoTreninga: ukupnoTreninga.count || 0,
      aktivniKorisnici: aktivniKorisnici.count || 0,
      prosjecnoTrajanje: prosjecnoTrajanje.prosjek || 0
    };

    res.json(statistika);
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike:', error);
    res.status(500).json({ 
      error: 'Greška pri dohvaćanju statistike sustava',
      details: error.message 
    });
  }
});

// Admin rute
app.get('/api/admin/users', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    console.log('Dohvaćam sve korisnike...');
    
    // Prvo provjerimo broj korisnika u bazi
    const countSql = 'SELECT COUNT(*) as total FROM Korisnici';
    console.log('Count SQL:', countSql);
    
    const [countRows] = await query(countSql);
    console.log('Count rezultat:', countRows);
    
    const totalUsers = countRows && countRows[0] ? countRows[0].total : 0;
    console.log('Ukupno korisnika u bazi:', totalUsers);
    
    // Ispišimo SQL upit prije izvršavanja
    const sql = `
      SELECT 
        id,
        ime,
        prezime,
        email,
        datum_registracije,
        uloga
      FROM Korisnici
      ORDER BY datum_registracije DESC;
    `;
    console.log('SQL upit:', sql);
    
    // Koristimo promise.all da dobijemo stvarni rezultat
    const [queryResult] = await Promise.all([
      query(sql)
    ]);

    // Osigurajmo da je rezultat uvijek niz
    const rows = Array.isArray(queryResult) ? queryResult : [queryResult];
    
    console.log('Tip rezultata:', typeof rows);
    console.log('Je li array?', Array.isArray(rows));
    console.log('Duljina rezultata:', rows?.length);
    console.log('Sirovi rezultat:', JSON.stringify(rows, null, 2));

    // Mapiraj podatke u konzistentan format
    const formattedUsers = rows.map(user => ({
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      email: user.email,
      datum_registracije: user.datum_registracije,
      uloga: user.uloga || 'korisnik'
    }));

    console.log('Broj formatiranih korisnika:', formattedUsers.length);
    console.log('Formatirani korisnici:', JSON.stringify(formattedUsers, null, 2));
    res.json(formattedUsers);
  } catch (error) {
    console.error('Greška pri dohvaćanju korisnika:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju korisnika' });
  }
});

app.get('/api/admin/workouts', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const [workouts] = await query(`
      SELECT 
        dt.id,
        dt.korisnik_id,
        dt.tip_treninga,
        dt.datum,
        dt.trajanje,
        k.ime,
        k.prezime,
        k.email
      FROM DnevnikTreninga dt 
      JOIN Korisnici k ON dt.korisnik_id = k.id 
      ORDER BY dt.datum DESC
      LIMIT 100
    `);

    if (!workouts) {
      return res.json([]);
    }

    res.json(workouts);
  } catch (error) {
    console.error('Greška pri dohvaćanju treninga:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju treninga' });
  }
});

app.get('/api/admin/statistics', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    // Ukupan broj korisnika
    const [ukupnoKorisnika] = await query(
      'SELECT COUNT(*) as count FROM Korisnici'
    );

    // Ukupan broj treninga
    const [ukupnoTreninga] = await query(
      'SELECT COUNT(*) as count FROM DnevnikTreninga'
    );

    // Broj aktivnih korisnika u zadnjih 30 dana
    const [aktivniKorisnici] = await query(
      `SELECT COUNT(DISTINCT korisnik_id) as count 
       FROM DnevnikTreninga 
       WHERE datum >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );

    // Prosječno trajanje treninga
    const [prosjecnoTrajanje] = await query(
      `SELECT ROUND(AVG(trajanje)) as prosjek 
       FROM ZavrseniTreninzi`
    );

    const statistika = {
      ukupnoKorisnika: ukupnoKorisnika.count || 0,
      ukupnoTreninga: ukupnoTreninga.count || 0,
      aktivniKorisnici: aktivniKorisnici.count || 0,
      prosjecnoTrajanje: prosjecnoTrajanje.prosjek || 0
    };

    res.json(statistika);
  } catch (error) {
    console.error('Greška pri dohvaćanju statistike:', error);
    res.status(500).json({ 
      error: 'Greška pri dohvaćanju statistike sustava',
      details: error.message 
    });
  }
});

// API endpoints za profil korisnika
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [user] = await query(
      'SELECT id, ime, prezime, email, visina, tezina, spol, datum_rodenja, razina_aktivnosti, zdravstveno_stanje, ciljevi, datum_registracije FROM Korisnici WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    res.json(user);
  } catch (error) {
    console.error('Greška pri dohvaćanju profila:', error);
    res.status(500).json({ error: 'Greška pri dohvaćanju profila' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { visina, tezina, spol, datum_rodenja, razina_aktivnosti, zdravstveno_stanje, ciljevi } = req.body;

    await query(
      `UPDATE Korisnici 
       SET visina = ?, tezina = ?, spol = ?, datum_rodenja = ?, 
           razina_aktivnosti = ?, zdravstveno_stanje = ?, ciljevi = ?
       WHERE id = ?`,
      [visina, tezina, spol, datum_rodenja, razina_aktivnosti, zdravstveno_stanje, ciljevi, req.user.id]
    );

    res.json({ message: 'Profil uspješno ažuriran' });
  } catch (error) {
    console.error('Greška pri ažuriranju profila:', error);
    res.status(500).json({ error: 'Greška pri ažuriranju profila' });
  }
});

// Kreiranje novog plana treninga
app.post('/api/planovi-treninga', authenticateToken, async (req, res) => {
  try {
    const { naziv, opis, tezina_plana, trajanje_dana, dani } = req.body;
    console.log('Primljeni podaci za novi plan:', req.body);

    // Kreiraj novi plan
    const result = await query(
      'INSERT INTO PlanoviTreninga (naziv, opis, tezina_plana, trajanje_dana, korisnik_id, datum_kreiranja) VALUES (?, ?, ?, ?, ?, NOW())',
      [naziv, opis, tezina_plana, trajanje_dana, req.user.id]
    );

    const planId = result.insertId;

    // Za svaki dan u planu
    for (let i = 0; i < dani.length; i++) {
      const dan = dani[i];
      const dan_index = i + 1;

      // Ako dan ima vježbe
      if (dan.vjezbe && Array.isArray(dan.vjezbe)) {
        // Dodaj svaku vježbu za taj dan
        for (const vjezba of dan.vjezbe) {
          await query(
            'INSERT INTO PlanVjezbe (plan_id, vjezba_id, dan_index, broj_setova, broj_ponavljanja) VALUES (?, ?, ?, ?, ?)',
            [planId, vjezba.vjezba_id, dan_index, vjezba.broj_setova, vjezba.broj_ponavljanja]
          );
        }
      }
    }

    res.status(201).json({ 
      message: 'Plan treninga uspješno kreiran',
      planId: planId
    });
  } catch (error) {
    console.error('Greška pri kreiranju plana:', error);
    res.status(500).json({ error: 'Greška pri kreiranju plana treninga: ' + error.message });
  }
});

// Registracija endpoint
app.post('/api/register', async (req, res) => {
  const { ime, prezime, email, password } = req.body;
  
  try {
    // Provjeri postoji li već korisnik s tim emailom
    const postojeciKorisnik = await query('SELECT * FROM Korisnici WHERE email = ?', [email]);
    if (postojeciKorisnik.length > 0) {
      return res.status(400).json({ error: 'Email je već u upotrebi' });
    }

    // Hashiraj lozinku
    const salt = await bcrypt.genSalt(10);
    const hashedLozinka = await bcrypt.hash(password, salt);

    // Provjeri je li ovo prvi korisnik (admin)
    const [userCount] = await query('SELECT COUNT(*) as count FROM Korisnici');
    const uloga = userCount.count === 0 ? 'admin' : 'korisnik';

    // Kreiraj novog korisnika
    const result = await query(
      'INSERT INTO Korisnici (ime, prezime, email, lozinka, uloga, datum_registracije) VALUES (?, ?, ?, ?, ?, NOW())',
      [ime, prezime, email, hashedLozinka, uloga]
    );

    res.status(201).json({ 
      message: 'Korisnik uspješno registriran',
      user: {
        id: result.insertId,
        ime,
        prezime,
        email,
        uloga
      }
    });
  } catch (error) {
    console.error('Greška pri registraciji:', error);
    res.status(500).json({ error: 'Greška pri registraciji' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Provjeri postoji li korisnik s tim emailom
    const [korisnik] = await query('SELECT * FROM Korisnici WHERE email = ?', [email]);
    if (!korisnik) {
      return res.status(401).json({ error: 'Korisnik nije pronađen' });
    }

    // Provjeri lozinku
    const isValidPassword = await bcrypt.compare(password, korisnik.lozinka);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Neispravna lozinka' });
    }

    // Generiraj token
    const token = jwt.sign(
      { 
        id: korisnik.id, 
        email: korisnik.email, 
        uloga: korisnik.uloga,
        ime: korisnik.ime,
        prezime: korisnik.prezime
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Vrati token i podatke o korisniku
    res.json({ 
      token,
      user: {
        id: korisnik.id,
        ime: korisnik.ime,
        prezime: korisnik.prezime,
        email: korisnik.email,
        uloga: korisnik.uloga
      }
    });
  } catch (error) {
    console.error('Greška pri prijavi:', error);
    res.status(500).json({ error: 'Greška pri prijavi' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server je pokrenut na portu ${port}`);
  
  // Dodaj kolonu zavrsen ako ne postoji
  query(`
    ALTER TABLE DnevnikTreninga 
    ADD COLUMN IF NOT EXISTS zavrsen BOOLEAN DEFAULT 0
  `).catch(err => {
    console.error('Greška pri dodavanju kolone zavrsen:', err);
  });
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} je zauzet. Molimo koristite drugi port ili ugasite postojeći proces.`);
    process.exit(1);
  } else {
    console.error('Greška pri pokretanju servera:', err);
    process.exit(1);
  }
});
