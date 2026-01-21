let money = 0;
let moneyPerSec = 1;
let prestige = 0;
let prestigePrice = 1000000;
let rebirth = 0;
let rebirthPrice = 1000;

let generators = [
    {
        nome: "Generator 1",
        custoBase: 10,
        custoAtual: 10,
        producaoBase: 1,
        upgradeLevel: 0,
        upgradePrice: 250,
        upgradePriceBase: 250,
        upgradeMultiplier: 2,
        quantidade: 0,
        cost10: 0 // Cache do custo de 10
    },
    {
        nome: "Generator 2",
        custoBase: 100,
        custoAtual: 100,
        producaoBase: 10,
        upgradeLevel: 0,
        upgradePrice: 5000,
        upgradePriceBase: 5000,
        upgradeMultiplier: 2,
        quantidade: 0,
        cost10: 0
    },
    {
        nome: "Generator 3",
        custoBase: 1000,
        custoAtual: 1000,
        producaoBase: 50,
        upgradeLevel: 0,
        upgradePrice: 75000,
        upgradePriceBase: 75000,
        upgradeMultiplier: 2,
        quantidade: 0,
        cost10: 0
    },
    {
        nome: "Generator 4",
        custoBase: 5000,
        custoAtual: 5000,
        producaoBase: 100,
        upgradeLevel: 0,
        upgradePrice: 150000,
        upgradePriceBase: 150000,
        upgradeMultiplier: 2,
        quantidade: 0,
        cost10: 0
    },
    {
        nome: "Generator 5",
        custoBase: 10000,
        custoAtual: 10000,
        producaoBase: 250,
        upgradeLevel: 0,
        upgradePrice: 350000,
        upgradePriceBase: 350000,
        upgradeMultiplier: 2,
        quantidade: 0,
        cost10: 0
    }
];

let achievements = [
    {
        name: 'First Million',
        id: 'money_milestone_1m',
        description: 'Get 1M money',
        target: 1000000,
        type:'money',
        completed: false
    },
    {
        name: 'Start',
        id: 'Generator_milestone_10',
        description: 'Buy 10 first generators',
        target: 10,
        type:'generator_amount',
        generatorIndex: 0,
        completed: false
    },
    {
        name: 'First Reset',
        id: 'prestige_first',
        description: 'Prestige for the first time',
        target: 1,
        type: 'prestige_count',
        completed: false
    }
];

/* --- SISTEMA DE SAVE/LOAD --- */
function loadGame(){
    const savedData = localStorage.getItem('idleGameSave');
    if(savedData){
        const data = JSON.parse(savedData);
        // ParseFloat garante que venha como número
        money = parseFloat(data.money || 0);
        prestige = parseFloat(data.prestige || 0);
        rebirth = parseFloat(data.rebirth || 0);
        
        if(data.generators){
            for(let i = 0; i < generators.length; i++){
                if(data.generators[i]){
                    generators[i].quantidade = parseFloat(data.generators[i].quantidade || 0);
                    generators[i].custoAtual = parseFloat(data.generators[i].custoAtual || generators[i].custoBase);
                    generators[i].upgradeLevel = parseFloat(data.generators[i].upgradeLevel || 0);
                    generators[i].upgradePrice = parseFloat(data.generators[i].upgradePrice || generators[i].upgradePriceBase);
                }
            }
        }
        recalcularMPS();
    }
}

function saveGame(){
    const saveData ={
        money: money,
        prestige: prestige,
        rebirth: rebirth,
        generators: generators
    };
    localStorage.setItem('idleGameSave', JSON.stringify(saveData));
}

/* --- LOOP PRINCIPAL --- */
loadGame();

setInterval(function(){
    // Dividido por 20 pois roda a cada 50ms (20 vezes por segundo)
    money += (moneyPerSec / 20);
    unlockAchievements();
    atualizarTela();
}, 50);

setInterval(function(){
    saveGame();
}, 5000);

