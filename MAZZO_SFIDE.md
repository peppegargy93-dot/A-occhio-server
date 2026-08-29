# Mazzo Sfide — regole v2.8

Il Mazzo Sfide ufficiale contiene otto minigiochi. Il gioco estrae sempre una carta casuale: i giocatori non scelgono il tipo di prova.

**Indizio dopo Indizio** e **Asta al Ribasso** sono stati rimossi dal mazzo e non possono più essere estratti.

## Lavagnette e spettatori

Le lavagnette dei giocatori in sfida ricevono i comandi personali. Tutte le altre mostrano domanda, carte, stato della prova e risultato, ma rimangono in sola lettura.

- **Stima Lampo**: stima personale sulla lavagnetta.
- **Cronometro del Master**: il Master controlla il cronometro; gli sfidanti inseriscono i secondi sulla propria lavagnetta.
- **Alto o Basso**: scelta personale sulla lavagnetta per tre manche.
- **Intervallo Killer**: minimo e massimo sulla lavagnetta.
- **Ordine Impossibile**: quattro carte riordinabili sulla lavagnetta entro 25 secondi.
- **Timeline Flash**: quattro eventi riordinabili sulla lavagnetta entro 20 secondi.
- **Nomi & Cose** e **La Bomba**: risposte a voce, con validità e comandi controllati dal Master.

Quando entrambi gli sfidanti hanno inviato, il gioco blocca le risposte, calcola l’esito e mostra a tutti le due risposte e la soluzione. Ordine e Timeline inviano automaticamente l’ordine presente allo scadere del tempo. Un token estraneo non può rispondere e un giocatore non può inviare due volte.

Se uno sfidante usa il dispositivo Master, risponde localmente. Il fallback di una lavagnetta remota compare sul Master soltanto dopo l’indisponibilità confermata dal server.

## Come si attiva

### Casella Sfida o Minigioco

1. Il giocatore arrivato sulla casella sceglie lo sfidante dalla propria lavagnetta.
2. Il gioco pesca automaticamente una carta.
3. Tutti vedono nome, regole, durata, criterio di vittoria e posta.
4. Le lavagnette degli sfidanti si attivano; le altre diventano spettatrici.
5. Il risultato viene condiviso con tutti i dispositivi.

### Parità di distanza

Quando due o più stime hanno la stessa distanza valida, il gioco sceglie automaticamente partecipanti e carta. La schermata mostra risposta corretta, stime, distanza reale e formula dopo i modificatori. Una casella Sfida resta invece un evento del percorso e dichiara chiaramente il motivo differente.

## Le otto carte

### Stima Lampo

Una nuova domanda numerica e una sola stima per sfidante. Vince chi è più vicino.

### Cronometro del Master

Il Master avvia e ferma un intervallo nascosto. Gli sfidanti stimano i secondi trascorsi dalla propria lavagnetta; vince la stima più precisa.

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
