/* Zugang zum Supabase-Projekt.

   Solange hier null steht, läuft die Seite ohne Abgleich: alles bleibt im
   Browser, der Knopf zum Synchronisieren erscheint gar nicht erst.

   Zum Einschalten die beiden Werte aus dem Supabase-Projekt eintragen
   (Project Settings → API). Beide sind öffentlich und gehören in den
   Quelltext der Seite. Der service-role-Schlüssel gehört NICHT hierher —
   der bleibt ausschließlich in der Edge Function. */

window.__SUPABASE__ = {
  url:     'https://xfnnategxeexfuczizny.supabase.co',
  anonKey: 'sb_publishable_uPeRq9zOIx3Y_OFIIVHtkQ_ZqZF8TGL'
};
