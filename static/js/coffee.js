class Coffee {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.isCollected = false;

        this.sprite = new Image();
        this.sprite.src = '/static/images/coffee.svg';
    }

    draw(ctx) {
        if (!this.isCollected) {
            ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        }
    }
}
