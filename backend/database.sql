-- Kreiranje tablice za korisnike
CREATE TABLE IF NOT EXISTS Korisnici (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  ime VARCHAR(255) NOT NULL,
  prezime VARCHAR(255) NOT NULL,
  uloga ENUM('admin', 'korisnik') DEFAULT 'korisnik',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dodavanje stranog ključa u tablicu treninga
ALTER TABLE Treninzi
ADD COLUMN IF NOT EXISTS korisnik_id INT,
ADD FOREIGN KEY (korisnik_id) REFERENCES Korisnici(id);

-- Kreiranje tablice za obavijesti
CREATE TABLE IF NOT EXISTS Obavijesti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naslov VARCHAR(255) NOT NULL,
  sadrzaj TEXT NOT NULL,
  datum_objave DATETIME DEFAULT CURRENT_TIMESTAMP,
  autor_id INT,
  FOREIGN KEY (autor_id) REFERENCES Korisnici(id)
);

-- Kreiranje tablice za FAQ
CREATE TABLE IF NOT EXISTS FAQ (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pitanje TEXT NOT NULL,
  odgovor TEXT,
  kategorija VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
