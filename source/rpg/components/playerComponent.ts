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

///<reference path="../index.ts"/>

module rpg.components {

   /**
    * Basic Dorkapon player that can navigate around the map
    * using the paths defined within.
    */
   export class PlayerComponent extends pow2.game.components.PlayerComponent {
      host:pow2.GameEntityObject;
      map:pow2.TileMap = null;

      /**
       * Collide with the rpg tile map features and obstacles.
       */
      collideMove(x:number,y:number,results:pow2.SceneObject[]=[]){
         if(this.host.scene && !this.map){
            this.map = <pow2.TileMap>this.host.scene.objectByType(pow2.TileMap);
         }

         var collision:boolean = this.collider && this.collider.collide(x, y, pow2.GameFeatureObject, results);
         if (collision) {
            for (var i = 0; i < results.length; i++) {
               var o = <pow2.GameFeatureObject>results[i];
               if (o.passable === true || !o.type) {
                  return false;
               }
               if (_.indexOf(PlayerComponent.COLLIDE_TYPES, o.type) !== -1) {
                  return true;
               }
            }
         }
         // Iterate over all layers of the map, check point(x,y) and see if the tile
         // has any unpassable attributes set on it.  If any unpassable attributes are
         // found, there is a collision.
         if (this.map) {
            var layers:pow2.tiled.ITiledLayer[] = this.map.getLayers();
            for (var i = 0; i < layers.length; i++) {
               var terrain = this.map.getTileData(layers[i], x, y);
               if (!terrain) {
                  continue;
               }
               for (var j = 0; j < this.passableKeys.length; j++) {
                  if (terrain[this.passableKeys[j]] === false) {
                     return true;
                  }
               }
            }
         }
         return false;
      }
   }
}