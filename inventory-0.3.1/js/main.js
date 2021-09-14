'use strict';
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const width = 1920;
const scale = innerWidth / width;
document.body.scrollTop = 0;
document.body.style.overflow = 'hidden';
let mouseCoord;
const defaultItems = [
  {
    name: 'pickaxe',
    type: 'tool',
    dimensions: { x: 2, y: 3 },
  },
  {
    name: 'ball',
    type: 'weapon',
    dimensions: { x: 1, y: 1 },
  },
];
let inventories;
let items;
let backpackItems;
let inventory = null;
let backpack = null;
let pickedItem;
const tileSize = 60;
const testItemsList = [
  {
    item: defaultItems[0],
    index: 0,
  },
  {
    item: defaultItems[0],
    index: 4,
  },
  {
    item: defaultItems[0],
    index: 4,
  },
];
window.onload = () => {
  const inventoryCols = 10;
  const inventoryRows = 15;
  const backpackRows = 15;
  const backpackCols = 10;
  items = new Array(inventoryRows * inventoryCols);
  items.fill(null);
  backpackItems = new Array(backpackRows * backpackCols);
  backpackItems.fill(null);
  inventory = new Inventory(
    'Склад',
    canvas,
    100,
    100,
    tileSize,
    inventoryRows,
    inventoryCols,
    items
  );
  backpack = new Inventory(
    'Рюкзак',
    canvas,
    1200,
    100,
    tileSize,
    backpackRows,
    backpackCols,
    backpackItems
  );
  inventories = new Array(2);
  inventories[0] = inventory;
  inventories[1] = backpack;
  for (let i = 0; i < testItemsList.length; i++) {
    inventory.addItemAt(testItemsList[i].item, testItemsList[i].index);
  }
  requestAnimationFrame(requestFrame);
};
function requestFrame() {
  ctx.save();
  clearCanvas();
  ctx.scale(scale, scale);
  inventory === null || inventory === void 0 ? void 0 : inventory.draw();
  backpack === null || backpack === void 0 ? void 0 : backpack.draw();
  if (pickedItem) {
    pickedItem === null || pickedItem === void 0
      ? void 0
      : pickedItem.item.draw({ x: 0, y: 0 });
  }
  ctx.restore();
  requestAnimationFrame(requestFrame);
}
function addItem(itemNumber) {
  const item = defaultItems[itemNumber];
  if (
    inventory === null || inventory === void 0
      ? void 0
      : inventory.tryAddItem(item)
  ) {
    console.log('Item added');
  } else {
    console.log('Item not added');
  }
}
function clearInventory() {
  inventory === null || inventory === void 0 ? void 0 : inventory.clear();
}
canvas.addEventListener('mousemove', (event) => {
  mouseCoord = getMousePos(canvas, event);
  for (let i = 0; i < inventories.length; i++) {
    if (
      isInside(
        mouseCoord,
        inventories[i].currentX,
        inventories[i].currentY,
        inventories[i].getWidth(),
        inventories[i].getHeight()
      )
    ) {
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
canvas.addEventListener('contextmenu', showContextMenu, false);
canvas.addEventListener('wheel', scrollInventory, false);
document.addEventListener(
  'contextmenu',
  (e) => {
    e.preventDefault();
  },
  false
);
function scrollInventory(event) {
  mouseCoord = getMousePos(canvas, event);
  for (let i = 0; i < inventories.length; i++) {
    if (
      isInside(
        mouseCoord,
        inventories[i].x,
        inventories[i].y,
        inventories[i].getWidth(),
        inventories[i].getHeight()
      )
    ) {
      const delta = event.deltaY > 0 ? -1 : 1;
      inventories[i].setScrollDirection(delta);
    }
  }
}
function showContextMenu(event) {
  event.preventDefault();
}
function clampInteger(num, a, b) {
  return Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
}
function clampFloat(num, a, b) {
  return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}
function mouseDown(event) {
  switch (event.button) {
    case 2:
      for (let i = 0; i < inventories.length; i++) {
        if (
          isInside(
            mouseCoord,
            inventories[i].x,
            inventories[i].y,
            inventories[i].getWidth(),
            inventories[i].getHeight()
          )
        ) {
          inventories[i].showContextMenu(mouseCoord);
        }
      }
      break;
    default:
      for (let i = 0; i < inventories.length; i++) {
        if (
          isInside(
            mouseCoord,
            inventories[i].x,
            inventories[i].y,
            inventories[i].getWidth(),
            inventories[i].getHeight()
          )
        ) {
          inventories[i].mouseDown(mouseCoord);
        }
      }
      break;
  }
}
function mouseUp() {
  let itemDropped = false;
  if (pickedItem) {
    for (let i = 0; i < inventories.length; i++) {
      if (
        isInside(
          mouseCoord,
          inventories[i].frame.x,
          inventories[i].frame.y,
          inventories[i].frame.width,
          inventories[i].frame.height
        )
      ) {
        const result = inventories[i].onDrop(pickedItem);
        if (result) {
          if (
            (pickedItem === null || pickedItem === void 0
              ? void 0
              : pickedItem.lastInventory) !== inventories[i]
          ) {
            console.log(
              `Предмет ${
                pickedItem === null || pickedItem === void 0
                  ? void 0
                  : pickedItem.item.name
              } был перемещён из инвентаря "${
                pickedItem === null || pickedItem === void 0
                  ? void 0
                  : pickedItem.lastInventory.name
              }" в инвентарь "${inventories[i].name}"`
            );
          }
          pickedItem = null;
          itemDropped = true;
        }
      }
    }
    if (!itemDropped) {
      pickedItem === null || pickedItem === void 0
        ? void 0
        : pickedItem.lastInventory.addItemAt(
            pickedItem.item,
            pickedItem.lastInventory.tileToIndex(pickedItem.lastTopLeftTile)
          );
      pickedItem === null || pickedItem === void 0
        ? void 0
        : pickedItem.item.drop();
      pickedItem = null;
    }
  }
  for (let i = 0; i < inventories.length; i++) {
    inventories[i].mouseUp();
  }
}
function moveItem(item, inventory) {
  const mousePosition = item.mousePositionInTile(
    mouseCoord,
    inventory.x,
    inventory.y
  );
  const mousePositionRight = mousePosition.right ? 1 : 0;
  const mousePositionDown = mousePosition.down ? 1 : 0;
  const newDimensionX = item.dimensions.x - mousePositionRight;
  const newDimensionY = item.dimensions.y - mousePositionDown;
  const dimensionX = clampInteger(newDimensionX, 0, newDimensionX);
  const dimensionY = clampInteger(newDimensionY, 0, newDimensionY);
  pickedItem.currentTopLeftTile = {
    x: Math.round(
      Math.trunc((mouseCoord.x - inventory.currentX) / tileSize) -
        dimensionX / 2
    ),
    y: Math.round(
      Math.trunc((mouseCoord.y - inventory.currentY) / tileSize) -
        dimensionY / 2
    ),
  };
  for (let i = 0; i < inventories.length; i++) {
    if (
      isInside(
        mouseCoord,
        inventories[i].x,
        inventories[i].y,
        inventories[i].getWidth(),
        inventories[i].getHeight()
      )
    ) {
      inventories[i].isDragging = true;
    } else {
      inventories[i].isDragging = false;
    }
  }
  const delta = getScrollDirectionWhenItemDrag(
    mouseCoord.y,
    inventory.frame.y,
    inventory.frame.y + inventory.frame.height
  );
  inventory.setScrollDirection(delta);
}
function getScrollDirectionWhenItemDrag(y, startY, endY) {
  if (y > endY) {
    return -1;
  } else if (y < startY) {
    return 1;
  }
  return 0;
}
function getMousePos(canvas, event) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale,
  };
}
function isInside(point, x, y, width, height) {
  return (
    point.x >= x &&
    point.x <= x + width &&
    point.y >= y &&
    point.y <= y + height
  );
}
function clearCanvas() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}
