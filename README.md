# A OCCHIO! — GitHub Update v1.2

## Implementazioni
- Nickname scelto dal partecipante e inviato automaticamente alla lobby Master.
- Nickname ricordato localmente.
- Blocco dei nickname duplicati.
- Chi atterra su BONUS sceglie carta e destinatario dalla propria lavagnetta.
- Chi atterra su MALUS sceglie il destinatario dalla propria lavagnetta.
- Le altre lavagnette restano in sola lettura.
- Diciture BONUS e MALUS sempre complete.

## Fix Anti-Sapientone
- Corretto errore JavaScript nella casella Fenomeno/Anti-Sapientone.
- Distanza reale ed effettiva separate.
- Classifica, punti e movimento usano lo stesso valore effettivo.
- Protezione da doppia assegnazione dei punti.
- Malus permanenti non duplicabili.

## Curiosità
Le domande supportano `f` per la curiosità specifica e `fs` per la fonte:
`{cat:"...", q:"...", a:123, u:"...", f:"...", fs:"..."}`

Il gioco non deve generare curiosità casuali: ogni voce va verificata editorialmente.

## Deploy
Sostituire tutti i file nella root GitHub, poi su Render:
Manual Deploy → Clear build cache & deploy.
