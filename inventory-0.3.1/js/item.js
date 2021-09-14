"use strict";
let Item = (() => {
    class Item {
        constructor(ctx, item, x, y, tileSize, topLeftTile) {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.tileSize = tileSize;
            this.name = item.name;
            this.type = item.type;
            this.dimensions = item.dimensions;
            this.image = new Image();
            this.image.src = 'img/' + item.type + '/' + item.name + '.png';
            this.hover = false;
            this.topLeftTile = topLeftTile;
            this.width = this.dimensions.x * tileSize;
            this.height = this.dimensions.y * tileSize;
            this.picked = false;
        }
        draw(topLeftTile) {
            this.ctx.save();
            const size = {
                x: this.tileSize * this.dimensions.x,
                y: this.tileSize * this.dimensions.y
            };
            let coord;
            if (this.picked) {
                coord = {
                    x: mouseCoord.x - this.width / 2,
                    y: mouseCoord.y - this.height / 2
                };
            }
            else {
                coord = this.globalCoordToLocal({
                    x: this.topLeftTile.x * this.tileSize,
                    y: this.topLeftTile.y * this.tileSize
                });
            }
            this.ctx.fillStyle = 'rgba(51, 48, 73, 0.8)';
            this.ctx.fillRect(coord.x, coord.y, size.x, size.y);
            this.ctx.drawImage(this.image, coord.x + Item.padding, coord.y + Item.padding, size.x - 2 * Item.padding, size.y - 2 * Item.padding);
            if (this.hover) {
                this.fade(coord);
            }
            this.ctx.restore();
        }
        fade(coord) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(coord.x, coord.y, this.width, this.height);
            this.ctx.restore();
        }
        drawTooltip() {
            this.ctx.save();
            this.ctx.fillStyle = 'rgb(51,48,73)';
            this.ctx.fillRect(mouseCoord.x, mouseCoord.y, 200, 75);
            this.ctx.strokeStyle = 'rgb(43, 40, 62)';
            this.ctx.lineWidth = 5;
            this.ctx.strokeRect(mouseCoord.x, mouseCoord.y, 200, 75);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14pt Arial';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.name, mouseCoord.x + 100 - this.ctx.measureText(this.name).width / 2, mouseCoord.y + 35);
            this.ctx.restore();
        }
        pickup() {
            this.picked = true;
        }
        drop() {
            this.picked = false;
            this.hover = false;
        }
        mousePositionInTile(mousePosition, x, y) {
            const right = (((mousePosition.x - x) % this.tileSize) > (this.tileSize / 2));
            const down = (((mousePosition.y - y) % this.tileSize) > (this.tileSize / 2));
            return {
                right,
                down
            };
        }
        globalCoordToLocal(coord) {
            return {
                x: this.x + coord.x,
                y: this.y + coord.y
            };
        }
    }
    Item.padding = 5;
    return Item;
})();
