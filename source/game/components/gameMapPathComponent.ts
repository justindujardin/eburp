/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/components/pathComponent.ts" />

module pow2.components {
   declare var Graph:any;
   /**
    * Build Astar paths with GameFeatureObject tilemaps.
    */
   export class GameMapPathComponent extends pow2.tile.components.PathComponent {
      generateAStarGraph() {
         var layers:tiled.ITiledLayer[] = this.tileMap.getLayers();
         var l:number = layers.length;

         var grid = new Array(this.tileMap.bounds.extent.x);
         for(var x:number = 0; x < this.tileMap.bounds.extent.x; x++){
            grid[x] = new Array(this.tileMap.bounds.extent.y);
         }

         for(var x:number = 0; x < this.tileMap.bounds.extent.x; x++){
            for(var y:number = 0; y < this.tileMap.bounds.extent.y; y++){

               // Tile Weights, the higher the value the more avoided the
               // tile will be in output paths.

               // 10   - neutral path, can walk, don't particularly care for it.
               // 1    - desired path, can walk and tend toward it over netural.
               // 1000 - blocked path, can't walk, avoid at all costs.
               var weight:number = 10;
               var blocked:boolean = false;
               for(var i = 0; i < l; i++){
                  // If there is no metadata continue
                  var terrain = this.tileMap.getTileData(layers[i],x,y);
                  if (!terrain) {
                     continue;
                  }

                  // Check to see if any layer has a passable attribute set to false,
                  // if so block the path.
                  if(terrain.passable === false){
                     weight = 1000;
                     blocked = true;
                  }
                  else if(terrain.isPath === true){
                     weight = 1;
                  }
               }
               grid[x][y] = weight;
            }
         }

         // TOOD: Tiled Editor format is KILLIN' me.
         _.each(this.tileMap.features.objects,(o:any) => {
            var obj:any = o.properties;
            if(!obj){
               return;
            }
            var collideTypes:string[] = pow2.game.components.PlayerComponent.COLLIDE_TYPES;
            if(obj.passable === true || !obj.type){
               return;
            }
            if(_.indexOf(collideTypes, obj.type) !== -1){
               var x:number = o.x / o.width | 0;
               var y:number = o.y / o.height | 0;
               if(!obj.passable && this.tileMap.bounds.pointInRect(x,y)){
                  grid[x][y] = 100;
               }
            }
         });
         this._graph = new Graph(grid);
      }
   }
}