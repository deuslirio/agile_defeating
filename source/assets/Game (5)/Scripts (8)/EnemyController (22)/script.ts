namespace Enemy {
    export let enemies: Array<Sup.ArcadePhysics2D.Body> = [];
}


class EnemyBehavior extends Sup.Behavior {
    speed: number = 0.08;
    lastVelocity = new Sup.Math.Vector2();
    movement: number = 0;
    direction;
    lifes = 2;
    movingTime = 0;
    maxMovingTime = 10;

    awake() { // set position of Player actor to the playerPosition 2D vector
        this.actor.arcadeBody2D.setEnabled(true);
        Enemy.enemies.push(this.actor.arcadeBody2D);
        this.actor.arcadeBody2D.warpPosition(levelInfo.enemyPosition);
        this.lifes = levelInfo.enemyLifes;
        this.speed = levelInfo.enemySpeed;
        let typeEnemy = Math.floor(Math.random() * 100) + 1;

        if (typeEnemy >= 66) {
            this.actor.spriteRenderer.setSprite("Game/Sprites/Enemy1");

        }
        else if (typeEnemy >= 33) {
            this.actor.spriteRenderer.setSprite("Game/Sprites/Enemy1");

        }
        else {
            this.actor.spriteRenderer.setSprite("Game/Sprites/Enemy1");

        }
    }


    update() {
        if (!isPaused) {
            let player = Sup.getActor("Player");
            if (Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, player.arcadeBody2D)) {
                if (Sup.getActor("Timer").arcadeBody2D.getEnabled) {
                    Sup.getActor("Timer").arcadeBody2D.warpPosition(Sup.getActor("Timer").getPosition().x - Timer.gameTime * levelInfo.damage, Sup.getActor("Timer").getPosition().y);
                }
            }
            Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Sup.ArcadePhysics2D.getAllBodies());
            let velocity = this.actor.arcadeBody2D.getVelocity();


            if (this.direction == "NONE") {
                this.actor.arcadeBody2D.setEnabled(false);
            }

            if (this.movingTime > this.maxMovingTime) {

                if (this.direction == "NONE") {
                    Enemy.enemies.splice(Enemy.enemies.indexOf(this.actor.arcadeBody2D), 1);
                    this.actor.destroy();
                }

                else if (Math.floor(Math.random() * 100) + 1 <= 50 || Math.abs(player.getPosition().y - this.actor.getPosition().y) == 0) {


                    if (player.getPosition().x <= this.actor.getPosition().x) {
                        this.direction = "LEFT";
                        velocity.x = 0;
                        velocity.y = 0;
                        velocity.x = -this.speed;
                        this.actor.spriteRenderer.setAnimation('Left');

                    }
                    else if (player.getPosition().x >= this.actor.getPosition().x) {
                        this.direction = "RIGHT";
                        velocity.x = 0;
                        velocity.y = 0;
                        velocity.x = this.speed;
                        this.actor.spriteRenderer.setAnimation('Right');

                    }
                }

                else {
                    if (player.getPosition().y <= this.actor.getPosition().y) {
                        this.direction = "DOWN";
                        velocity.x = 0;
                        velocity.y = 0;
                        velocity.y = -this.speed;
                        this.actor.spriteRenderer.setAnimation('Down');

                    }
                    else if (player.getPosition().y >= this.actor.getPosition().y) {
                        this.direction = "UP";
                        velocity.x = 0;
                        velocity.y = 0;
                        velocity.y = this.speed;
                        this.actor.spriteRenderer.setAnimation('Up');

                    }
                }
                this.movingTime = 0;
            }


            if (Bullet.bullets.length > 0) {
                if (Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Bullet.bullets)) {
                    this.lifes--;
                    if (this.lifes <= 0) {
                        this.actor.spriteRenderer.setAnimation('Dead');
                        this.direction = "NONE";
                        this.maxMovingTime = 60;
                        velocity = new Sup.Math.Vector2(0, 0);

                        Enemy.enemies.splice(Enemy.enemies.indexOf(this.actor.arcadeBody2D), 1);
                    }
                }
            }

            this.movingTime++;
            this.actor.arcadeBody2D.setVelocity(velocity);
        }
    }

    onDestroy() {

    }
}
Sup.registerBehavior(EnemyBehavior);
