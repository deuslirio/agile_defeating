class PlayerSceneBehavior extends Sup.Behavior {
  awake() {
    
  }

  update() {
    if(Sup.Input.wasKeyJustPressed("LEFT")||Sup.Input.wasGamepadButtonJustPressed(0,4) ){
      Player.isPlayer2=false;
      Sup.loadScene("City/cityScene");
    }
    if(Sup.Input.wasKeyJustPressed("RIGHT")||Sup.Input.wasGamepadButtonJustPressed(0,5) ){
      Player.isPlayer2=true;
      Sup.loadScene("City/cityScene");
    }
    
  }
}
Sup.registerBehavior(PlayerSceneBehavior);
