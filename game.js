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
        cost10: 0,
        producaoBase: 1,
        upgradeLevel: 0,
        upgradePrice: 250,
        upgradePriceBase: 250,
        upgradeMultiplier: 2,
        quantidade: 0
    },
    {
        nome: "Generator 2",
        custoBase: 100,
        custoAtual: 100,
        cost10: 0,
        producaoBase: 10,
        upgradeLevel: 0,
        upgradePrice: 5000,
        upgradePriceBase: 5000,
        upgradeMultiplier: 2,
        quantidade: 0
    },
    {
        nome: "Generator 3",
        custoBase: 1000,
        custoAtual: 1000,
        cost10: 0,
        producaoBase: 50,
        upgradeLevel: 0,
        upgradePrice: 75000,
        upgradePriceBase: 75000,
        upgradeMultiplier: 2,
        quantidade: 0
    },
    {
        nome: "Generator 4",
        custoBase: 5000,
        custoAtual: 5000,
        cost10: 0,
        producaoBase: 100,
        upgradeLevel: 0,
        upgradePrice: 150000,
        upgradePriceBase: 150000,
        upgradeMultiplier: 2,
        quantidade: 0
    },
    {
        nome: "Generator 5",
        custoBase: 10000,
        custoAtual: 10000,
        cost10: 0,
        producaoBase: 250,
        upgradeLevel: 0,
        upgradePrice: 350000,
        upgradePriceBase: 350000,
        upgradeMultiplier: 2,
        quantidade: 0
    }

];

