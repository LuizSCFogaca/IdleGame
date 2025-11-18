let money = 0;
let moneyPerSec = 1;

let generators = [
    {
        nome: "Generator 1",
        custoBase: 10,
        custoAtual: 10,
        producaoBase: 1,
        upgradeLevel: 0,
        upgradePrice: 250,
        upgradeMultiplier: 2,
        quantidade: 0
    },
    {
        nome: "Generator 2",
        custoBase: 100,
        custoAtual: 100,
        producaoBase: 10,
        upgradeLevel: 0,
        upgradePrice: 5000,
        upgradeMultiplier: 2,
        quantidade: 0
    },
    {
        nome: "Generator 3",
        custoBase: 1000,
        custoAtual: 1000,
        producaoBase: 50,
        upgradeLevel: 0,
        upgradePrice: 75000,
        upgradeMultiplier: 2,
        quantidade: 0
    }

];

function loadGame(){
    const savedData = localStorage.getItem('idleGameSave');
    if(savedData){
        const data = JSON.parse(savedData);
        money = data.money || 0;
        moneyPerSec = data.moneyPerSec || 1;
        if(data.generators){
            generators = data.generators;
        }
    }
}

function saveGame(){
    const saveData ={
        money: money,
        moneyPerSec: moneyPerSec,
        generators: generators
    };
    localStorage.setItem('idleGameSave', JSON.stringify(saveData));
}


loadGame();

setInterval(function(){
    money += (moneyPerSec/20);
    atualizarTela();
}, 50);

setInterval(function(){
    saveGame();
}, 5000);

function atualizarTela(){
    // Atualiza o display de dinheiro
    document.getElementById('money-display').innerText = "Money: " + Math.floor(money);
    document.getElementById('mps-display').innerText = "Per Sec: " + moneyPerSec.toFixed(1);

    // --- Atualiza Botão 0 ---
    let g0 = generators[0];
    let g0_mps_atual = g0.producaoBase * Math.pow(g0.upgradeMultiplier, g0.upgradeLevel);
    document.getElementById('gen-0-qtd').innerText = `(Qtd: ${g0.quantidade})`;
    document.getElementById('gen-0-mps').innerText = `MPS: ${g0_mps_atual.toFixed(1)}`;
    document.getElementById('gen-0-cost').innerText = `Price: ${Math.ceil(g0.custoAtual)}`;

    // --- Atualiza Botão 1 ---
    let g1 = generators[1];
    let g1_mps_atual = g1.producaoBase * Math.pow(g1.upgradeMultiplier, g1.upgradeLevel);
    document.getElementById('gen-1-qtd').innerText = `(Qtd: ${g1.quantidade})`;
    document.getElementById('gen-1-mps').innerText = `MPS: ${g1_mps_atual.toFixed(1)}`;
    document.getElementById('gen-1-cost').innerText = `Price: ${Math.ceil(g1.custoAtual)}`;

    // --- Atualiza Botão 2 ---
    let g2 = generators[2];
    let g2_mps_atual = g2.producaoBase * Math.pow(g2.upgradeMultiplier, g2.upgradeLevel);
    document.getElementById('gen-2-qtd').innerText = `(Qtd: ${g2.quantidade})`;
    document.getElementById('gen-2-mps').innerText = `MPS: ${g2_mps_atual.toFixed(1)}`;
    document.getElementById('gen-2-cost').innerText = `Price: ${Math.ceil(g2.custoAtual)}`;

    // --- Atualizar Botão Upgrade 0 ---
    let upg0 = generators[0];
    document.getElementById('upg-0-level').innerText = `(Level: ${upg0.upgradeLevel}) `;
    document.getElementById('upg-0-bonus').innerText = `x${upg0.upgradeMultiplier} Produção`;
    document.getElementById('upg-0-cost').innerText = `Custo: ${Math.ceil(upg0.upgradePrice)}`;
    document.getElementById('upg-0-req').innerText = `Req: ${10 * Math.pow(2, upg0.upgradeLevel)} Gen${0+1}`;

    // --- Atualizar Botão Upgrade 1 ---
    let upg1 = generators[1];
    document.getElementById('upg-1-level').innerText = `(Level: ${upg1.upgradeLevel})`;
    document.getElementById('upg-1-bonus').innerText = `x${upg1.upgradeMultiplier} Produção`;
    document.getElementById('upg-1-cost').innerText = `Custo: ${Math.ceil(upg1.upgradePrice)}`;
    document.getElementById('upg-1-req').innerText = `Req: ${10 * Math.pow(2, upg1.upgradeLevel)} Gen${1+1}`;

    // --- Atualizar Botão Upgrade 2 ---
    let upg2 = generators[2];
    document.getElementById('upg-2-level').innerText = `(Level: ${upg2.upgradeLevel})`;
    document.getElementById('upg-2-bonus').innerText = `x${upg2.upgradeMultiplier} Produção`;
    document.getElementById('upg-2-cost').innerText = `Custo: ${Math.ceil(upg2.upgradePrice)}`;
    document.getElementById('upg-2-req').innerText = `Req: ${10 * Math.pow(2, upg2.upgradeLevel)} Gen${2+1}`;
}

function recalcularMPS() {
    let novoMPS = 1;
    for (let g of generators) {
        let prodTotalGen = g.producaoBase * g.quantidade;
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
        saveGame();
    }
}

function buyUpgradeGenerator(index){
    let g = generators[index];
    if(money >= g.upgradePrice && g.quantidade >= (10 * (Math.pow(2, g.upgradeLevel)-1))){ 
        money -= g.custoAtual;
        g.upgradeLevel++;
        g.upgradePrice = Math.round(g.upgradePrice * Math.pow(2.5, g.upgradeLevel));
        recalcularMPS();
        saveGame();
    }
}
