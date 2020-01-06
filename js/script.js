//h1 titles, h3 counters, h4 retart timer
var table = document.getElementById('field');

const h3_quant_bombs = document.getElementById('quantbombsh3');
const h3_field_size = document.getElementById('fieldsizeh3');

var mines = [];
var field_size = 5;
var quantidade_bombs = field_size;
var field_pos = [];

const btn5 = document.getElementById('5x5btn');
const btn10 = document.getElementById('10x10btn');
const btn15 = document.getElementById('15x15btn');
const btn_rank = document.getElementById('btn-rank');
const btn_closeRank = document.getElementById('btn-closerank');

const input_quant_bombs = document.getElementById('inputqbombs');
const btn_confirm_bombs = document.getElementById('confirmbomb');

btn5.onclick = mudar_campo_5;
btn10.onclick = mudar_campo_10;
btn15.onclick = mudar_campo_15;
btn_confirm_bombs.onclick = mudar_quant_bombs;
btn_rank.onclick = Rank;
btn_closeRank.onclick = closeRank;

var isStarted = false;
var isGameOver = false;
var isWin = false;
//match time counter
function start_temporizador() {
    if (isStarted != true) {
        var tempo = 0;
        const p_temporizador = document.getElementById('game-timer');
        const timer = setInterval(() => {
            p_temporizador.innerHTML = `Tempo de jogo: ${tempo}s`;
            tempo++
            if (isGameOver === true) {
                clearInterval(timer);
                isGameOver = false;
                //todo ranking
                let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
                //todo melhores tempos
                if (isWin) {
                    isWin = false;
                    var rank_name = document.getElementById('inp-nome').value;
                    if (rank_name != '') {
                        const dado = [
                            rank_name,
                            tempo,
                            field_size,
                            quantidade_bombs
                        ]
                        ranking.push(dado);
                        localStorage.setItem('ranking', JSON.stringify(ranking));
                    }
                }
                tempo = 0;
                p_temporizador.innerHTML = `Tempo de jogo: ${tempo}s`;
            }
        }, 1000);
    }
}


/****     MUSIC CODE      *****/
const body = document.querySelector('body');
body.onclick = playAudio;

var isSong = false;
function playAudio() {
    //145000 milis of music 145 s
    if (!isSong) {
        isSong = true;
        var backsong = new Audio('../songs/backsong.mp3');
        backsong.volume = 0.3;
        backsong.play();
        backsong.currentTime = 0;
    }
}

