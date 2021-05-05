"use strict";
const canvas = document.createElement("canvas");
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const width = 1920;
const scale = innerWidth / width;
document.body.scrollTop = 0;
document.body.style.overflow = 'hidden';
let mouseCoord;
const defaultItems = [
    {
        name: 'pickaxe',
        type: 'tool',
        dimensions: { x: 2, y: 3 }
    },
    {
        name: 'ball',
        type: 'weapon',
        dimensions: { x: 1, y: 1 }
    }
];
let inventories;
let items;
let backpackItems;
let inventory = null;
let backpack = null;
let pickedItem;
const tileSize = 60;
window.onload = () => {
    const inventoryCols = 10;
    const inventoryRows = 6;
    const backpackRows = 10;
    const backpackCols = 6;
    items = new Array(inventoryRows * inventoryCols);
    items.fill(null);
    backpackItems = new Array(backpackRows * backpackCols);
    backpackItems.fill(null);
    inventory = new Inventory('Склад', canvas, 100, 50, tileSize, inventoryRows, inventoryCols, items);
    backpack = new Inventory('Рюкзак', canvas, 1200, 50, tileSize, backpackRows, backpackCols, backpackItems);
    inventories = new Array(2);
    inventories[0] = inventory;
    inventories[1] = backpack;
    requestAnimationFrame(requestFrame);
};
function requestFrame() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    inventory === null || inventory === void 0 ? void 0 : inventory.draw();
    backpack === null || backpack === void 0 ? void 0 : backpack.draw();
    if (pickedItem) {
        pickedItem === null || pickedItem === void 0 ? void 0 : pickedItem.item.draw({ x: 0, y: 0 });
    }
    ctx.restore();
    requestAnimationFrame(requestFrame);
}
function addItem(itemNumber) {
    const item = defaultItems[itemNumber];
    if (inventory === null || inventory === void 0 ? void 0 : inventory.tryAddItem(item)) {
        console.log('Item added');
    }
    else {
        console.log('Item not added');
    }
}
function clearInventory() {
    inventory === null || inventory === void 0 ? void 0 : inventory.clear();
}
canvas.addEventListener('mousemove', (event) => {
    mouseCoord = getMousePos(canvas, event);
    for (let i = 0; i < inventories.length; i++) {
        if (isInside(mouseCoord, inventories[i].x, inventories[i].y, inventories[i].getWidth(), inventories[i].getHeight())) {
            if (pickedItem) {
                moveItem(pickedItem.item, inventories[i]);
            }
        }
    }
    inventory === null || inventory === void 0 ? void 0 : inventory.mouseMove();
    backpack === null || backpack === void 0 ? void 0 : backpack.mouseMove();
});
canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mouseup', mouseUp, false);
function clampInteger(num, a, b) {
    return Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
}
function mouseDown() {
    for (let i = 0; i < inventories.length; i++) {
        if (isInside(mouseCoord, inventories[i].x, inventories[i].y, inventories[i].getWidth(), inventories[i].getHeight())) {
            inventories[i].mouseDown();
        }
    }
}
function mouseUp() {
    let itemDropped = false;
    if (pickedItem) {
        for (let i = 0; i < inventories.length; i++) {
            if (isInside(mouseCoord, inventories[i].x, inventories[i].y, inventories[i].getWidth(), inventories[i].getHeight())) {
                const result = inventories[i].onDrop(pickedItem);
                if (result) {
                    if ((pickedItem === null || pickedItem === void 0 ? void 0 : pickedItem.lastInventory) !== inventories[i]) {
                        console.log(`Предмет ${pickedItem === null || pickedItem === void 0 ? void 0 : pickedItem.item.name} был перемещён из инвентаря "${pickedItem === null || pickedItem === void 0 ? void 0 : pickedItem.lastInventory.name}" в инвентарь "${inventories[i].name}"`);
                    }
                    pickedItem = null;
                    itemDropped = true;
                }
            }
        }
        if (!itemDropped) {
            pickedItem === null || pickedItem === void 0 ? void 0 : pickedItem.lastInventory.addItemAt(pickedItem.item, pickedItem.lastInventory.tileToIndex(pickedItem.lastTopLeftTile));
            pickedItem === null || pickedItem === void 0 ? void 0 : pickedItem.item.drop();
            pickedItem = null;
        }
    }
}
function moveItem(item, inventory) {
    const mousePosition = item.mousePositionInTile(mouseCoord, inventory.x, inventory.y);
    const mousePositionRight = mousePosition.right ? 1 : 0;
    const mousePositionDown = mousePosition.down ? 1 : 0;
    const newDimensionX = item.dimensions.x - mousePositionRight;
    const newDimensionY = item.dimensions.y - mousePositionDown;
    const dimensionX = clampInteger(newDimensionX, 0, newDimensionX);
    const dimensionY = clampInteger(newDimensionY, 0, newDimensionY);
    pickedItem.currentTopLeftTile = {
        x: Math.round(Math.trunc((mouseCoord.x - inventory.x) / tileSize) - dimensionX / 2),
        y: Math.round(Math.trunc((mouseCoord.y - inventory.y) / tileSize) - dimensionY / 2)
    };
    for (let i = 0; i < inventories.length; i++) {
        if (isInside(mouseCoord, inventories[i].x, inventories[i].y, inventories[i].getWidth(), inventories[i].getHeight())) {
            inventories[i].isDragging = true;
        }
        else {
            inventories[i].isDragging = false;
        }
    }
}
function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) / scale,
        y: (event.clientY - rect.top) / scale
    };
}
function isInside(point, x, y, width, height) {
    return (point.x >= x && point.x <= (x + width) && point.y >= y && point.y <= (y + height));
}
