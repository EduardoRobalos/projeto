const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tamanho do personagem e inimigos
const playerSize = 30;
const enemySize = 30;
const bossSize = 50;
const swordLength = 50;
let playerX = 50, playerY = canvas.height / 2; // Posição inicial do personagem
let playerDX = 0, playerDY = 0;
let isAttacking = false;
let attackTimer = 0;

// Fase atual
let currentLevel = 1;

// Inimigos
let enemies = [
    { x: 450, y: 100, health: 3 },
    { x: 500, y: 200, health: 3 },
    { x: 550, y: 300, health: 3 }
];

// Chefe
let boss = { x: 500, y: 100, health: 10 };

// Porta para a próxima fase
let door = { x: 100, y: 50, width: 30, height: 50, isOpen: false };

// Função para desenhar o personagem
// Função para desenhar a espada
function drawSword() {
    if (!isAttacking) return;  // Só desenha a espada quando estiver atacando

    // Definir a cor da espada
    ctx.strokeStyle = 'yellow'; // Cor brilhante para a lâmina da espada
    ctx.lineWidth = 6;  // Largura da lâmina
    ctx.shadowColor = 'white'; // Cor do brilho
    ctx.shadowBlur = 15; // Intensidade do brilho

    // Calcular posição da espada com base no movimento do jogador
    let swordX = playerX + playerSize / 2;
    let swordY = playerY + playerSize / 2;
    let swordAngle = Math.atan2(playerDY, playerDX); // Direção da espada com base no movimento do personagem

    // Desenhar a espada como uma linha com um pequeno ângulo, imitando uma lâmina
    ctx.beginPath();
    ctx.moveTo(swordX, swordY);  // Inicia a espada a partir do personagem
    ctx.lineTo(swordX + Math.cos(swordAngle) * swordLength, swordY + Math.sin(swordAngle) * swordLength);  // Define a posição final da lâmina com base na direção
    ctx.stroke();  // Desenha a espada
    ctx.shadowBlur = 0;  // Desativa o brilho depois de desenhar
}

// Função para desenhar o personagem
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Desenha a espada do personagem (com a nova personalização)
    drawSword();
}


// Função para desenhar os inimigos
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemySize, enemySize);
    });
}

// Função para desenhar o chefe
function drawBoss() {
    ctx.fillStyle = 'green';
    ctx.fillRect(boss.x, boss.y, bossSize, bossSize);
}

// Função para desenhar a porta
function drawDoor() {
    if (boss.health <= 0) { // Porta só aparece depois de derrotar o chefe
        ctx.fillStyle = door.isOpen ? 'gold' : 'brown';
        ctx.fillRect(door.x, door.y, door.width, door.height);
    }
}

// Função para mover o personagem
function movePlayer() {
    playerX += playerDX;
    playerY += playerDY;

    // Prevenir que o personagem saia da tela
    if (playerX < 0) playerX = 0;
    if (playerX + playerSize > canvas.width) playerX = canvas.width - playerSize;
    if (playerY < 0) playerY = 0;
    if (playerY + playerSize > canvas.height) playerY = canvas.height - playerSize;
}

// Função para verificar colisões da espada com inimigos
function checkSwordCollision() {
    if (!isAttacking) return;

    enemies.forEach((enemy, index) => {
        if (playerX + playerSize / 2 + swordLength > enemy.x && playerX + playerSize / 2 < enemy.x + enemySize && playerY + playerSize / 2 > enemy.y && playerY + playerSize / 2 < enemy.y + enemySize) {
            enemy.health -= 1;
            if (enemy.health <= 0) {
                enemies.splice(index, 1); // Remove o inimigo derrotado
            }
        }
    });

    // Checa se a espada atinge o chefe
    if (playerX + playerSize / 2 + swordLength > boss.x && playerX + playerSize / 2 < boss.x + bossSize && playerY + playerSize / 2 > boss.y && playerY + playerSize / 2 < boss.y + bossSize) {
        boss.health -= 1;
    }
    if (boss.health <= 0) {
        boss.splice(index, 1);
    }
}

// Função para desenhar a pontuação de vida
function drawHealth() {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Health: ' + boss.health, 10, 20);
    enemies.forEach((enemy, index) => {
        ctx.fillText('Enemy ' + (index + 1) + ' Health: ' + enemy.health, 10, 40 + (index * 20));
    });
}

// Função para verificar se o jogador tocou na porta
function checkDoorCollision() {
    if (boss.health <= 0) {
        if (playerX + playerSize > door.x && playerX < door.x + door.width && playerY + playerSize > door.y && playerY < door.y + door.height) {
            door.isOpen = true; // Porta fica aberta
            // Avançar para a próxima fase
            setTimeout(() => {
                currentLevel++;
                resetLevel(); // Reseta a fase
            }, 500);
        }
    }
}

// Função para reiniciar a fase
function resetLevel() {
    if (currentLevel === 2) {
        // Fase 2: Novos inimigos e novo chefe
        enemies = [
            { x: 450, y: 100, health: 3 },
            { x: 500, y: 200, health: 3 },
            { x: 550, y: 300, health: 3 }
        ];
        boss = { x: 500, y: 100, health: 10 };
        door = { x: 550, y: 50, width: 30, height: 50, isOpen: false }; // Reseta a porta para a próxima fase
    } else {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('You Won the Game!', canvas.width / 2 - 70, 40);
    }
}

// Função para controlar o movimento do jogador
function controlPlayer(event) {
    if (event.key === 'ArrowUp') playerDY = -2;
    if (event.key === 'ArrowDown') playerDY = 2;
    if (event.key === 'ArrowLeft') playerDX = -2;
    if (event.key === 'ArrowRight') playerDX = 2;
    if (event.key === ' ') isAttacking = true; // Atacar
}

// Função para parar o movimento do jogador
function stopPlayerMovement(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') playerDY = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') playerDX = 0;
    if (event.key === ' ') isAttacking = false; // Parar de atacar
}

// Função principal para desenhar o jogo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa a tela

    movePlayer();
    drawPlayer();
    drawEnemies();
    drawBoss();
    drawHealth();
    drawDoor();
    checkSwordCollision();
    checkDoorCollision();

    // Verifica se todos os inimigos foram derrotados
    if (enemies.length === 0 && boss.health > 0) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('Boss Fight!', canvas.width / 2 - 70, 40);
    } else if (boss.health <= 0) {
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.fillText('You Won! Press Space to continue to the next level.', canvas.width / 2 - 120, 40);
    }
}

// Inicializa o jogo
document.addEventListener('keydown', controlPlayer);
document.addEventListener('keyup', stopPlayerMovement);

// Inicia o loop do jogo
setInterval(draw, 1000 / 60); // Atualiza 60 vezes por segundo

window.onload = function() {
    var audio = document.getElementById('backgroundMusic');
    audio.play();
}