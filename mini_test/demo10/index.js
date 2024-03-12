const FIVE = {
    MU: 1,
    JIN: 2,
    SHUI: 3,
    HUO: 4,
    TU: 5
};

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d'); // 用于绘制底图
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

const ctx2 = canvas.getContext('2d'); // 用于绘制关系

const five = [
    {order: FIVE.JIN,  name: '金', position: [-256 + 30, 0 - 20]},
    {order: FIVE.MU,   name: '木', position: [256 - 30, 0 - 20]},
    {order: FIVE.SHUI, name: '水', position: [0 - 10, - 256 + 34]},
    {order: FIVE.HUO,  name: '火', position: [0 - 10, 256 - 30]},
    {order: FIVE.TU,   name: '土', position: [0 - 10, 0 - 20]},
];
const birthRelationship = [
    {from: FIVE.MU,   to: FIVE.HUO}, // 木生火
    {from: FIVE.HUO,  to: FIVE.TU}, // 火生土
    {from: FIVE.TU,   to: FIVE.JIN}, // 土生金
    {from: FIVE.JIN,  to: FIVE.SHUI}, // 金生水
    {from: FIVE.SHUI, to: FIVE.MU}, // 水生木
];
const overcomeRelationship = [
    {from: FIVE.MU,   to: FIVE.TU}, // 木克土
    {from: FIVE.TU,   to: FIVE.SHUI}, // 土克水
    {from: FIVE.SHUI, to: FIVE.HUO}, // 水克火
    {from: FIVE.HUO,  to: FIVE.JIN}, // 火克金
    {from: FIVE.JIN,  to: FIVE.MU}, // 金克木
];

function drawFive() {
    for (const item of five) {
        drawText(ctx, item.name, item.position);
    }
}

function drawRelationship() {
    drawBirthRelationship();
    drawOvercomeRelationship();
}

function drawBirthRelationship() {
    ctx2.save();
    ctx2.scale(-1, 1);
    ctx2.translate(110, 0);
    ctx2.beginPath();
    drawBirth(ctx2);
    ctx2.restore();

    ctx2.save();
    ctx2.rotate((90 * Math.PI) / 180);
    ctx2.translate(-100, -20);
    ctx2.beginPath();
    drawBirth(ctx2);
    ctx2.stroke();
    ctx2.restore();
}

function drawBirth(context) {
    context.strokeStyle = 'green';
    context.moveTo(-80, 30);
    context.lineTo(70, 30);
    context.stroke();
    context.moveTo(60, 40);
    context.lineTo(90, 30);
    context.lineTo(60, 20);
    context.fillStyle = 'green';
    context.fill();
}

function drawOvercomeRelationship() {
    ctx2.save();
    ctx2.scale(-1, 1);
    ctx2.translate(-110, 0);
    ctx2.beginPath();
    drawOvercome(ctx2);
    ctx2.stroke();
    ctx2.restore();

    ctx2.save();
    ctx2.rotate((90 * Math.PI) / 180);
    ctx2.translate(120, 0);
    ctx2.beginPath();
    drawOvercome(ctx2);
    ctx2.stroke();
    ctx2.restore();
}

function drawOvercome(context) {
    context.strokeStyle = 'orange';
    context.moveTo(-73, 20);
    context.lineTo(-35, 47);
    context.lineTo(-14, 31);
    context.lineTo(16, 47);
    context.lineTo(38, 29);
    context.lineTo(56, 48);
    context.lineTo(85, 12);
    context.lineTo(58, 20);
    context.lineTo(38, 2);
    context.lineTo(14, 21);
    context.lineTo(-13, 0);
    context.lineTo(-34, 20);
    context.lineTo(-73, -11);
}

function drawText(context, text, position) {
    context.save();
    context.fillStyle = "#333";
    context.font = "40px Arial";
    context.textAlign = "center";
    context.scale(1, -1);
    context.fillText(text, ...position);
    context.restore();
}

function showRelationship() {
    const popup = document.querySelector('.popup-dialog');
    popup.classList.add("visible");
    setTimeout(() => {
        popup.classList.remove("visible");
    }, 2000);
}

drawFive();
canvas.addEventListener('click', () => {
    // showRelationship();
    drawRelationship();
});
