class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.baseSpeed = 5;
        this.speed = this.baseSpeed;
        this.cupsCarried = 0;
        this.cupsCollected = 0;
        this.movingUp = false;
        this.movingDown = false;
        this.movingLeft = false;
        this.movingRight = false;

        this.sprite = new Image();
        this.sprite.src = '/static/images/player.svg';
    }

    update() {
        if (this.movingUp) this.y -= this.speed;
        if (this.movingDown) this.y += this.speed;
        if (this.movingLeft) this.x -= this.speed;
        if (this.movingRight) this.x += this.speed;

        // Keep player within canvas bounds
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // Recalculate speed based on cups carried
        this.speed = this.baseSpeed / (1 + this.cupsCarried * 0.2);
    }

    draw(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
                this.movingUp = true;
                break;
            case 'ArrowDown':
                this.movingDown = true;
                break;
            case 'ArrowLeft':
                this.movingLeft = true;
                break;
            case 'ArrowRight':
                this.movingRight = true;
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp':
                this.movingUp = false;
                break;
            case 'ArrowDown':
                this.movingDown = false;
                break;
            case 'ArrowLeft':
                this.movingLeft = false;
                break;
            case 'ArrowRight':
                this.movingRight = false;
                break;
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

    isCollidingWithKitchen(kitchen) {
        return this.isColliding(kitchen);
    }

    collectCoffee(coffee) {
        this.cupsCarried++;
        coffee.isCollected = true;
        // Recalculate speed
        this.speed = this.baseSpeed / (1 + this.cupsCarried * 0.2);

        // Check if player has collected 12 cups
        if (this.cupsCarried >= 12) {
            return this.dropCupsAround();
        }
        return null;
    }

    dropCupsAround() {
        const droppedCups = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dropX = this.x + Math.cos(angle) * 50; // 50 is the radius of the circle
            const dropY = this.y + Math.sin(angle) * 50;
            droppedCups.push(new Coffee(dropX, dropY));
        }
        this.cupsCarried = 0;
        this.speed = this.baseSpeed;
        return droppedCups;
    }

    dropCoffee() {
        this.cupsCollected += this.cupsCarried;
        this.cupsCarried = 0;
        // Reset speed to base speed
        this.speed = this.baseSpeed;
    }
}
