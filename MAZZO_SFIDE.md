# Mazzo Sfide — regole v2.7

Il Mazzo Sfide contiene dieci minigiochi. Il tipo di prova non viene mai scelto dai giocatori: è sempre il gioco a estrarre una carta casuale.

## Interazione sulle lavagnette

Quando la prova richiede una risposta individuale, si attivano esclusivamente le lavagnette dei giocatori in sfida. Gli altri partecipanti vedono la carta e restano spettatori in sola lettura.

- **Stima Lampo** e **Cronometro del Master**: ogni sfidante inserisce un numero.
- **Alto o Basso**: ogni sfidante sceglie una delle due opzioni.
- **Intervallo Killer**: ogni sfidante inserisce minimo e massimo.
- **Asta al Ribasso**: ogni sfidante inserisce stima e margine promesso.
- **Nomi & Cose** e **La Bomba** restano prove a voce.
- **Ordine Impossibile**, **Indizio dopo Indizio** e **Timeline Flash** restano guidate dal Master secondo le regole della carta.

Se uno sfidante è anche il giocatore Master, risponde direttamente sul Master. Il fallback per un altro giocatore compare sul Master soltanto dopo che il server ha rilevato la disconnessione della sua lavagnetta. Una risposta inviata viene bloccata e non può essere duplicata.

## Come si attiva

### Casella Sfida o Minigioco

1. Soltanto il giocatore arrivato sulla casella riceve i comandi sulla propria lavagnetta.
2. Sceglie uno sfidante fra gli altri giocatori.
3. Tocca **Pesca una carta casuale**.
4. Tutti vedono la carta con tre regole, durata, criterio di vittoria e posta.
5. Il Master avvia la prova e registra il vincitore.

Se la lavagnetta autorizzata è disconnessa o il server la conferma indisponibile, gli stessi comandi compaiono sul Master. Non esiste più una scadenza arbitraria che sottragga la scelta a un giocatore ancora collegato. Gli altri telefoni restano spettatori in sola lettura.

### Parità di distanza

Quando due o più stime hanno la stessa distanza valida, il gioco estrae immediatamente una carta e mostra le regole. La schermata espone risposta corretta, stime, distanza reale e formula dopo eventuali modificatori: non può aprirsi per distanze valide diverse. Non viene chiesto di scegliere lo sfidante o il tipo di prova, perché i partecipanti sono già quelli coinvolti nella parità.

Le caselle Sfida/Minigioco sono invece eventi del percorso e possono attivarsi anche se nel round non esiste una parità. In quel caso il motivo mostrato è la casella raggiunta e l’avversario scelto.

## Le dieci carte

### Stima Lampo

Il Master legge una nuova domanda numerica. Ogni sfidante dà una sola stima; si rivela la risposta e vince chi è più vicino. Durata indicativa: 40–60 secondi.

### Cronometro del Master

Gli sfidanti si girano e non guardano lo schermo. Il Master avvia e ferma il cronometro senza annunciare la durata; ognuno stima i secondi trascorsi. Vince la stima temporale più precisa.

### Nomi & Cose

Compare una lettera insieme a una categoria. Gli sfidanti rispondono ad alta voce e il Master assegna la vittoria alla prima risposta valida. Se nessuno risponde, si pesca una nuova lettera e categoria.

### Alto o Basso

Per tre manche viene mostrata una domanda e un valore di riferimento. Ogni sfidante dichiara se la risposta reale è più alta o più bassa. Vince chi totalizza più risposte corrette; una nuova manche secca risolve l’eventuale parità.

### Intervallo Killer

Ogni sfidante indica un minimo e un massimo. Vince l’intervallo più stretto che contiene la risposta. Se nessun intervallo la contiene, vince quello con il bordo più vicino al valore reale.

### Ordine Impossibile

Compaiono quattro elementi mescolati da ordinare dal valore minore al maggiore. Il Master rivela la sequenza completa e assegna la vittoria a chi l’ha ricostruita meglio.

### Indizio dopo Indizio

Un numero misterioso è accompagnato da tre indizi progressivi. Dopo ogni indizio un giocatore può bloccare definitivamente la propria stima. Vince chi è più vicino; in caso di pari distanza prevale chi ha bloccato con meno indizi.

### La Bomba

Viene mostrata una categoria e parte una miccia casuale fra 7 e 12 secondi. I giocatori dicono a turno un elemento valido e il Master passa la bomba. Chi la possiede all’esplosione viene eliminato; vince l’ultimo rimasto.

### Asta al Ribasso

Ogni sfidante dichiara una stima e il massimo margine d’errore che promette di rispettare. Le promesse più strette sono prioritarie; vince la migliore promessa mantenuta. Se tutti falliscono, vince la stima più vicina.

### Timeline Flash

Compaiono quattro eventi in ordine casuale. Gli sfidanti li ordinano mentalmente dal più vecchio al più recente; il Master rivela gli anni e assegna la vittoria a chi ha ricostruito meglio la cronologia.

## Rotazione e spareggi interni

- Il mazzo è uno shuffle-bag: tutte le dieci carte vengono estratte prima di ricominciare il ciclo.
- La carta appena disputata viene esclusa dall’estrazione successiva.
- Quando possibile viene esclusa anche la famiglia appena giocata, per alternare stima, voce, riflessi, ordine, tempo e rischio.
- Se una prova calcolata termina ancora in parità, parte automaticamente un **Alto o Basso** secco fra i soli giocatori rimasti pari.

## Curiosità

Stima Lampo, Alto o Basso, Intervallo Killer, Ordine Impossibile, Indizio dopo Indizio, Asta al Ribasso e Timeline Flash mostrano una curiosità pertinente dopo la soluzione. Ogni curiosità proviene dal mazzo editoriale curato o da una carta con fonte HTTPS.