function atualizarTela(){
    document.getElementById('money-display').innerText = "Money: " + format(money);
    document.getElementById('mps-display').innerText = "Per Sec: " + format(moneyPerSec);

    for(let i = 0; i < generators.length; i++) {
        let g = generators[i];
        
        // Cálculos visuais
        let multiplier = Math.pow(g.upgradeMultiplier, g.upgradeLevel);
        let prestigeBonus = (prestige * 0.5) + 1;
        
        let g_mps_atual = g.producaoBase * multiplier * prestigeBonus;
        let g_total_mps = g_mps_atual * g.quantidade;

        let idGen = `gen-${i}`;
        let idUpg = `upg-${i}`;

        // Cálculo de Custo para comprar 10 (Loop simples)
        let cost10 = 0;
        let rate = 1.15 + (i / 100);
        for (let j = 0; j < 10; j++) {
            // Custo Acumulativo
            cost10 += g.custoBase * Math.pow(rate, g.quantidade + j);
        }
        g.cost10 = cost10;

        // Atualiza DOM Gerador
        if(document.getElementById(`${idGen}-qtd`)) {
            document.getElementById(`${idGen}-qtd`).innerText = `(Qtd: ${format(g.quantidade)})`;
            document.getElementById(`${idGen}-mps`).innerText = `MPS: ${format(g_mps_atual)}`;
            document.getElementById(`${idGen}-cost`).innerText = `Price: ${format(g.custoAtual)}`;
            document.getElementById(`${idGen}-current-mps`).innerText = `Total MPS: ${format(g_total_mps)}`;
            document.getElementById(`${idGen}-cost10`).innerText = format(g.cost10);
        }

        // Atualiza DOM Upgrade
        if(document.getElementById(`${idUpg}-level`)) {
            document.getElementById(`${idUpg}-level`).innerText = `(Level: ${g.upgradeLevel})`;
            document.getElementById(`${idUpg}-bonus`).innerText = `x${g.upgradeMultiplier} Produção`;
            document.getElementById(`${idUpg}-cost`).innerText = `Custo: ${format(g.upgradePrice)}`;
        }
    }

    // --- Prestige Display ---
    let bonusPrestigePercent = (prestige * 0.5 * 100);
    let rebirthBonus = (rebirth * 0.1) + 1;
    let prestigeGain = Math.floor(Math.sqrt(money / prestigePrice) * rebirthBonus);
    
    document.getElementById('prestige-display').innerText = `Prestige: ${format(prestige)} (Bonus: +${format(bonusPrestigePercent)}% Money)`;
    document.getElementById('prestige-gain-display').innerText = `Prestige to receive: ${format(prestigeGain)}`;

    // --- Rebirth Display ---
    let bonusRebirthPercent = (rebirth * 0.1 * 100);
    let rebirthGain = Math.floor(Math.sqrt(prestige / rebirthPrice));

    document.getElementById('rebirth-display').innerText = `Rebirth: ${format(rebirth)} (Bonus: +${format(bonusRebirthPercent)}% Prestige)`;
    document.getElementById('rebirth-gain-display').innerText = `Rebirth to receive: ${format(rebirthGain)}`;

    renderAchievements();
}

function recalcularMPS() {
    let novoMPS = 1;
    
    for (let g of generators) {
        let multiplier = Math.pow(g.upgradeMultiplier, g.upgradeLevel);
        let prestigeBonus = (prestige * 0.5) + 1;
        
        let prodPorGerador = g.producaoBase * multiplier * prestigeBonus;
        novoMPS += (prodPorGerador * g.quantidade);
    }
    
    moneyPerSec = novoMPS; 
}

function buyGenerator(index){
    let g = generators[index];
    
    if(money >= g.custoAtual){
        money -= g.custoAtual;
        g.quantidade++;
        
        // Recalcula custo: Base * (Rate ^ Quantidade)
        let rate = 1.15 + (index/100);
        g.custoAtual = g.custoBase * Math.pow(rate, g.quantidade);
        
        recalcularMPS();
        unlockAchievements();
        saveGame();
    }
}

function buy10Generator(index){
    let g = generators[index];
    // Usa o valor calculado no loop de atualização para ser preciso
    if(money >= g.cost10){
        money -= g.cost10;
        
        // Adiciona 10 quantidades e recalcula o preço unitário final
        g.quantidade += 10;
        let rate = 1.15 + (index/100);
        g.custoAtual = g.custoBase * Math.pow(rate, g.quantidade);
        
        recalcularMPS();
        unlockAchievements();
        saveGame();
    }
}

function buyUpgradeGenerator(index){
    let g = generators[index];
    if(money >= g.upgradePrice){ 
        money -= g.upgradePrice;
        g.upgradeLevel++; 
        g.upgradePrice = Math.round(g.upgradePrice * 5);
        recalcularMPS();
        saveGame();
    }
}

function buyPrestige(){
    if(money < prestigePrice){
        return;
    }
    let rebirthBonus = (rebirth * 0.1) + 1;
    let prestigePointsGain = Math.floor(Math.sqrt(money / prestigePrice) * rebirthBonus);

    if(confirm('Will you reset your game to receive ' + format(prestigePointsGain) + ' Prestige Points')){
        // Reset Total
        money = 0;
        moneyPerSec = 0;
        prestige += prestigePointsGain;

        for(let g of generators){
            g.quantidade = 0;
            g.upgradeLevel = 0;
            g.custoAtual = g.custoBase;
            g.upgradePrice = g.upgradePriceBase;
        }
        
        recalcularMPS();
        atualizarTela();
        unlockAchievements();
        saveGame();
    }
}

