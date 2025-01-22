// Backup nekorištenih funkcija iz indeks.js

// Funkcija za brisanje dupliciranih vježbi
const obrisiDuplikateVjezbi = async () => {
  try {
    // Prvo pronađimo sve duplikate
    const duplikati = await query(`
      SELECT naziv, COUNT(*) as broj
      FROM Vjezbe
      GROUP BY naziv
      HAVING COUNT(*) > 1
    `);

    console.log('Pronađeni duplikati:', duplikati);

    // Za svaki duplicirani naziv, zadrži samo redak s najmanjim ID-om
    for (const duplikat of duplikati) {
      await query(`
        DELETE v1 FROM Vjezbe v1
        INNER JOIN Vjezbe v2
        WHERE v1.naziv = v2.naziv
        AND v1.id > v2.id
      `);
      console.log(`Obrisani duplikati za vježbu: ${duplikat.naziv}`);
    }

    console.log('Uspješno obrisani svi duplikati');
  } catch (error) {
    console.error('Greška pri brisanju duplikata:', error);
  }
};

// Ažuriranje slika za vježbe
const azurirajSlikeVjezbi = async () => {
  const slike = {
    'Mrtvo dizanje': {
      slika: '/images/exercises/deadlift.jpg',
      gif: '/images/exercises/deadlift.jpg'
    },
    'Zgibovi': {
      slika: '/images/exercises/pullup.jpg',
      gif: '/images/exercises/pullup.jpg'
    },
    'Biceps pregib': {
      slika: '/images/exercises/bicep-curl.jpg',
      gif: '/images/exercises/bicep-curl.jpg'
    },
    'Face Pull': {
      slika: '/images/exercises/face-pull.webp',
      gif: '/images/exercises/face-pull.webp'
    },
    'Bugarski split čučanj': {
      slika: '/images/exercises/bulgarian-split-squat.webp',
      gif: '/images/exercises/bulgarian-split-squat.webp'
    },
    'Ruski twist': {
      slika: '/images/exercises/russian-twist.webp',
      gif: '/images/exercises/russian-twist.webp'
    },
    'Čučanj': {
      slika: '/images/exercises/squat.jpg',
      gif: '/images/exercises/squat.jpg'
    },
    'Bench Press': {
      slika: '/images/exercises/bench-press.jpg',
      gif: '/images/exercises/bench-press.jpg'
    },
    'Veslanje u pretklonu': {
      slika: '/images/exercises/bent-over-row.jpeg',
      gif: '/images/exercises/bent-over-row.jpeg'
    },
    'Hip Thrust': {
      slika: '/images/exercises/hip-thrust.jpg',
      gif: '/images/exercises/hip-thrust.jpg'
    },
    'Iskorak': {
      slika: '/images/exercises/lunge.webp',
      gif: '/images/exercises/lunge.webp'
    },
    'Plank': {
      slika: '/images/exercises/plank.png',
      gif: '/images/exercises/plank.png'
    },
    'Sklekovi': {
      slika: '/images/exercises/pushup.jpg',
      gif: '/images/exercises/pushup.jpg'
    },
    'Potisak iznad glave': {
      slika: '/images/exercises/shoulder-press.jpeg',
      gif: '/images/exercises/shoulder-press.jpg'
    },
    'Triceps ekstenzija': {
      slika: '/images/exercises/tricep-extension.jpg',
      gif: '/images/exercises/tricep-extension.jpg'
    }
  };

  try {
    // Prvo dohvati sve vježbe da vidimo točne nazive
    const vjezbe = await query('SELECT id, naziv FROM Vjezbe');
    console.log('Trenutni nazivi vježbi u bazi:', vjezbe.map(v => v.naziv));

    for (const [naziv, urls] of Object.entries(slike)) {
      const result = await query(
        'UPDATE Vjezbe SET slika = ?, gif = ? WHERE naziv = ?',
        [urls.slika, urls.gif, naziv]
      );
      if (result.affectedRows === 0) {
        console.log(`⚠️ Upozorenje: Vježba "${naziv}" nije pronađena u bazi`);
      } else {
        console.log(`✅ Ažurirana slika za vježbu "${naziv}"`);
      }
    }
    console.log('Sve slike su uspješno ažurirane');
  } catch (error) {
    console.error('Greška pri ažuriranju slika:', error);
  }
};
