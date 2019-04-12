class BacklogBehavior extends Sup.Behavior {
    selectedOption = 1;
    awake() {
        isPaused = !isPaused;
        Sup.appendScene('Menu/pauseScene');
    }

    update() {

        if (Sup.Input.wasKeyJustPressed("P")||Sup.Input.wasGamepadButtonJustPressed(0,9) ) {

            for (var i = 0; i < Enemy.enemies.length; i++) {
                Enemy.enemies[i].setVelocity(0, 0);
            }
            for (var i = 0; i < Bullet.bullets.length; i++) {
                Bullet.bullets[i].setVelocity(0, 0);
            }
          
            Sup.getActor("Player").arcadeBody2D.setVelocity(0, 0);
            isPaused = !isPaused;

            if (isPaused) {
                Sup.appendScene('Menu/pauseScene');

            }
            else {
                Sup.getActor("PauseScreen").destroy();
            }
        }
        if (isPaused) {

            if (Sup.Input.wasKeyJustPressed("A") && this.selectedOption > 1) {
                Sup.getActor("Button" + this.selectedOption).spriteRenderer.setAnimation("Sprint" + this.selectedOption + "Disabled");
                this.selectedOption--;

            }
            else if (Sup.Input.wasKeyJustPressed("D") && this.selectedOption >= 1 && this.selectedOption < 10) {
                Sup.getActor("Button" + this.selectedOption).spriteRenderer.setAnimation("Sprint" + this.selectedOption + "Disabled");
                this.selectedOption++;

            }
            else if (Sup.Input.wasKeyJustPressed("W") && this.selectedOption > 5) {
                Sup.getActor("Button" + this.selectedOption).spriteRenderer.setAnimation("Sprint" + this.selectedOption + "Disabled");
                this.selectedOption = this.selectedOption - 5;

            }
            else if (Sup.Input.wasKeyJustPressed("S") && this.selectedOption <= 5) {
                Sup.getActor("Button" + this.selectedOption).spriteRenderer.setAnimation("Sprint" + this.selectedOption + "Disabled");
                this.selectedOption = this.selectedOption + 5;

            }

            Sup.getActor("Button" + this.selectedOption).spriteRenderer.setAnimation("Sprint" + this.selectedOption + "Enabled");
           var jobActors=[]
          jobActors.push(Sup.getActor("JobA"));
          jobActors.push(Sup.getActor("JobB"));
          jobActors.push(Sup.getActor("JobC"));
          // for(var i=0;i< jobActors.length;i++){
          //   // jobActors[i].setVisible(false);
          // }
           if(Board["board"+this.selectedOption][2].length+Board["board"+this.selectedOption][1].length+Board["board"+this.selectedOption][0].length<=3){
          for(var i=0;i<Board["board"+this.selectedOption][0].length;i++){
            if(Board["board"+this.selectedOption][0].length>0){
        //    Sup.log(jobActors);
            jobActors[0].spriteRenderer.setAnimation("Job"+Board["board"+this.selectedOption][0][i]);
            jobActors[0].setPosition(2.299,2+1.5*(2-i))
             jobActors[0].setVisible(true);

            jobActors.splice(0,1);}
          }
        for(var i=0;i<Board["board"+this.selectedOption][1].length;i++){
            if(Board["board"+this.selectedOption][1].length>0){
            jobActors[0].spriteRenderer.setAnimation("Job"+Board["board"+this.selectedOption][1][i]);
            jobActors[0].setPosition(6.457,2+1.5*(2-i))
             jobActors[0].setVisible(true);

            jobActors.splice(0,1);
          }
        }
         
         for(var i=0;i<Board["board"+this.selectedOption][2].length;i++){
            if(Board["board"+this.selectedOption][2].length>0){
            jobActors[0].spriteRenderer.setAnimation("Job"+Board["board"+this.selectedOption][2][i]);
            jobActors[0].setPosition(10.528,2+1.5*(2-i))
             jobActors[0].setVisible(true);

            jobActors.splice(0,1);
          }
         }
      }
           for(var i=0;i< jobActors.length;i++){
            jobActors[i].setVisible(false);
          }
        }
        
    }
}
Sup.registerBehavior(BacklogBehavior);
