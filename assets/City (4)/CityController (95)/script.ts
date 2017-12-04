class CityBehavior extends Sup.Behavior {
  faces=["0"];
  indexText=1;

  awake() {
    if(Player.isPlayer2){
      this.faces.push("Alice");
      this.faces.push("Bob");

    }
    else{
       this.faces.push("Bob");
       this.faces.push("Alice");
    }
    this.faces.push("Mayor");
    this.faces.push("Pop1");
    this.faces.push("Pop2");

     var       farmLevel=0,
           structureLevel=0,
           environmentLevel=0,
           ocupationLevel=0;
    for(var i=0;i<completedLevels.length;i++){

      if(completedLevels[i]==1|| completedLevels[i]==2 ||completedLevels[i]==3){
        farmLevel++;
         
      }
      if(completedLevels[i]==4||completedLevels[i]==5||completedLevels[i]==6){
        structureLevel++;
      }
      if(completedLevels[i]==7||completedLevels[i]==8||completedLevels[i]==9){
        environmentLevel++;
     
      }
      if(completedLevels[i]==10||completedLevels[i]==11||completedLevels[i]==12){
        ocupationLevel++;
      }
       
    }
     Sup.getActor("Farm").tileMapRenderer.setTileMap("City/Farm/Farm"+farmLevel);
        Sup.getActor("Structure").tileMapRenderer.setTileMap("City/Structure/Structure"+structureLevel);
        Sup.getActor("Environment").tileMapRenderer.setTileMap("City/Environment/Environment"+environmentLevel);
        Sup.getActor("Ocupation").tileMapRenderer.setTileMap("City/Ocupation/Ocupation"+ocupationLevel); 
    if(environmentLevel>=3){
      Sup.getActor("Waterfall").setVisible(true);
    }
    
  }

  update() { 
    Sup.getActor("Dialog").setVisible(true);
   
    if(completedLevels.length>=11){
      if(this.indexText>3){Sup.loadScene("Menu/playerScene2");}
      else if(Dialogs["dialogGameOverGood"][this.indexText]){
        Sup.getActor("Face").spriteRenderer.setAnimation(this.faces[Dialogs["dialogGameOverGood"][this.indexText].face]);
        Sup.getActor("Text").textRenderer.setText(Dialogs["dialogGameOverGood"][this.indexText].text);
      }
      
    }
    else if(Dialogs["dialog"+Dialogs.state+listLevels[levelCount]][this.indexText]){
        Sup.getActor("Face").spriteRenderer.setAnimation(this.faces[Dialogs["dialog"+Dialogs.state+listLevels[levelCount]][this.indexText].face]);
        Sup.getActor("Text").textRenderer.setText(Dialogs["dialog"+Dialogs.state+listLevels[levelCount]][this.indexText].text);
        
      if(Dialogs["dialog"+Dialogs.state+listLevels[levelCount]][this.indexText].option){
         Sup.getActor("Options").setVisible(true);
        }
        
    }else{
      Game.setLevel();
      this.indexText=0;
    }
  
     if(Dialogs["dialog"+Dialogs.state+listLevels[levelCount]][this.indexText].option){
        if(Sup.Input.wasKeyJustPressed("LEFT")||Sup.Input.wasGamepadButtonJustPressed(0,4) ){
          
           for(var i=1;i<=10;i++){
             if(Board['board'+i][1].length >0){
                let current = Board['board'+i][1].splice(0, 1)[0];
                Game.pushLevel(current,i+1);  
               Sup.log(current,'current');
               break;
             }
          }
                Game.reordLevels2();
            
              
          
          Sup.log(listLevels);
           this.indexText++;

        }
        if(Sup.Input.wasKeyJustPressed("RIGHT")||Sup.Input.wasGamepadButtonJustPressed(0,5) ){
          Sup.log("Direita");
          this.indexText++;
        }
     }
    else
    if(Sup.Input.wasKeyJustPressed("RETURN")||Sup.Input.wasGamepadButtonJustPressed(0,0) ){
      this.indexText++;
    }
  }
}
Sup.registerBehavior(CityBehavior);
