"use strict";
class ContextMenu {
    constructor(ctx, x, y, width, height, menuItems) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.menuItems = menuItems;
        this.width = width;
        this.height = menuItems.length * height;
        this.itemHeight = height;
    }
    draw() {
        this.ctx.save();
        const primaryColorDark = 'rgb(20, 20, 20)';
        const primaryColor = 'rgb(51,48,73)';
        this.ctx.strokeStyle = 'rgb(43, 40, 62)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        this.ctx.shadowColor = primaryColorDark;
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillStyle = primaryColor;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.shadowColor = 'transparent';
        this.menuItems.forEach((item, index) => {
            const localY = this.y + this.itemHeight * index;
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12pt Arial';
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = "left";
            this.ctx.fillText(item, this.x + 10, localY + (this.itemHeight / 2), this.width);
        });
        this.ctx.restore();
    }
    isInside(coord) {
        return (coord.x >= this.x && coord.x <= this.x + this.width && coord.y >= this.y && coord.y <= this.y + this.height);
    }
}
