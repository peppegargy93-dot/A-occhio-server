# Report simulazioni v3.1

Esito: **OK**. 360 partite simulate con 3–6 giocatori e tre semi indipendenti.

Questa è una simulazione deterministica del modello di stato; il protocollo reale Master/lavagnette è verificato separatamente dai test WebSocket.

- Domande pescate: 5177; confronto tra sequenza completa e insieme univoco per ogni partita.
- Minigiochi pescati: 4794; attivati soltanto da parità che toccano il podio o dalle tre caselle Minigioco.
- Attivazioni dalle caselle Minigioco 6, 17 e 23: 1668.
- Parità effettive risolte: 3126; il guard negativo rifiuta esplicitamente una sfida con distanze 1 e 2.
- Premi rimonta dopo 4 esclusioni consecutive: 345.
- Malus automatici al 3º, 6º, 9º… podio: 4635.
- Paracadute applicati e consumati: 286.
- Vittorie per Finale: 141; vittorie ai punti al round 15: 219.

## Esecuzioni

- seed 260826: 120 partite, 1736 domande, 1608 minigiochi, 113 Bonus rimonta, 1542 Malus podio — OK
- seed 270826: 120 partite, 1720 domande, 1601 minigiochi, 114 Bonus rimonta, 1536 Malus podio — OK
- seed 930093: 120 partite, 1721 domande, 1585 minigiochi, 118 Bonus rimonta, 1557 Malus podio — OK

Invarianti controllate: punti/caselle derivano dal medesimo ledger; stato non negativo e posizione entro la Finale; sfide soltanto su distanza effettiva uguale e rilevante per il podio; tre sole caselle Minigioco; Bonus ogni 4 esclusioni consecutive; Malus a ogni multiplo di 3 podi.
