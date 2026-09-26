# Report simulazioni v3.0

Esito: **OK**. 360 partite simulate con 3–6 giocatori e tre semi indipendenti.

Questa è una simulazione deterministica del modello di stato; il protocollo reale Master/lavagnette è verificato separatamente dai test WebSocket.

- Domande pescate: 5197; confronto tra sequenza completa e insieme univoco per ogni partita.
- Minigiochi pescati: 4985; attivati soltanto da parità che toccano il podio o dalle tre caselle Minigioco.
- Attivazioni dalle caselle Minigioco 6, 17 e 23: 1648.
- Parità effettive risolte: 3337; il guard negativo rifiuta esplicitamente una sfida con distanze 1 e 2.
- Premi rimonta dopo 4 esclusioni consecutive: 383.
- Malus automatici al 3º, 6º, 9º… podio: 4667.
- Paracadute applicati e consumati: 312.
- Vittorie per Finale: 132; vittorie ai punti al round 15: 228.

## Esecuzioni

- seed 260826: 120 partite, 1743 domande, 1712 minigiochi, 126 Bonus rimonta, 1567 Malus podio — OK
- seed 270826: 120 partite, 1746 domande, 1664 minigiochi, 153 Bonus rimonta, 1561 Malus podio — OK
- seed 930093: 120 partite, 1708 domande, 1609 minigiochi, 104 Bonus rimonta, 1539 Malus podio — OK

Invarianti controllate: punti/caselle derivano dal medesimo ledger; stato non negativo e posizione entro la Finale; sfide soltanto su distanza effettiva uguale e rilevante per il podio; tre sole caselle Minigioco; Bonus ogni 4 esclusioni consecutive; Malus a ogni multiplo di 3 podi.
