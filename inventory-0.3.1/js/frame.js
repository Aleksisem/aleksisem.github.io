"use strict";
class Frame {
    constructor(ctx, x, y, width, height, title, maxTiles) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.title = title;
        this.maxTiles = maxTiles;
        this.busyTiles = 0;
        this.titleHeight = 35;
        this.titlePadding = 10;
    }
    draw() {
        this.drawTitle();
        this.drawTilesAmount();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x + this.width, this.y);
        this.ctx.lineTo(this.x + this.width, this.y + this.height);
        this.ctx.lineTo(this.x, this.y + this.height);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.clip();
    }
    changeBusyTilesAmount(busyTiles) {
        this.busyTiles = busyTiles;
    }
    drawTitle() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgb(51,48,73)';
        this.ctx.fillRect(this.x, this.y, this.width, -this.titleHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14pt Arial';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.title, this.x + this.titlePadding, (this.y - this.titleHeight / 2 + 2));
        this.ctx.restore();
    }
    drawTilesAmount() {
        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14pt Arial';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'right';
        const tileAmountText = `${this.busyTiles} / ${this.maxTiles}`;
        this.ctx.fillText(tileAmountText, this.x + this.width - this.titlePadding, (this.y - this.titleHeight / 2 + 2));
        this.ctx.restore();
    }
}
