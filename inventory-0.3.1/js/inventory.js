"use strict";
class Inventory {
    constructor(name, canvas, x, y, tileSize, rows, cols, items) {
        this.name = name;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.rows = rows;
        this.cols = cols;
        this.isDirty = false;
        this.isDragging = false;
        this.items = items;
    }
    draw() {
        this.drawTiles();
        this.refresh();
    }
    indexToTile(index) {
        let tile = {
            x: 0,
            y: 0
        };
        tile.x = index % this.cols;
        tile.y = (index - index % this.cols) / this.cols;
        return tile;
    }
    tileToIndex(tile) {
        return tile.y * this.cols + tile.x;
    }
    drawTiles() {
        this.ctx.save();
        for (let i = 0; i <= this.cols; i++) {
            const coord = this.globalCoordToLocal({ x: this.tileSize * i, y: this.getHeight() });
            this.drawLine(coord.x, this.y, coord.x, coord.y);
        }
        for (let i = 0; i <= this.rows; i++) {
            const coord = this.globalCoordToLocal({ x: this.getWidth(), y: this.tileSize * i });
            this.drawLine(this.x, coord.y, coord.x, coord.y);
        }
        this.ctx.restore();
    }
    removeItem(item) {
        if (this.isItemValid(item)) {
            this.items.forEach((i, index) => {
                if (i == item) {
                    this.items[index] = null;
                }
            });
        }
    }
    clear() {
        this.items.fill(null);
    }
    refresh() {
        this.drawTiles();
        const items = this.getAllItems();
        for (let [item, topLeftTile] of items.entries()) {
            if (!item.picked)
                item.draw(topLeftTile);
        }
        for (let [item, topLeftTile] of items.entries()) {
            if (item.picked)
                item.draw(topLeftTile);
        }
        for (let item of items.keys()) {
            if (item.hover) {
                item.drawTooltip();
            }
        }
        if (this.isDragging && pickedItem) {
            this.drawShadow(pickedItem.item, pickedItem.currentTopLeftTile);
        }
        this.isDirty = false;
    }
    mouseMove() {
        const items = this.getAllItems();
        for (let [item, topLeftTile] of items.entries()) {
            if (this.isItemValid(item)) {
                if (this.isInside(item, topLeftTile) && !this.isDragging) {
                    item.hover = true;
                }
                else if (item.hover) {
                    item.hover = false;
                }
                if (item.picked) {
                    item.hover = true;
                }
            }
        }
    }
    mouseDown() {
        const items = this.getAllItems();
        for (let [item, topLeftTile] of items.entries()) {
            if (this.isItemValid(item)) {
                if (this.isInside(item, topLeftTile)) {
                    item.pickup();
                    this.isDragging = true;
                    pickedItem = {
                        item: item,
                        lastInventory: this,
                        lastTopLeftTile: topLeftTile,
                        currentTopLeftTile: topLeftTile
                    };
                    this.removeItem(item);
                }
            }
        }
    }
    onDrop(pickedItem) {
        console.log('onDrop');
        if (this.isRoomAvailable(pickedItem.item, this.tileToIndex(pickedItem.currentTopLeftTile)) && this.isTileValid(pickedItem.currentTopLeftTile)) {
            const i = new Item(ctx, pickedItem.item, this.x, this.y, this.tileSize, pickedItem.currentTopLeftTile);
            this.addItemAt(i, this.tileToIndex(pickedItem.currentTopLeftTile));
            this.removeItem(pickedItem.item);
            return true;
        }
        else {
            pickedItem.item.drop();
        }
        this.isDragging = false;
        return false;
    }
    drawShadow(item, draggedItemTopLeftTile) {
        const shadowColor = (this.isRoomAvailable(item, this.tileToIndex(draggedItemTopLeftTile))
            && this.isTileValid(draggedItemTopLeftTile))
            ? 'rgba(0, 255, 0, 0.2)'
            : 'rgba(255, 0, 0, 0.2)';
        const positionX = this.x + draggedItemTopLeftTile.x * tileSize;
        const positionY = this.y + draggedItemTopLeftTile.y * this.tileSize;
        this.drawBox(positionX, positionY, item.dimensions.x * this.tileSize, item.dimensions.y * this.tileSize, shadowColor);
    }
    mousePositionInTile(mousePosition) {
        const right = ((mousePosition.x % this.tileSize) > (this.tileSize / 2));
        const down = ((mousePosition.y % this.tileSize) > (this.tileSize / 2));
        return {
            right,
            down
        };
    }
    isInside(item, tile) {
        const pos = mouseCoord;
        const coord = this.globalCoordToLocal({
            x: tile.x * this.tileSize,
            y: tile.y * this.tileSize
        });
        const x = coord.x;
        const y = coord.y;
        return pos.x > x && pos.x < x + item.width && pos.y < y + item.height && pos.y > y;
    }
    drawLine(startX, startY, endX, endY) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    getAllItems() {
        let allItems = new Map();
        this.items.forEach((item, index) => {
            if (this.isItemValid(item)) {
                if (!allItems.has(item)) {
                    allItems.set(item, this.indexToTile(index));
                }
            }
        });
        return allItems;
    }
    tryAddItem(item) {
        if (this.isItemValid(item)) {
            for (let i = 0; i < this.items.length; i++) {
                const newItem = new Item(ctx, item, this.x, this.y, tileSize, this.indexToTile(i));
                if (this.isRoomAvailable(newItem, i)) {
                    this.addItemAt(newItem, i);
                    return true;
                }
            }
        }
        return false;
    }
    getWidth() {
        return this.tileSize * this.cols;
    }
    getHeight() {
        return this.tileSize * this.rows;
    }
    addItemAt(item, topLeftIndex) {
        this.isDragging = false;
        const tile = this.indexToTile(topLeftIndex);
        const size = item.dimensions;
        for (let i = tile.x; i < tile.x + size.x; i++) {
            for (let j = tile.y; j < tile.y + size.y; j++) {
                const newTile = { x: i, y: j };
                this.items[this.tileToIndex(newTile)] = item;
            }
        }
        this.isDirty = true;
        this.refresh();
    }
    isRoomAvailable(item, topLeftIndex) {
        const tile = this.indexToTile(topLeftIndex);
        const size = item.dimensions;
        for (let i = tile.x; i < tile.x + size.x; i++) {
            for (let j = tile.y; j < tile.y + size.y; j++) {
                const newTile = { x: i, y: j };
                if (this.isTileValid(newTile)) {
                    const getItem = this.getItemAtIndex(this.tileToIndex(newTile));
                    if (this.isItemValid(getItem)) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
    getItemAtIndex(index) {
        return this.items[index];
    }
    isTileValid(tile) {
        return (tile.x >= 0 && tile.y >= 0 && tile.x < this.cols && tile.y < this.rows);
    }
    isItemValid(item) {
        return item != null;
    }
    globalCoordToLocal(coord) {
        return {
            x: this.x + coord.x,
            y: this.y + coord.y
        };
    }
    drawBox(x, y, width, height, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }
}
