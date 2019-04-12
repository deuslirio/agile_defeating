namespace Player {
    export let isPlayer2: boolean = false;
}



class PlayerBehavior extends Sup.Behavior {
    speed: number = 0.08;
    lastVelocity = new Sup.Math.Vector2();
    movement: number = 0;
    perfectPosition = this.actor.getLocalPosition();
    movingTime = 0;
    timeReloading = 0;
    maxTimeReloading = 15;




    awake() { // set position of Player actor to the playerPosition 2D vector
        if (Player.isPlayer2) {
            this.actor.spriteRenderer.setSprite("Game/Sprites/Char2");
        }
        this.actor.arcadeBody2D.warpPosition(levelInfo.playerPosition)
        this.speed = levelInfo.playerSpeed;
    }


    update() {
        if (!isPaused) {

            var position = this.actor.getLocalPosition();
            let velocity = this.actor.arcadeBody2D.getVelocity();
            let level = Sup.getActor("Map").tileMapRenderer.getTileMap();

            // let nextSceneTile
            // let nextActorsTile

            if (Sup.Input.isKeyDown("A")||Sup.Input.isGamepadButtonDown(0,14) ){
                this.perfectPosition.x = Math.round(position.x) - 1;
                this.perfectPosition.y = Math.round(position.y);
                this.perfectPosition.z = Math.round(position.z);
                velocity.x = 0;
                velocity.y = 0;
                velocity.x = -this.speed;

                //
                if (this.movingTime == 0) {
                    this.actor.spriteRenderer.setAnimation("Left");
                }
            }
            else if (Sup.Input.isKeyDown("D")||Sup.Input.isGamepadButtonDown(0,15)) {
                this.perfectPosition.x = Math.round(position.x) + 1;
                this.perfectPosition.y = Math.round(position.y);
                this.perfectPosition.z = Math.round(position.z);
                velocity.x = 0;
                velocity.y = 0;
                velocity.x = this.speed;
                //
                if (this.movingTime == 0) {
                    this.actor.spriteRenderer.setAnimation('Right');
                }
            }
            else if (Sup.Input.isKeyDown("W")||Sup.Input.isGamepadButtonDown(0,12)) {
                this.perfectPosition.x = Math.round(position.x);
                this.perfectPosition.y = Math.round(position.y) + 1;
                this.perfectPosition.z = Math.round(position.z);
                velocity.x = 0;
                velocity.y = 0;
                velocity.y = this.speed;

                //
                if (this.movingTime == 0) {
                    this.actor.spriteRenderer.setAnimation('Up');
                }
            }
            else if (Sup.Input.isKeyDown("S")||Sup.Input.isGamepadButtonDown(0,13)) {
                this.perfectPosition.x = Math.round(position.x);
                this.perfectPosition.y = Math.round(position.y) - 1;
                this.perfectPosition.z = Math.round(position.z);
                velocity.x = 0;
                velocity.y = 0;
                velocity.y = -this.speed;

                if (this.movingTime == 0) {
                    this.actor.spriteRenderer.setAnimation('Down');
                }
            }
            else {
                this.perfectPosition.x = Math.round(position.x);
                this.perfectPosition.y = Math.round(position.y);
                this.perfectPosition.z = Math.round(position.z);
                velocity.x = 0;
                velocity.y = 0;
                if (this.movingTime == 0) {
                    this.actor.spriteRenderer.setAnimation('Default');
                }

                this.actor.arcadeBody2D.setVelocity(velocity);
            }


            if ((Sup.Input.wasKeyJustPressed("LEFT")||Sup.Input.wasGamepadButtonJustPressed(0,2)) && this.timeReloading == 0) {
                Bullet.bulletDirection = "LEFT";
                Sup.appendScene('Game/bulletScene');
                this.actor.spriteRenderer.setAnimation('Left');
                this.movingTime = 1;
                this.timeReloading = this.maxTimeReloading;
            }
            else if ((Sup.Input.wasKeyJustPressed("RIGHT")||Sup.Input.wasGamepadButtonJustPressed(0,1))  && this.timeReloading == 0) {
                Bullet.bulletDirection = "RIGHT";
                Sup.appendScene('Game/bulletScene');
                this.actor.spriteRenderer.setAnimation('Right');
                this.movingTime = 1;
                this.timeReloading = this.maxTimeReloading;
            }
            else if ((Sup.Input.wasKeyJustPressed("UP")||Sup.Input.wasGamepadButtonJustPressed(0,3))  && this.timeReloading == 0) {
                Bullet.bulletDirection = "UP";
                Sup.appendScene('Game/bulletScene');
                this.actor.spriteRenderer.setAnimation('Up');
                this.movingTime = 1;
                this.timeReloading = this.maxTimeReloading;
            }
            else if ((Sup.Input.wasKeyJustPressed("DOWN")||Sup.Input.wasGamepadButtonJustPressed(0,0))  && this.timeReloading == 0) {
                Bullet.bulletDirection = "DOWN";
                Sup.appendScene('Game/bulletScene');
                this.actor.spriteRenderer.setAnimation('Down');
                this.movingTime = 1;
                this.timeReloading = this.maxTimeReloading;
            }

            if (this.movingTime > 0) {
                this.movingTime++;
            }
            if (this.movingTime > 30) {
                this.movingTime = 0;
            }

            if (this.timeReloading > 0) this.timeReloading--;
            this.lastVelocity = velocity;





            this.actor.arcadeBody2D.setVelocity(velocity);

            if (Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Sup.getActor("Map").arcadeBody2D) && (Sup.Input.isKeyDown("SPACE"))||Sup.Input.wasGamepadButtonJustPressed(0,7))  {

                // We get the tiles index for each layer of the map from the coordinates after the new ones

                let nextSceneTile = level.getTileAt(Layers.Scene, Math.round(position.x + velocity.x / this.speed), Math.round(position.y + velocity.y / this.speed));
                let nextActorsTile = level.getTileAt(Layers.Actors, Math.round(position.x + velocity.x / this.speed), Math.round(position.y + velocity.y / this.speed));
                // Sup.log(nextActorsTile+" "+nextSceneTile);

                if (nextActorsTile == Tiles.Crate || nextActorsTile == Tiles.Packet) {
                    let twoNextSceneTile = level.getTileAt(Layers.Scene, Math.round((position.x + 2 * velocity.x / this.speed)), Math.round((position.y + 2 * velocity.y / this.speed)));
                    let twoNextActorsTile = level.getTileAt(Layers.Actors, Math.round((position.x + 2 * velocity.x / this.speed)), Math.round((position.y + 2 * velocity.y / this.speed)));
                    let twoNextWallTile = level.getTileAt(Layers.Wall, Math.round((position.x + 2 * velocity.x / this.speed)), Math.round((position.y + 2 * velocity.y / this.speed)));

                    //Sup.log(twoNextActorsTile+" "+twoNextSceneTile);
                    if (twoNextActorsTile != Tiles.Empty || twoNextWallTile != Tiles.Empty) { }

                    else if (twoNextSceneTile == Tiles.Target && twoNextActorsTile == Tiles.Empty) {
                        level.setTileAt(Layers.Actors, Math.round(position.x + velocity.x / this.speed), Math.round(position.y + velocity.y / this.speed), Tiles.Empty);
                        // If the next world tile is a target tile, the box is a packet.
                        level.setTileAt(Layers.Actors, Math.round((position.x + 2 * velocity.x / this.speed)), Math.round((position.y + 2 * velocity.y / this.speed)), Tiles.Packet);
                    }
                    else if (twoNextActorsTile == Tiles.Empty) {
                        level.setTileAt(Layers.Actors, Math.round(position.x + velocity.x / this.speed), Math.round(position.y + velocity.y / this.speed), Tiles.Empty);
                        // If the next world tile is floor, the box is a crate.
                        level.setTileAt(Layers.Actors, Math.round((position.x + 2 * velocity.x / this.speed)), Math.round((position.y + 2 * velocity.y / this.speed)), Tiles.Crate);
                    }
                }
            }
            Sup.ArcadePhysics2D.collides(this.actor.arcadeBody2D, Sup.ArcadePhysics2D.getAllBodies());
            // Sup.loadScene("Game/gameScene");
            // Sup.log("Perdeu");
            // if(Sup.getActor("Timer").arcadeBody2D.getEnabled){
            //   Sup.getActor("Timer").arcadeBody2D.warpPosition(Sup.getActor("Timer").getPosition().x-Timer.gameTime*levelInfo.damage,Sup.getActor("Timer").geti;         // }



            Game.checkLevel(level);
            // Sup.log(isLevelWn);

        }
    }

}
Sup.registerBehavior(PlayerBehavior);
