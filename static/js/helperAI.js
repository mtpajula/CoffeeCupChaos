class HelperAI {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.cupsCarried = 0;
        this.maxCups = 3;
        this.targetX = x;
        this.targetY = y;
        this.isReturning = false;

        this.sprite = new Image();
        this.sprite.src = '/static/images/helperAI.svg';
    }

    update(coffees, kitchenArea) {
        if (this.cupsCarried < this.maxCups && !this.isReturning) {
            // Find the nearest coffee cup
            const nearestCoffee = this.findNearestCoffee(coffees);
            if (nearestCoffee) {
                this.moveTowards(nearestCoffee);
                if (this.isColliding(nearestCoffee)) {
                    this.collectCoffee(nearestCoffee);
                }
            }
        } else {
            // Return to the kitchen area
            this.isReturning = true;
            this.moveTowards(kitchenArea);
            if (this.isColliding(kitchenArea)) {
                this.dropCoffee();
                this.isReturning = false;
            }
        }
    }

    findNearestCoffee(coffees) {
        return coffees.reduce((nearest, coffee) => {
            if (coffee.isCollected) return nearest;
            const distance = Math.hypot(coffee.x - this.x, coffee.y - this.y);
            return (!nearest || distance < nearest.distance) ? {coffee, distance} : nearest;
        }, null)?.coffee;
    }

    moveTowards(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance > this.speed) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            this.x = target.x;
            this.y = target.y;
        }
    }

    isColliding(object) {
        return (
            this.x < object.x + object.width &&
            this.x + this.width > object.x &&
            this.y < object.y + object.height &&
            this.y + this.height > object.y
        );
    }

    collectCoffee(coffee) {
        if (this.cupsCarried < this.maxCups) {
            this.cupsCarried++;
            coffee.isCollected = true;
        }
    }

    dropCoffee() {
        this.cupsCarried = 0;
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
        
        // Draw the number of cups carried
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(this.cupsCarried, this.x + this.width / 2, this.y - 5);
    }
}
