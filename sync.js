/* ==================================================================
   Abgleich zwischen Geräten über einen Zugangscode.

   Führende Quelle bleibt der Browserspeicher: die Seite funktioniert ohne
   Code, ohne Konto und ohne Netz vollständig. Ist ein Code hinterlegt, wird
   beim Start der Serverstand geholt, mit dem lokalen zusammengeführt und bei
   Änderungen nach kurzer Ruhe zurückgeschrieben.

   Der Code selbst verlässt den Browser nur im Netzwerkaufruf und wird
   serverseitig ausschließlich als Hash gespeichert. Er steht nie in der
   Adresszeile, damit er nicht im Verlauf oder in Serverprotokollen landet.
   ================================================================== */
(function () {
  'use strict';

  var CFG = window.__SUPABASE__ || null;      // {url, anonKey} — aus config.js
  var K_CODE = 'wp26_code';
  var K_STAND = 'wp26_stand';
  var SCHLUESSEL = ['wp26_wahl', 'wp26_mk'];  // was abgeglichen wird
  var WARTE = 1500;                           // ms Ruhe vor dem Schreiben
  var timer = null, laeuft = false;

  function lies(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  function schreib(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function code() { try { return localStorage.getItem(K_CODE) || null; } catch (e) { return null; } }

  function zustand() {
    var d = {};
    SCHLUESSEL.forEach(function (k) { d[k] = lies(k, {}); });
    return d;
  }

  function zustandSetzen(d) {
    SCHLUESSEL.forEach(function (k) { if (d && d[k]) schreib(k, d[k]); });
  }

  /* Zusammenführen: je Eintrag gewinnt die Seite mit dem jüngeren Stand.
     Feiner als eintragsweise wird es nicht — dafür müsste jede Zustimmung
     einen eigenen Zeitstempel tragen, was den Nutzen nicht rechtfertigt. */
  function zusammen(lokal, fern, lokalStand, fernStand) {
    var neuer = (fernStand || 0) > (lokalStand || 0) ? fern : lokal;
    var alter = neuer === fern ? lokal : fern;
    var out = {};
    SCHLUESSEL.forEach(function (k) {
      out[k] = {};
      var a = (alter && alter[k]) || {}, b = (neuer && neuer[k]) || {};
      Object.keys(a).forEach(function (x) { out[k][x] = a[x]; });
      Object.keys(b).forEach(function (x) { out[k][x] = b[x]; });
    });
    return out;
  }

  function ruf(op, nutzlast) {
    if (!CFG) return Promise.reject(new Error('nicht eingerichtet'));
    return fetch(CFG.url.replace(/\/$/, '') + '/functions/v1/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CFG.anonKey },
      body: JSON.stringify(Object.assign({ op: op }, nutzlast))
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j && j.fehler ? j.fehler : 'Fehler ' + r.status);
        return j;
      });
    });
  }

  function laden() {
    var c = code();
    if (!c) return Promise.resolve(false);
    return ruf('laden', { code: c }).then(function (a) {
      var zus = zusammen(zustand(), a.daten, lies(K_STAND, 0), a.stand || 0);
      zustandSetzen(zus);
      schreib(K_STAND, Math.max(lies(K_STAND, 0), a.stand || 0));
      if (window.neuLaden) window.neuLaden();
      return true;
    });
  }

  function speichern() {
    var c = code();
    if (!c || laeuft) return Promise.resolve(false);
    laeuft = true;
    var stand = Date.now();
    return ruf('speichern', { code: c, daten: zustand(), stand: stand })
      .then(function () { schreib(K_STAND, stand); melde('gespeichert'); return true; })
      .catch(function (e) { melde('Nicht gespeichert: ' + e.message); return false; })
      .then(function (r) { laeuft = false; return r; });
  }

  /* ---------- Bedienoberfläche ---------- */

  function melde(txt) {
    var el = document.getElementById('sync-stand');
    if (el) el.textContent = txt;
  }

  function knopfText() {
    return code() ? 'Abgleich aktiv' : 'Auf meinen Geräten synchronisieren';
  }

  function knopfBauen() {
    if (!CFG) return;                     // ohne Einrichtung kein Knopf
    var b = document.createElement('button');
    b.id = 'sync-knopf';
    b.className = 'syncbtn';
    b.type = 'button';
    b.textContent = knopfText();
    b.onclick = dialog;
    var nav = document.querySelector('nav .in');
    if (nav) nav.appendChild(b);
  }

  function dialog() {
    var alt = document.getElementById('sync-dlg');
    if (alt) { alt.remove(); return; }
    var d = document.createElement('div');
    d.id = 'sync-dlg';
    d.className = 'syncdlg';
    d.innerHTML = code() ? angemeldet() : anmelden();
    document.body.appendChild(d);
    var inp = d.querySelector('input');
    if (inp) inp.focus();
  }

  function anmelden() {
    return '<div class="syncbox">' +
      '<h4>Auf mehreren Geräten weiterarbeiten</h4>' +
      '<p>Deine Zustimmungen liegen bisher nur in diesem Browser. Mit einem Zugangscode ' +
      'werden sie gespeichert und stehen dir auch auf dem Telefon zur Verfügung.</p>' +
      '<p class="syncwarn">Gespeichert werden dabei die Positionen, denen du zustimmst — also ' +
      'Angaben über deine politische Haltung. Wir speichern keinen Namen und keine ' +
      'E-Mail-Adresse; der Code ist die einzige Kennung. Du kannst die Daten jederzeit ' +
      'wieder löschen.</p>' +
      '<label class="synccheck"><input type="checkbox" id="sync-ok"> Ich bin damit ' +
      'einverstanden, dass meine Zustimmungen unter diesem Code gespeichert werden.</label>' +
      '<div class="syncrow"><input type="text" id="sync-code" placeholder="Zugangscode" ' +
      'autocomplete="off" spellcheck="false" inputmode="text">' +
      '<button type="button" onclick="SYNC.einloesen()">Verbinden</button></div>' +
      '<p class="syncstand" id="sync-stand"></p>' +
      '<button type="button" class="syncclose" onclick="SYNC.zu()">Schließen</button>' +
      '</div>';
  }

  function angemeldet() {
    return '<div class="syncbox">' +
      '<h4>Abgleich ist aktiv</h4>' +
      '<p>Dieses Gerät ist mit einem Zugangscode verbunden. Änderungen werden gespeichert ' +
      'und auf deinen anderen Geräten übernommen, sobald du dort denselben Code eingibst.</p>' +
      '<p class="syncstand" id="sync-stand"></p>' +
      '<div class="syncrow2">' +
      '<button type="button" onclick="SYNC.jetzt()">Jetzt abgleichen</button>' +
      '<button type="button" onclick="SYNC.trennen()">Gerät trennen</button>' +
      '<button type="button" class="syncdel" onclick="SYNC.loeschen()">Meine Daten löschen</button>' +
      '</div>' +
      '<p class="syncwarn">„Gerät trennen" lässt die gespeicherten Daten unberührt und entfernt ' +
      'nur den Code aus diesem Browser. „Meine Daten löschen" entfernt sie endgültig vom ' +
      'Server.</p>' +
      '<button type="button" class="syncclose" onclick="SYNC.zu()">Schließen</button>' +
      '</div>';
  }

  var SYNC = {
    start: function () {
      knopfBauen();
      if (code()) laden().then(function () { melde('abgeglichen'); })
        .catch(function (e) { melde('Abgleich fehlgeschlagen: ' + e.message); });
    },

    geaendert: function () {
      if (!code()) return;
      clearTimeout(timer);
      timer = setTimeout(speichern, WARTE);
      melde('wird gespeichert …');
    },

    einloesen: function () {
      var ok = document.getElementById('sync-ok');
      var f = document.getElementById('sync-code');
      if (!ok || !ok.checked) { melde('Bitte bestätige zuerst die Einwilligung.'); return; }
      var c = (f.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (c.length < 8) { melde('Der Code sieht nicht vollständig aus.'); return; }
      melde('prüfe …');
      ruf('laden', { code: c }).then(function (a) {
        schreib(K_CODE, c);
        try { localStorage.setItem(K_CODE, c); } catch (e) {}
        var zus = zusammen(zustand(), a.daten, lies(K_STAND, 0), a.stand || 0);
        zustandSetzen(zus);
        if (window.neuLaden) window.neuLaden();
        return speichern();
      }).then(function () {
        var b = document.getElementById('sync-knopf');
        if (b) b.textContent = knopfText();
        SYNC.zu(); dialog();
      }).catch(function (e) { melde('Das hat nicht funktioniert: ' + e.message); });
    },

    jetzt: function () {
      melde('gleiche ab …');
      laden().then(speichern).then(function () { melde('abgeglichen'); })
        .catch(function (e) { melde('Fehler: ' + e.message); });
    },

    trennen: function () {
      try { localStorage.removeItem(K_CODE); localStorage.removeItem(K_STAND); } catch (e) {}
      var b = document.getElementById('sync-knopf');
      if (b) b.textContent = knopfText();
      SYNC.zu();
    },

    loeschen: function () {
      if (!window.confirm('Alle auf dem Server gespeicherten Daten zu diesem Code endgültig löschen?')) return;
      var c = code();
      melde('lösche …');
      ruf('loeschen', { code: c }).then(function () {
        try { localStorage.removeItem(K_CODE); localStorage.removeItem(K_STAND); } catch (e) {}
        var b = document.getElementById('sync-knopf');
        if (b) b.textContent = knopfText();
        SYNC.zu();
        window.alert('Die Daten wurden vom Server gelöscht. Deine Auswahl in diesem Browser ist geblieben.');
      }).catch(function (e) { melde('Löschen fehlgeschlagen: ' + e.message); });
    },

    zu: function () {
      var d = document.getElementById('sync-dlg');
      if (d) d.remove();
    }
  };

  window.SYNC = SYNC;

  // Vor dem Verlassen noch offene Änderungen wegschreiben.
  window.addEventListener('pagehide', function () {
    if (code() && timer) { clearTimeout(timer); speichern(); }
  });
})();
