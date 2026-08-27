# Report simulazioni v2.6

Esito: **OK**. 360 partite simulate con 3–6 giocatori e tre semi indipendenti.

Questa è una simulazione deterministica del modello di stato; il protocollo reale Master/lavagnette è verificato separatamente dai test WebSocket e dal playtest browser.

- Domande pescate: 5162; confronto tra sequenza completa e insieme univoco per ogni partita.
- Minigiochi pescati: 3718; shuffle-bag completo prima del riuso.
- Parità effettive risolte: 2600; il guard negativo rifiuta esplicitamente una sfida con distanze 1 e 2.
- Paracadute applicati e consumati: 277.
- Vittorie per Finale: 147; vittorie ai punti al round 15: 213.

## Esecuzioni

- seed 260826: 120 partite, 1723 domande, 1271 minigiochi, 902 parità — OK
- seed 270826: 120 partite, 1721 domande, 1221 minigiochi, 842 parità — OK
- seed 930093: 120 partite, 1718 domande, 1226 minigiochi, 856 parità — OK

Invarianti controllate: punti/caselle derivano dal medesimo ledger; stato non negativo e posizione entro la Finale; sfide soltanto su distanza effettiva uguale; una sola carta per estrazione.
