# Vieraskielisten lasten osuus varhaiskasvatuksessa

## Mitä sovellus tekee

Sovellus on frontend-only-interaktiivi, jossa käyttäjä voi valita suomalaisen kunnan ja tarkastella vieraskielisten lasten osuutta varhaiskasvatuksessa. Sovellus vertaa valitun kunnan osuutta koko maan osuuteen. Tiedot luetaan esikäsitellystä staattisesta JSON-tiedostosta, eikä sovellus hae dataa API-yhteydellä.

## Teknologiat

- Vite
- React
- JavaScript
- CSS
- Node.js-esikäsittelyskripti

## Projektin käynnistäminen

```bash
npm install
npm run preprocess:data
npm run dev
```

Tarkistukset:

```bash
npm run build
npm run lint
```

## Aineisto

Lähde: Tilastokeskus / Statistics Finland, StatFin-taulukko 14jt.

Aineisto: *Varhaiskasvatukseen osallistuneet vieraskieliset ja ulkomaalaiset lapset alueen ja iän mukaan*

- Vuosi: 2024
- Ikäryhmä: Yhteensä
- Alueet: kunnat ja Koko Suomi
- Käytetyt mittarit:
  - Varhaiskasvatukseen osallistuneet lapset
  - Vieraskieliset varhaiskasvatukseen osallistuneet lapset

Lähdehuomautuksen mukaan aineisto ei sisällä Ahvenanmaata. Vieraskielisellä tarkoitetaan henkilöä, jonka äidinkieli on muu kuin suomi, ruotsi tai saame. Alue perustuu varhaiskasvatuksen pääasiallisen toimipaikan kuntaan.

## Datan esikäsittely

Raaka ladattu JSON-stat-tiedosto on polussa `src/data/raw/14jt.json`. Skripti `scripts/preprocess-data.js` muuntaa sen sovelluksen käyttämään muotoon `src/data/municipalities.json`. React-sovellus importoi ja käyttää tätä esikäsiteltyä tiedostoa.

Sovellus ei hae dataa API-yhteydellä, koska tehtävänannossa pyydettiin olemaan rakentamatta API-yhteyttä.

Osuus lasketaan näin:

```text
share = foreignLanguageChildren / totalChildren * 100
```

Jos `totalChildren` on suurempi kuin 0 ja `foreignLanguageChildren` on 0, osuus näytetään arvona 0 %. Jos `totalChildren` on 0, osuutta ei lasketa, koska jakaja on nolla.

## Mitä tarkistaisin ennen julkaisua

- määritelmät ja termit Tilastokeskuksen tai toimituksen kanssa
- viimeisin saatavilla oleva aineisto
- puuttuvat ja nolla-arvot (onko nykyinen toteutus paras mahdollinen)
- kuntamuutokset ja kuntien nimet
- laskennan tarkistus esimerkkikunnilla
- saavutettavuus
- mobiilikäytettävyys (testattu nopeasti, mutta paras testata aina useilla testilaitteilla)
- onko ikäryhmä “Yhteensä” paras journalistinen rajaus

## Tekoälyn käyttö

Tekoälyä käytettiin React- ja CSS-toteutuksen tukena, käyttöliittymän iterointiin sekä koodin tarkistamiseen. Datan tulkinta, laskentalogiikka ja journalistiset valinnat tarkistettiin käsin.

## Aikarajaus

Toteutus pidettiin tarkoituksella kompaktina, koska tehtävänannossa ehdotettiin noin kahden tunnin ajankäyttöä.
