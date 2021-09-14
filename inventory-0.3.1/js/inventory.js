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
        this.isDragging = false;
        this.items = items;
        this.currentX = x;
        this.currentY = y;
        const allItems = this.getNonNullableItems(items);
        this.frame = new Frame(this.ctx, x, y, clampInteger(this.cols * this.tileSize, 0, 10 * this.tileSize), clampInteger(this.rows * this.tileSize, 0, 10 * this.tileSize), name, rows * cols);
        this.frame.changeBusyTilesAmount(allItems.length);
        this.scrollbar = (this.frame.height < this.getHeight()) ? new Scrollbar(this.ctx, this.x + this.getWidth(), this.y, 10, this.frame.height, this.frame.height / ((this.getHeight() - this.frame.height) / this.tileSize + 1)) : null;
        this.contextMenu = null;
    }
    draw() {
        this.ctx.save();
        this.frame.draw();
        this.drawTiles();
        const items = this.getAllItems();
        for (let [item, topLeftTile] of items.entries()) {
            item.draw(topLeftTile);
        }
        if (this.isDragging && pickedItem) {
            this.drawShadow(pickedItem.item, pickedItem.currentTopLeftTile);
        }
        this.ctx.restore();
        if (this.scrollbar) {
            this.scrollbar.draw();
        }
        for (let item of items.keys()) {
            if (item.hover) {
                item.drawTooltip();
            }
        }
        if (this.contextMenu) {
            this.contextMenu.draw();
        }
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
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        for (let i = 0; i <= this.cols; i++) {
            const coord = this.globalCoordToLocal({ x: this.tileSize * i, y: this.getHeight() });
            this.drawLine(coord.x, this.currentY, coord.x, coord.y);
        }
        for (let i = 0; i <= this.rows; i++) {
            const coord = this.globalCoordToLocal({ x: this.getWidth(), y: this.tileSize * i });
            this.drawLine(this.currentX, coord.y, coord.x, coord.y);
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
    mouseDown(mouseCoord) {
        var _a, _b;
        (_a = this.scrollbar) === null || _a === void 0 ? void 0 : _a.mouseDownOnSlider(mouseCoord);
        if (!((_b = this.contextMenu) === null || _b === void 0 ? void 0 : _b.isInside(mouseCoord))) {
            this.contextMenu = null;
        }
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
    mouseUp() {
        var _a;
        if ((_a = this.scrollbar) === null || _a === void 0 ? void 0 : _a.isDragging) {
            this.scrollbar.isDragging = false;
            this.scrollbar.shiftY = 0;
        }
    }
    showContextMenu(mouseCoord) {
        const items = this.getAllItems();
        for (let [item, topLeftTile] of items.entries()) {
            if (this.isItemValid(item)) {
                if (this.isInside(item, topLeftTile)) {
                    const menuItems = [
                        'Экипировать',
                        'Выбросить'
                    ];
                    this.contextMenu = new ContextMenu(this.ctx, mouseCoord.x, mouseCoord.y, 120, 30, menuItems);
                    console.log('ContextMenu draw');
                }
            }
        }
    }
    onDrop(pickedItem) {
        console.log('onDrop');
        if (this.isRoomAvailable(pickedItem.item, this.tileToIndex(pickedItem.currentTopLeftTile)) && this.isTileValid(pickedItem.currentTopLeftTile)) {
            const i = new Item(ctx, pickedItem.item, this.currentX, this.currentY, this.tileSize, pickedItem.currentTopLeftTile);
            this.addItemAt(i, this.tileToIndex(pickedItem.currentTopLeftTile));
            this.removeItem(pickedItem.item);
            pickedItem.lastInventory.frame.changeBusyTilesAmount(pickedItem.lastInventory.getNonNullableItems(pickedItem.lastInventory.items).length);
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
        const positionX = this.currentX + draggedItemTopLeftTile.x * tileSize;
        const positionY = this.currentY + draggedItemTopLeftTile.y * this.tileSize;
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
                if (this.isRoomAvailable(item, i)) {
                    this.addItemAt(item, i);
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
        const newItem = new Item(ctx, item, this.currentX, this.currentY, this.tileSize, tile);
        for (let i = tile.x; i < tile.x + size.x; i++) {
            for (let j = tile.y; j < tile.y + size.y; j++) {
                const newTile = { x: i, y: j };
                this.items[this.tileToIndex(newTile)] = newItem;
            }
        }
        this.frame.changeBusyTilesAmount(this.getNonNullableItems(this.items).length);
        this.draw();
    }
    setScrollDirection(delta) {
        for (let i = 0; i < this.tileSize / 2; i++) {
            setTimeout(() => {
                const newY = 2 * delta;
                if (this.isYAxisValid(this.currentY + newY)) {
                    this.scroll(newY);
                }
            }, i * 5);
        }
    }
    scroll(offsetY) {
        var _a, _b;
        this.currentY += offsetY;
        if (!((_a = this.scrollbar) === null || _a === void 0 ? void 0 : _a.isDragging)) {
            (_b = this.scrollbar) === null || _b === void 0 ? void 0 : _b.changeSliderPosition(offsetY);
        }
        const items = this.getAllItems();
        for (let item of items.keys()) {
            item.y += offsetY;
        }
    }
    isYAxisValid(y) {
        return (y <= this.y && y >= (this.getHeight() - this.frame.height - this.y) * -1);
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
            x: this.currentX + coord.x,
            y: this.currentY + coord.y
        };
    }
    drawBox(x, y, width, height, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }
    getNonNullableItems(items) {
        return items.filter(item => item != null);
    }
}
