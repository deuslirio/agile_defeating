namespace Bullet {
    export let bulletDirection;
    export let bullets: Array<Sup.ArcadePhysics2D.Body> = [];
}


class BulletBehavior extends Sup.Behavior {
    speed = 0.2;
    movement = false;
    timeToHit = 0;
    lastVelocity = new Sup.Math.Vector2();
    direction;

    awake() {
        this.direction = Bullet.bulletDirection;
        // this.actor.setPosition(Sup.getActor("Player").getPosition());
        if (this.direction == "LEFT") {
            this.actor.arcadeBody2D.warpPosition(Sup.getActor("Player").getPosition().x - 1, Sup.getActor("Player").getPosition().y);
        }
        else if (this.direction == "RIGHT") {
            this.actor.arcadeBody2D.warpPosition(Sup.getActor("Player").getPosition().x + 1, Sup.getActor("Player").getPosition().y);
        }
        else if (this.direction == "UP") {
            this.actor.arcadeBody2D.warpPosition(Sup.getActor("Player").getPosition().x, Sup.getActor("Player").getPosition().y + 1);
        }
        else if (this.direction == "DOWN") {
            this.actor.arcadeBody2D.warpPosition(Sup.getActor("Player").getPosition().x, Sup.getActor("Player").getPosition().y - 1);
        }

        this.actor.setVisible(true);
        this.actor.arcadeBody2D.setEnabled(true);
        Bullet.bullets.push(this.actor.arcadeBody2D);
    }

    update() {
        if (!isPaused) {
            let velocity = this.actor.arcadeBody2D.getVelocity();
            if (this.movement == false) {

                velocity = new Sup.Math.Vector2(0, 0);
            }
            if (this.movement == true) {

                velocity = this.lastVelocity;
            }
            else if (this.direction == "LEFT") {

                velocity.x = 0;
                velocity.y = 0;
                velocity.x = -this.speed;
                this.movement = true;
            }
            else if (this.direction == "RIGHT") {

                velocity.x = 0;
                velocity.y = 0;
                velocity.x = this.speed;
                this.movement = true;
            }
            else if (this.direction == "UP") {

                velocity.x = 0;
                velocity.y = 0;
                velocity.y = this.speed;
                this.movement = true;
            }
            else if (this.direction == "DOWN") {

                velocity.x = 0;
                velocity.y = 0;
                velocity.y = -this.speed;
                this.movement = true;
            }
            else if (this.direction == "NONE") {

                velocity.x = 0;
                velocity.y = 0;
                this.movement = false;
            }


            this.lastVelocity = velocity;
            this.actor.arcadeBody2D.setVelocity(velocity);

            if (this.actor.spriteRenderer.getAnimation() == "hit") {
                this.timeToHit++;
                this.movement = false;
            }



            if (this.timeToHit > 30) {

                this.actor.destroy();
            }

            if (this.actor.arcadeBody2D.getMovable() && (Sup.ArcadePhysics2D.intersects(this.actor.arcadeBody2D, Sup.getActor("Map").arcadeBody2D) || Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Sup.ArcadePhysics2D.getAllBodies()))) {

                if (this.timeToHit == 0) {
                    this.actor.spriteRenderer.setAnimation("hit");
                    this.timeToHit++;
                    this.movement = false;
                    this.direction = "NONE";
                    this.actor.arcadeBody2D.setMovable(false);
                    this.actor.arcadeBody2D.setEnabled(false);
                    Bullet.bullets.splice(Bullet.bullets.indexOf(this.actor.arcadeBody2D), 1);
                }
            }


        }

    }

    onDestroy() {

    }

}

Sup.registerBehavior(BulletBehavior);
