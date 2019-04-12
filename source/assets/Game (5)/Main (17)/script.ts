//Define if the game is paused
let isPaused=false;

let daysPlayed=0;

// List the game levels
const LEVELS = {
  0:'Level1_1',
  1:'Level1_1',
  2:'Level1_2',
  3:'Level1_3',
  4:'Level2_1',
  5:'Level2_2',
  6:'Level2_3',
  7:'Level3_1',
  8:'Level3_2',
  9:'Level3_3',
  10:'Level4_1',
  11:'Level4_2',
  12:'Level4_3',
};


var Sprints=[
  [1,4,7],
  [10,2,5],
  [8,11,3],
  [6,9,12],
  [],
  [],
  [],
  [],
  [],
  []
];

var completedLevels=[];
var listLevels=[];

// List the map layers
enum Layers{
      background=0,
      Scene = 1,
      PlayerLayer=2,
      Wall = 3,
      Actors = 4
     };

// List the map tiles
var Tiles={
      Empty : -1,
      Wall : [0],
      Floor : [0],
      Target : 0,
      Crate : 0,
      Start : 0,
      Packet : 0};

// Game level won flag
var isLevelWon : boolean = false;


var levelCount : number = 0;

// Number of level, checked when game awake
var levelMax : number;


// Original map pattern saved
var mapSaved : number[][];

// Set new player position to map origin
var playerPosition = new Sup.Math.Vector2(3, 4);

var levelInfo=Level[LEVELS[listLevels[levelCount]]];   

namespace Game{
  
  
  export let map: Sup.TileMap;
  
  // export function instantEnemy(){
  //   enemies.push()
  // }
  export function getMaxLevel(){
    levelMax = 0;
    // Add one for each level in LEVELS
    for(let level in LEVELS){
      levelMax++;
    }
  }

  export function getPosition(level){
    /*
      Scan the 16x12 level in order to :
      - Save the tile pattern for each layer in the mapSaved array
      - Set the playerPosition vector from the Start tile position on Actor layer

    */

    // Set the variables to default, erase previous level
     mapSaved=[];
    playerPosition.x = 0, playerPosition.y = 0;

    for(let column = 0; column < 12; column++){
      for(let row = 0; row < 16; row++){

        // get the tile for x = row and y = column positions
        let actorTile = level.getTileAt(Layers.Actors, row, column);

        // Add the tile to the array
        
        mapSaved.push(actorTile);

        if(actorTile === Tiles.Start){
          // remove the Start tile and replace with empty tile
          level.setTileAt(Layers.Actors, row, column, Tiles.Empty);

          // set position to x, y on level map
          playerPosition.add(row, column);
        }
      }
    }
  }

  export function checkLevel(level){

    /*
    We check all the level for the crates and targets positions.
    We then compare if the position of crates and targets match,
    if all crate are on target, the level is won.
    */

    let boxesNumber : number = 0;
    let boxesPositions = [];
    let targetsPositions = [];

    for(let column = 0; column < 12; column++){
      for(let row = 0; row < 16; row++){

        // Take the tiles from two layers to coordinates row and column
        let actorTile = level.getTileAt(Layers.Actors, row, column);
        let worldTile = level.getTileAt(Layers.Scene, row, column);

        // If the actor tile is a box, keep the position
        if(actorTile == Tiles.Crate || actorTile == Tiles.Packet){
          let position = new Sup.Math.Vector2(row, column);
          boxesPositions.push(position);

          // we count the total number of crate
          boxesNumber++;
        }

        // If the world tile is a target, keep the position
        if(worldTile == Tiles.Target){
          let position = new Sup.Math.Vector2(row, column);
          targetsPositions.push(position);
        }
      }
    }

    // Check if all boxes
    if(checkVictory(level, boxesNumber, boxesPositions, targetsPositions)){
      
      isLevelWon = true;
      
    
        completedLevels.push(listLevels[0]);
      
 
      levelInfo=Level[LEVELS[listLevels[0]]]; 
        for(var i=1;i<=10;i++){
             if(Board['board'+i][1][0]== listLevels[0]){
               Board['board'+i][2].push(Board['board'+i][1].splice(0,1)[0]);
               break;
             }
         }
        reordLevels2();
    }; 
  }

  function checkVictory(level, boxesNumber, boxesPositions, targetsPositions){

    /*
    Check all the positions and find if the coordinate match together.
    If there is as much match than there is boxes, the game is finished.
    */

    let count : number = 0;

    for(let posBox of boxesPositions){
      for(let posTarget of targetsPositions){
        if(posBox.x === posTarget.x && posBox.y === posTarget.y){
          count++;
        }
      }
    }
    if(count === boxesNumber){
      return true;
    }
  }

  export function setLevel(){
        //reset values to default
    if(levelInfo.source=="Game/Maps/Level4_1"){
       isLevelWon = true;
            completedLevels.push(listLevels[0]);
      
 
      levelInfo=Level[LEVELS[listLevels[0]]]; 
        for(var i=1;i<=10;i++){
            Sup.log(Board['board1'],Board['board2'])
             if(Board['board'+i][1][0]== listLevels[0]){
             
               Board['board'+i][2].push(Board['board'+i][1].splice(0,1)[0]);
               break;
             }
         }
        reordLevels2();

      Sup.loadScene("City/cityScene");
    }
    else{
        isLevelWon = false;
        //reload the scene
        Sup.loadScene("Game/gameScene");
    }
  }

  export function resetLevel(level){
    
    clearLevel(level);
    // call the setLevel function to prepare a new level
    setLevel();
  }
  
   export function clearLevel(level){
    let index : number = 0;
        // set all the actor tiles of the current level to the savedMap tile
        for(let column = 0; column < 12; column++){
          for(let row = 0; row < 16; row++){
            level.setTileAt(Layers.Actors, row, column, mapSaved[index]);
            index++
          }
        }
   }
   
   export function reordLevels(){
     listLevels.length=0;
     for(var i=0;i<Sprints.length;i++){
       for(var j=0;j<Sprints[i].length;j++){
         listLevels.push(Sprints[i][j]);
       }
     }
     levelInfo=Level[LEVELS[listLevels[levelCount]]];
   }
      export function reordLevels2(){
        
         listLevels.length=0;
         for(var i=1;i<=10;i++){
           for(var j=0;j<Board['board'+i][0].length;j++){
             listLevels.push(Board['board'+i][0][j]);
           }
         }
            for(var i=1;i<=10;i++){
             if(Board['board'+i][0][0] == listLevels[0]){
               Board['board'+i][1].push(Board['board'+i][0].splice(0,1)[0]);
             }
         }

         levelInfo=Level[LEVELS[listLevels[levelCount]]];
     }
      
      export function pushLevel(item,boardID){
        Sup.log(boardID)
            if(Board['board'+ boardID][0].length < 3){
              Board['board'+ boardID][0].push(item);
            }
            else if( boardID<=10 && Board['board'+ (boardID)][0].length >= 3){
              let extra = Board['board'+boardID][0].splice(2,1)[0];
              Board['board'+ boardID][0].unshift(item);
         
              Game.pushLevel(extra,boardID+1);
            }
            else  if(boardID>10){
              Sup.log("Limite de Sprints atingido");
              Sup.loadScene("Menu/playerScene3");
            }
          Board['board'+boardID][0].sort(function (a,b) {
              return a - b;
          })
      }
}

function destroyAll(item,index){
    item.destroy();  
}

// Call the getMaxLevel function when game is launched
Game.reordLevels2();
Sup.log(listLevels);
// Sup.log(listLevels[levelCount]);
Sup.log(completedLevels);
Game.getMaxLevel();
