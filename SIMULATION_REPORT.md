# Report simulazioni v2.9

Esito: **OK**. 360 partite simulate con 3–6 giocatori e tre semi indipendenti.

Questa è una simulazione deterministica del modello di stato; il protocollo reale Master/lavagnette è verificato separatamente dai test WebSocket e dal playtest browser.

- Domande pescate: 5228; confronto tra sequenza completa e insieme univoco per ogni partita.
- Minigiochi pescati: 3936; shuffle-bag completo prima del riuso.
- Parità effettive risolte: 2769; il guard negativo rifiuta esplicitamente una sfida con distanze 1 e 2.
- Paracadute applicati e consumati: 286.
- Vittorie per Finale: 127; vittorie ai punti al round 15: 233.

## Esecuzioni

- seed 260826: 120 partite, 1750 domande, 1344 minigiochi, 943 parità — OK
- seed 270826: 120 partite, 1740 domande, 1293 minigiochi, 927 parità — OK
- seed 930093: 120 partite, 1738 domande, 1299 minigiochi, 899 parità — OK

Invarianti controllate: punti/caselle derivano dal medesimo ledger; stato non negativo e posizione entro la Finale; sfide soltanto su distanza effettiva uguale; una sola carta per estrazione.