let achievements = [
    {
        name: 'First Million',
        id: 'money_milestone_1m',
        description: 'Get 1000000 money',
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

function loadGame(){
    const savedData = localStorage.getItem('idleGameSave');
    if(savedData){
        const data = JSON.parse(savedData);
        money = data.money || 0;
        moneyPerSec = data.moneyPerSec || 1;
        prestige = data.prestige || 0;
        rebirth = data.rebirth || 0;
        if(data.generators){
            for(let i = 0; i < generators.length; i++){
                if(data.generators[i]){
                    generators[i].quantidade = data.generators[i].quantidade;
                    generators[i].custoAtual = data.generators[i].custoAtual;
                    generators[i].upgradeLevel = data.generators[i].upgradeLevel;
                    generators[i].upgradePrice = data.generators[i].upgradePrice;
                }
            }
        }
    }
}

function saveGame(){
    const saveData ={
        money: money,
        moneyPerSec: moneyPerSec,
        prestige: prestige,
        rebirth: rebirth,
        generators: generators
    };
    localStorage.setItem('idleGameSave', JSON.stringify(saveData));
}


loadGame();

setInterval(function(){
    money += (moneyPerSec /20);
    unlockAchievements();
    atualizarTela();
}, 50);

setInterval(function(){
    saveGame();
}, 5000);

function atualizarTela(){
    // Atualiza o display de dinheiro
    document.getElementById('money-display').innerText = "Money: " + format(money);
    document.getElementById('mps-display').innerText = "Per Sec: " + format(moneyPerSec);

    for(let i = 0; i < generators.length; i++) {

        let g = generators[i];
        
        // Calcula o MPS visual (com bônus de prestígio)
        let g_mps_atual = g.producaoBase * Math.pow(g.upgradeMultiplier, g.upgradeLevel) * (1 + (0.5 * prestige));
        let g_total_mps = g_mps_atual * g.quantidade;
        let idGen = `gen-${i}`;
        let idUpg = `upg-${i}`;

        g.cost10 = 0;
        let rate = 1.15 + (i / 100);
        for (let j = 0; j < 10; j++) {
            g.cost10 += g.custoBase * Math.pow(rate, g.quantidade + j);
        }

        // Atualiza Gerador
        if(document.getElementById(`${idGen}-qtd`)) {
            document.getElementById(`${idGen}-qtd`).innerText = `(Qtd: ${format(g.quantidade)})`; // Opcional formatar qtd
            document.getElementById(`${idGen}-mps`).innerText = `MPS: ${format(g_mps_atual)}`;
            document.getElementById(`${idGen}-cost`).innerText = `Price: ${format(g.custoAtual)}`;
            document.getElementById(`${idGen}-current-mps`).innerText = `Total MPS: ${format(g_total_mps)}`;
        }

        // Atualiza Upgrade
        if(document.getElementById(`${idUpg}-level`)) {
            document.getElementById(`${idUpg}-level`).innerText = `(Level: ${g.upgradeLevel})`;
            // Nota: Multiplicador (x2, x4) geralmente fica melhor sem o "k", mas pode usar se quiser
            document.getElementById(`${idUpg}-bonus`).innerText = `x${g.upgradeMultiplier} Produção`;
            document.getElementById(`${idUpg}-cost`).innerText = `Custo: ${format(g.upgradePrice)}`;
        }
        // Comprar 10 Gen
        if(document.getElementById(`${idGen}-cost10`)) {
            document.getElementById(`${idGen}-cost10`).innerText = format(g.cost10);
        }
    }

    // --- Prestige Buttom ---
    let bonusPorcentagemPrestige = (prestige * 0.5 * 100).toFixed(0);
    let prestigePointsGain = Math.floor(Math.sqrt(money / prestigePrice) * (1+ (rebirth * 0.1)));
    document.getElementById('prestige-display').innerText = `Prestige: ${format(prestige)} (Bonus: +${format(bonusPorcentagemPrestige)}% Money)`;
    document.getElementById('prestige-gain-display').innerText = `Prestige to receive: ${format(prestigePointsGain)}`;


    // ---Rebirth Buttom ---
    let bonusPorcentageRebith = (rebirth * 0.1 * 100).toFixed(0);
    let rebirthPointsGain = Math.floor(Math.sqrt(prestige / rebirthPrice));
    document.getElementById('rebirth-display').innerText = `Rebirth: ${format(rebirth)} (Bonus: +${format(bonusPorcentageRebith)}% Prestige)`;
    document.getElementById('rebirth-gain-display').innerText = `Rebirth to receive: ${format(rebirthPointsGain)}`;

    // --- Achievements Check ---
    renderAchievements();
}

function recalcularMPS() {
    let novoMPS = 1;
    for (let g of generators) {
        let prodTotalGen = g.producaoBase * g.quantidade;
        prodTotalGen *= (1 + (0.5 * prestige));
        prodTotalGen *= Math.pow(g.upgradeMultiplier, g.upgradeLevel);

        novoMPS += prodTotalGen;
    }
    moneyPerSec = novoMPS; 
}

function buyGenerator(index){
    let g = generators[index];
    if(money >= g.custoAtual){
        money -= g.custoAtual;
        g.quantidade++;
        g.custoAtual = g.custoBase * Math.pow(1.15 + (index/100), g.quantidade);
        recalcularMPS();
        unlockAchievements();
        saveGame();
    }
}

function buy10Generator(index){
    let g = generators[index];
    if(money >= g.cost10){
        for(let i = 0; i <10; i++){
            buyGenerator(index);
        }
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
    let prestigePointsGain = Math.floor(Math.sqrt(money / prestigePrice) * (1 + (rebirth * 0.1)));
    if(confirm('Will you reset your game to receive ' + prestigePointsGain + ' Prestige Points')){
        money -= prestigePrice; 
        prestige += prestigePointsGain;

        money = 0;
        moneyPerSec = 1;

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
    if(confirm('Will you reset all your money and prestige to receive ' + rebirthPointsGain + ' Rebirth Points')){
        money = 0;
        moneyPerSec = 1;
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


//Formatar valores para 1k, 1.2M...
const formatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2
});

function format(num){
    if (num < 1 && num > 0) return num.toFixed(2); // Ex: 0.12
    if (num === 0) return "0";
    return formatter.format(num);
}

function unlockAchievements(){
    achievements.forEach(ach=>{
        let conditionMet = false;
        switch(ach.type){
            case'money':
                if(money >=ach.target){
                    conditionMet = true;
                }break;
            case'generator_amount':
                if(generators[ach.generatorIndex].quantidade >= ach.target){
                    conditionMet = true;
                }break;
            case 'prestige_count':
                if (prestige >= ach.target) {
                    conditionMet = true;
                }
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
    if (!container) return; // Sai se a seção não estiver visível/pronta
    
    container.innerHTML = ''; // Limpa o container

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

function addPrestige(){
    prestige++; 
    recalcularMPS();
    atualizarTela();
    unlockAchievements();
    saveGame();
}

function addRebirth(){
    rebirth++;
    recalcularMPS();
    atualizarTela();
    unlockAchievements();
    saveGame();
}

function addMoney(){
    money = money + 1000000;
    recalcularMPS();
    atualizarTela();
    unlockAchievements();
    saveGame();
}