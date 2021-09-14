"use strict";
class Scrollbar {
    constructor(ctx, x, y, width, height, sliderHeight) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.slider = {
            x: x,
            y: y,
            width: width,
            height: sliderHeight
        };
        this.isDragging = false;
        this.shiftY = 0;
    }
    draw() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(this.x, this.y, -this.width, this.height);
        this.drawSlider();
        this.ctx.restore();
    }
    changeSliderPosition(offsetY) {
        this.moveSlider(-(offsetY / tileSize) * this.slider.height);
    }
    mouseDownOnSlider(mouseCoord) {
        if (isInside(mouseCoord, this.slider.x - this.slider.width, this.slider.y, this.slider.width, this.slider.height)) {
            this.isDragging = true;
            this.shiftY = mouseCoord.y - this.slider.y;
        }
    }
    moveSlider(offsetY) {
        const newY = this.slider.y + offsetY;
        if (newY < this.y) {
            this.slider.y = this.y;
            return false;
        }
        else if (newY > (this.y + this.height - this.slider.height)) {
            this.slider.y = this.y + this.height - this.slider.height;
            return false;
        }
        else {
            this.slider.y = newY;
            return true;
        }
    }
    getSliderCoords() {
        return {
            x: this.slider.x,
            y: this.slider.y
        };
    }
    isYAxisValid(y) {
        return (y >= this.y && y <= (this.y + this.height) - this.slider.height);
    }
    drawSlider() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(this.slider.x, this.slider.y, -this.slider.width, this.slider.height);
        this.ctx.restore();
    }
}