function buyRebirth(){
    if(prestige < 1000){
        return;
    }
    let rebirthPointsGain = Math.floor(Math.sqrt(prestige / rebirthPrice));
    
    if(confirm('Will you reset all your money and prestige to receive ' + format(rebirthPointsGain) + ' Rebirth Points')){
        money = 0;
        moneyPerSec = 0;
        prestige = 0;
        rebirth += rebirthPointsGain;

        for(let g of generators){
            g.quantidade = 0;
            g.upgradeLevel = 0;
            g.custoAtual = g.custoBase;
            g.upgradePrice = g.upgradePriceBase;
        }
        recalcularMPS();
        atualizarTela();
        unlockAchievements();
        saveGame();
    }
}

/* --- FUNÇÕES DE DEBUG / ADMIN --- */
function addPrestige(){
    prestige += 1000; 
    recalcularMPS();
    atualizarTela();
    saveGame();
}

function addRebirth(){
    rebirth++;
    recalcularMPS();
    atualizarTela();
    saveGame();
}

function addMoney(){
    money += 1000000;
    recalcularMPS();
    atualizarTela();
    saveGame();
}

function hardReset() {
    if(confirm("Tem certeza? Isso apaga tudo.")){
        localStorage.clear();
        location.reload();
    }
}

/* --- ACHIEVEMENTS --- */
function unlockAchievements(){
    achievements.forEach(ach=>{
        if(ach.completed) return; 

        let conditionMet = false;
        switch(ach.type){
            case 'money':
                if(money >= ach.target) conditionMet = true;
                break;
            case 'generator_amount':
                if(generators[ach.generatorIndex].quantidade >= ach.target) conditionMet = true;
                break;
            case 'prestige_count':
                if (prestige >= ach.target) conditionMet = true;
                break;
        }
        if (conditionMet) {
            ach.completed = true;
            console.log(`Conquista Desbloqueada: ${ach.name}`); 
        }
    });
}

function renderAchievements() {
    const container = document.querySelector('.achievements-container');
    if (!container) return;
    
    container.innerHTML = ''; 

    achievements.forEach(ach => {
        const statusClass = ach.completed ? 'completed' : 'locked';
        const icon = ach.completed ? '🏆' : '🔒';

        const itemHTML = `
            <div class="achievement-item ${statusClass}">
                <div class="achievement-icon">${icon}</div>
                <div class="achievement-text">
                    <h3>${ach.name}</h3>
                    <p>${ach.description}</p>
                </div>
            </div>
        `;
        container.innerHTML += itemHTML;
    });
}
/* --- CONFIGURAÇÃO DE FORMATADORES --- */
const SUFFIXES = [
    "", "K", "M", "B", "T", "Qa", "Qn", "Sx", "Sp", "Oc", "No", "Dc", 
    "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nod", "Vg", 
    "UVg", "DVg", "TVg", "QaVg", "QiVg", "SxVg", "SpVg", "OcVg", "NoVg", "Tg", 
    "UTg", "DTg", "TTg", "QaTg", "QiTg", "SxTg", "SpTg", "OcTg", "NoTg", "Qd", 
    "UQd", "DQd", "TQd", "QaQd", "QiQd", "SxQd", "SpQd", "OcQd", "NoQd", "Qq", 
    "UQq", "DQq", "TQq", "QaQq", "QiQq", "SxQq", "SpQq", "OcQq", "NoQq", "Sg", 
    "USg", "DSg", "TSg", "QaSg", "QiSg", "SxSg", "SpSg", "OcSg", "NoSg", "St", 
    "USt", "DSt", "TSt", "QaSt", "QiSt", "SxSt", "SpSt", "OcSt", "NoSt", "Og", 
    "UOg", "DOg", "TOg", "QaOg", "QiOg", "SxOg", "SpOg", "OcOg", "NoOg", "Ng", 
    "UNg", "DNg", "TNg", "QaNg", "QiNg", "SxNg", "SpNg", "OcNg", "NoNg", "Ce"
];

function format(num) {
    // Segurança para não quebrar com null/undefined
    if (!num) return "0";
    
    // Se for 0, retorna "0"
    if (num === 0) return "0";

    // Se for muito pequeno (menor que 1000), mostra 2 decimais normais
    if (num < 1000) {
        return num.toFixed(2).replace(/\.00$/, '');
    }

    // Pega o log10 para saber a grandeza (ex: 1.000.000 é 6)
    let power = Math.floor(Math.log10(num));
    let tier = Math.floor(power / 3);

    // Se tivermos um sufixo para esse tamanho
    if (tier < SUFFIXES.length) {
        let suffix = SUFFIXES[tier];
        let scale = Math.pow(10, tier * 3);
        let scaledNum = num / scale;
        return scaledNum.toFixed(2) + suffix;
    } else {
        // Se for maior que os sufixos definidos, usa notação científica
        return num.toExponential(2).replace("+", "");
    }
}