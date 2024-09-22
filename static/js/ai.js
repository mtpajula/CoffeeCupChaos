class AI {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 3;
        this.isCarryingCoffee = false;
        this.targetX = x;
        this.targetY = y;

        this.sprite = new Image();
        this.sprite.src = '/static/images/ai.svg';
    }

    update(coffees, kitchen) {
        if (this.isCarryingCoffee) {
            // Find a random spot to drop the coffee
            if (this.x === this.targetX && this.y === this.targetY) {
                this.dropCoffee(coffees);
                this.findNewTarget();
            }
        } else {
            // Go to the kitchen to pick up a coffee
            if (this.x === kitchen.x && this.y === kitchen.y) {
                this.pickUpCoffee();
                this.findNewTarget();
            } else {
                this.targetX = kitchen.x;
                this.targetY = kitchen.y;
            }
        }

        // Move towards the target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.speed) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
        }
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }

    findNewTarget() {
        this.targetX = Math.random() * (canvas.width - this.width);
        this.targetY = Math.random() * (canvas.height - this.height);
    }

    pickUpCoffee() {
        this.isCarryingCoffee = true;
    }

    dropCoffee(coffees) {
        if (this.isCarryingCoffee) {
            this.isCarryingCoffee = false;
            coffees.push(new Coffee(this.x, this.y));
        }
    }
}
