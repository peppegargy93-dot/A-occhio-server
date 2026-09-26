# Mazzo Sfide — regole v3.0

Il Mazzo Sfide ufficiale contiene otto minigiochi. Il gioco estrae sempre una carta casuale: i giocatori non scelgono il tipo di prova.

**Indizio dopo Indizio** e **Asta al Ribasso** sono stati rimossi dal mazzo e non possono più essere estratti.

## Lavagnette e spettatori

Le lavagnette dei giocatori in sfida ricevono i comandi personali. Tutte le altre mostrano domanda, carte, stato della prova e risultato, ma rimangono in sola lettura.

- **Stima Lampo**: stima personale sulla lavagnetta.
- **Cronometro del Master**: se il Master non è in sfida controlla il cronometro; se partecipa, sceglie una lavagnetta spettatrice che riceve AVVIA e FERMA.
- **Alto o Basso**: scelta personale sulla lavagnetta per tre manche.
- **Intervallo Killer**: minimo e massimo sulla lavagnetta.
- **Ordine Impossibile**: quattro carte riordinabili sulla lavagnetta entro 25 secondi.
- **Timeline Flash**: quattro eventi riordinabili sulla lavagnetta entro 20 secondi.
- **Nomi & Cose** e **La Bomba**: risposte a voce, con validità e comandi controllati dal Master.

Uno sfidante collegato avvia la prova dal proprio dispositivo. Quando entrambi hanno inviato, il gioco blocca le risposte, calcola l’esito, mostra a tutti soluzione e risposte e prosegue automaticamente. Ordine e Timeline inviano l’ordine presente allo scadere. Un token estraneo non può rispondere e un giocatore non può inviare due volte.

Ogni schermata interattiva invia una conferma di apertura. Se manca entro 6 secondi, il server trasferisce al Master soltanto il campo non consegnato e blocca il doppio invio. Se uno sfidante usa il dispositivo Master, risponde localmente.

## Come si attiva

### Casella Minigioco

Sul tabellone completo esistono soltanto tre caselle Minigioco: **6, 17 e 23**. Le vecchie caselle Sfida, Bonus e Malus non fanno più parte del percorso.

1. Il giocatore arrivato sulla casella sceglie lo sfidante dalla propria lavagnetta.
2. Il gioco pesca automaticamente una carta.
3. Tutti vedono nome, regole, durata, criterio di vittoria e posta.
4. Le lavagnette degli sfidanti si attivano; le altre diventano spettatrici.
5. Il risultato viene condiviso con tutti i dispositivi.

### Parità di distanza

Quando due o più stime hanno la stessa distanza valida e la parità incide sui primi tre posti, il gioco sceglie automaticamente partecipanti e carta. La schermata mostra risposta corretta, stime, distanza reale, formula dopo i modificatori, posizione realmente in palio e punti. Una parità interamente fuori dal podio non genera una sfida.

## Le otto carte

### Stima Lampo

Una nuova domanda numerica e una sola stima per sfidante. Vince chi è più vicino.

### Cronometro del Master

Se il Master non partecipa, avvia e ferma un intervallo nascosto. Se è uno sfidante, seleziona un giocatore esterno: la sua lavagnetta mostra prima AVVIA e poi FERMA, mentre il tempo resta nascosto sul Master. Dopo lo stop, gli sfidanti stimano i secondi dai propri dispositivi; vince la stima più precisa. Se l’arbitro cade, il comando può essere riassegnato; senza arbitro la carta viene sostituita.

### Nomi & Cose

Compare una lettera con una categoria. Si risponde a voce e il Master assegna la vittoria alla prima risposta valida.

### Alto o Basso

Per tre manche, gli sfidanti scelgono se la risposta reale è più alta o più bassa del riferimento. Vince chi totalizza più risposte corrette.

### Intervallo Killer

Ogni sfidante invia minimo e massimo. Vince l’intervallo valido più stretto; se nessuno contiene la risposta, vince quello con il bordo più vicino.

### Ordine Impossibile

Le lavagnette mostrano quattro elementi mescolati. Gli sfidanti li riordinano dal valore minore al maggiore entro 25 secondi. Vince chi colloca più elementi nella posizione corretta; la distanza complessiva nell’ordine risolve il primo spareggio.

### La Bomba

Compare una categoria e parte una miccia casuale fra 7 e 12 secondi. Si risponde a voce; il Master valida e passa la bomba. Chi la possiede all’esplosione viene eliminato.

### Timeline Flash

Le lavagnette mostrano quattro eventi mescolati. Gli sfidanti li riordinano dal più vecchio al più recente entro 20 secondi. All’invio, tutti vedono entrambe le timeline e gli anni corretti.

## Rotazione e curiosità

- Lo shuffle-bag percorre tutte le otto carte prima di ricominciare.
- La carta appena disputata non viene riproposta subito.
- Quando possibile cambia anche la famiglia di gioco.
- Una parità interna viene risolta con un **Alto o Basso** secco.
- Stima Lampo, Alto o Basso, Intervallo Killer, Ordine Impossibile e Timeline Flash mostrano una curiosità pertinente e una fonte HTTPS dopo la soluzione.
