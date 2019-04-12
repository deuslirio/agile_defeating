namespace Timer {
    export let gameTime
}
class TimerBehavior extends Sup.Behavior {


    awake() {
        Timer.gameTime = 16 / levelInfo.gameTime;
    }

    update() {
        this.actor.arcadeBody2D.setVelocity(0, 0);
        if (!isPaused) {
            this.actor.arcadeBody2D.setVelocity(-Timer.gameTime, 0);
        }

      
        //LOSE CONDITION
        if (this.actor.getPosition().x < 0) {
            Dialogs.state = "Fail";
            daysPlayed++;
            Game.clearLevel(Sup.getActor("Map").tileMapRenderer.getTileMap());
            Enemy.enemies.forEach(destroyAll);
            Enemy.enemies.length = 0;
            Bullet.bullets.forEach(destroyAll);
            Bullet.bullets.length=0;
            Sup.loadScene("City/cityScene");

        }
    }
}
Sup.registerBehavior(TimerBehavior);