function resetSongTimeout() {
    setTimeout(() => {
        isSong = false;
        resetSongTimeout();
    }, 145000);
}
resetSongTimeout();
/****     END MUSIC CODE      *****/
function field(rows_count, cols_count, mines) {

    //completing the rows with mines and numbers
    var rows = [];
    for (var i = 0; i < cols_count; i++) {
        rows[i] = [];
        for (var j = 0; j < rows_count; j++) {
            if (mines.map(x => JSON.stringify(x)).includes("[" + i + "," + j + "]")) {
                rows[i][j] = "*";
            } else {
                rows[i][j] = 0;
            }
        }
    }

    //sum numbers with nearby mines
    for (var i = 0; i < rows_count; i++) {
        for (var j = 0; j < cols_count; j++) {
            if (rows[i][j] != '*') {
                //check top
                if (rows[i - 1] !== undefined && rows[i - 1][j - 1] === '*') rows[i][j]++;
                if (rows[i - 1] !== undefined && rows[i - 1][j] === '*') rows[i][j]++;
                if (rows[i - 1] !== undefined && rows[i - 1][j + 1] === '*') rows[i][j]++;
                //check sides
                if (rows[i][j - 1] === '*') rows[i][j]++;
                if (rows[i][j + 1] === '*') rows[i][j]++;
                //check bot
                if (rows[i + 1] !== undefined && rows[i + 1][j - 1] === '*') rows[i][j]++;
                if (rows[i + 1] !== undefined && rows[i + 1][j] === '*') rows[i][j]++;
                if (rows[i + 1] !== undefined && rows[i + 1][j + 1] === '*') rows[i][j]++;
            }
        }
    }

    return rows;
}
//drawing and setting the starts attributes
function drawTable(rows) {
    var i, j;
    for (row of rows) {
        var tr = document.createElement('tr');
        i = rows.indexOf(row);
        j = 0;
        for (item of row) {
            var td = document.createElement('td');
            var span_valor = document.createElement('span');
            span_valor.setAttribute('class', 'invisible');
            span_valor.textContent = item;
            td.appendChild(span_valor);
            td.addEventListener('click', clicou);
            td.addEventListener('mousedown', longclicou);
            td.setAttribute('id', `${i},${j}`);
            j++;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}
//long click event
function longclicou(event) {
    //making the box the same old status whitout auto clicking it
    function reatribute() {
        event.target.removeEventListener('mouseup', reatribute);
        setTimeout(() => {
            event.target.addEventListener('click', clicou)
        }, 500);
    }
    //longclicking logic
    var pressTimer;
    event.target.addEventListener('mouseup', (function () {
        clearTimeout(pressTimer);
        // Clear timeout
        return false;
    }));
    //flagging the box or unflagging it 
    pressTimer = window.setTimeout(function () {
        if (event.target.getAttribute('class') != 'flagged' &&
            event.target.getAttribute('class') != 'clicked') {
            event.target.removeEventListener('click', clicou);
            event.target.setAttribute('style', 'background-color: red;');
            event.target.setAttribute('class', 'flagged');
        } else {
            if (event.target.getAttribute('class') != 'clicked') {
                event.target.setAttribute('style', '');
                event.target.setAttribute('class', '');
                event.target.addEventListener('mouseup', reatribute);
            }
        }
    }, 1000);//longclick limit time
    return false;
}
//click event
function clicou(event) {
    start_temporizador();
    isStarted = true;
    if (event.target.textContent === '*') {
        new Audio('../songs/kaboom.mp3').play();
        isGameOver = true;
        isStarted = false;
        const container = document.querySelector('#container');
        container.setAttribute('class', 'shake');
        setTimeout(() => {
            container.setAttribute('class', '');
        }, 3000);
        //showing field
        for (item of document.querySelectorAll('.invisible')) {
            item.setAttribute('class', '');
            event.target.setAttribute('class', 'bombed');
        }
        //click disabled
        for (item of document.querySelectorAll('td')) {
            item.removeEventListener('click', clicou);
        }
        //restart counter
        var temp = 5;
        var h4 = document.querySelector('h4');
        h4.setAttribute('class', 'h4');
        const div_lose = document.getElementById('div-lose');
        const intervalo = setInterval(() => {
            div_lose.setAttribute('class', 'div-lose-true');
            h4.innerHTML = `VOCÊ PERDEU, AGUARDE O JOGO REINICIAR EM: ${temp}`
            temp--;
            if (temp === -1) {
                clearInterval(intervalo);
                h4.innerHTML = '';
                div_lose.setAttribute('class', 'div-lose-false');
                h4.setAttribute('class', '');
            }
        }, 1000);
        //restarting in 5 sec
        setTimeout(() => {
            restart();
        }, 6000);
    } else if (event.target.getAttribute('class') != 'clicked' &&
        event.target.toString() === '[object HTMLTableCellElement]') {
        event.target.setAttribute('class', 'clicked');
        event.target.firstElementChild.setAttribute('class', '');
        if (event.target.firstElementChild.textContent === '0') {
            //oppening all nearby 0s
            let local = event.target.getAttribute('id');
            let i = parseInt(local.split(',')[0]);
            let j = parseInt(local.split(',')[1]);
            looknearby(i, j);
        }
        isVictory();
    }
}
//looking nearby
function looknearby(i, j) {
    let pontos_descobertos = [];
    for (var r = i - 1; r <= i + 1; r++) {
        for (var t = j - 1; t <= j + 1; t++) {
            if (r < 0) r = 0;
            if (t < 0) t = 0;
            if (r >= field_size) r = field_size - 1, i--;
            if (t >= field_size) t = field_size - 1, j--;
            let td_correto = document.getElementById(`${r},${t}`);
            if (td_correto.firstChild.getAttribute('class') != '') {
                if (td_correto.getAttribute('class') != 'flagged')
                    if (td_correto.firstChild.textContent === '0') {
                        td_correto.setAttribute('class', 'clicked');
                        td_correto.firstChild.setAttribute('class', '');
                        pontos_descobertos.push(`${r},${t}`);
                    }
            }
        }
    }
    //recursivity
    for (next of pontos_descobertos) {
        looknearby(parseInt(next.split(',')[0]), parseInt(next.split(',')[1]));
    }
}
//pushing bombs positions to array of bombs
function creatMine() {
    while (mines.length != (quantidade_bombs)) {
        let i = Math.floor(Math.random() * field_size);
        let j = Math.floor(Math.random() * field_size);
        //not repeating same spot
        if (!mines.map(x => JSON.stringify(x)).includes("[" + i + "," + j + "]")) {
            mines.push([i, j]);
        }
    }
}
//changing table size
function mudar_campo_5() {
    if (!isStarted) {
        field_size = 5;
        restart();
    }
}

function mudar_campo_10() {
    if (!isStarted) {
        field_size = 10;
        restart();
    }
}

function mudar_campo_15() {
    if (!isStarted) {
        field_size = 15;
        restart();
    }
}
//changing quantity of bombs at the field
function mudar_quant_bombs() {
    if (!isStarted) {
        //checking if field supports that quantity of bombs
        if (input_quant_bombs.value < (field_size ** 2)) {
            if (input_quant_bombs.value != '') {
                quantidade_bombs = input_quant_bombs.value;
                restart();
            } else alert('Escolha um valor.')
        } else alert('Quantidade de bombas maior que o campo.');
    }
}
//checking if won
function isVictory() {
    let allCell = document.querySelectorAll('.invisible');
    if (allCell.length === parseInt(quantidade_bombs)) {
        isGameOver = true;
        isStarted = false;
        isWin = true;
        var temp = 5;
        var h4 = document.querySelector('h4');
        h4.setAttribute('class', 'h4');
        const div_lose = document.getElementById('div-lose');
        const intervalo = setInterval(() => {
            div_lose.setAttribute('class', 'div-lose-true');
            h4.innerHTML = `VOCÊ GANHOU, AGUARDE O JOGO REINICIAR EM: ${temp}`
            temp--;
            if (temp === -1) {
                clearInterval(intervalo);
                h4.innerHTML = '';
                div_lose.setAttribute('class', 'div-lose-false');
            }
        }, 1000);
        //restarting in 5 sec
        setTimeout(() => {
            h4.setAttribute('class', '');
            restart();
        }, 6000);
    }
}
//restarting table
function restart() {
    //checking if field supports that quantity of bombs
    if (quantidade_bombs >= (field_size ** 2)) quantidade_bombs = (field_size ** 2) - 1;
    h3_quant_bombs.innerHTML = `Bombas: ${quantidade_bombs}`;
    h3_field_size.innerHTML = `Tamanho: ${field_size}x${field_size}`;
    table.innerHTML = '';
    mines = [];
    creatMine();
    field_pos = field(field_size, field_size, mines);
    drawTable(field_pos);
}

function Rank() {
    const pop_rank = document.getElementById('pop-rank-div')
    pop_rank.setAttribute('class', 'pop-rank-true');
    let ranking = JSON.parse(localStorage.getItem('ranking')) || [];
    if (ranking != []) {
        ranking.sort((a, b) => {
            return a[1] - b[1];
        });
        let rank_p = document.querySelector('#pop-rank-div p');
        rank_p.innerHTML = `
        <table id="tab-rank">
            <tr>
                <td>Nome</td>
                <td>Tempo</td>
                <td>Campo</td>
                <td>Bombas</td>
            </tr>
        </table>
        `;
        ranking.map(item => {
            let tr = document.createElement('tr');
            for (var i = 0; i < 4; i++) {
                let td = document.createElement('td');
                td.appendChild(document.createTextNode(item[i]));
                tr.appendChild(td);
            }
            let tb = document.getElementById('tab-rank');
            tb.appendChild(tr);
        });
    }
}

function closeRank() {
    const pop_rank = document.getElementById('pop-rank-div')
    pop_rank.setAttribute('class', 'pop-rank-false');
    let rank_p = document.querySelector('#pop-rank-div p');
    rank_p.innerHTML = '';
}

//starting
creatMine();
field_pos = field(field_size, field_size, mines);
drawTable(field_pos);