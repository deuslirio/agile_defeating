

class LevelBehavior extends Sup.Behavior {
    level = this.actor.tileMapRenderer;
    // levelOp:TileMapOptio;
  
    awake() {

        // set Level actor  to the current level map path
        this.level.setTileMap(levelInfo.source);

        let levelOp = { tileMapAsset: this.level.getTileMap(), layersIndex: "3,4" };
        // Atualizando os colidiveis da fase
        this.actor.arcadeBody2D.destroy();
        this.actor.arcadeBody2D = new Sup.ArcadePhysics2D.Body(this.actor, Sup.ArcadePhysics2D.BodyType.TileMap, levelOp);
        Tiles = levelInfo.Tiles;
        Game.getPosition(this.level.getTileMap());
    }

    update() {
        if (!isPaused) {
            if (Math.random() * 100 > 99.75) Sup.appendScene('Game/enemyScene', this.actor);
            //     }
            /*
            If the level is won we check
              - if it was the last level
                - if yes, we go to the victory screen
                - else we change the transition text visibility to true
              - if the key space is pressed
                - change the transition text visibility to false
                - change the new level tile map
                ll the setLevel function that will prepare the scene before to reload it
            */
            // WIN CONDITION
            if (isLevelWon) {
                Sup.log("Ganhou");
                Dialogs.state = "Sucess";

                Sup.log(completedLevels);
               Sup.log(completedLevels.length);
                Enemy.enemies.forEach(destroyAll);
                Enemy.enemies.length = 0;
                Bullet.bullets.forEach(destroyAll);
                Bullet.bullets.length=0;

                Sup.loadScene("City/cityScene");

            }
            // if R key is pressed and the level is NOT won, then reset the whole level
            if (Sup.Input.wasKeyJustPressed("R")||Sup.Input.wasGamepadButtonJustPressed(0,6) ) {
                Enemy.enemies.forEach(destroyAll);
                Enemy.enemies.length = 0;
                Bullet.bullets.forEach(destroyAll);
                Bullet.bullets.length=0;
                Game.resetLevel(this.level.getTileMap());
            }
        }

    }
}
Sup.registerBehavior(LevelBehavior);
