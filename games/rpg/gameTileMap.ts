/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="./gameWorld.ts" />
/// <reference path="./index.ts"/>

module pow2 {

   /**
    * Describe a set of combat zones for a given point on a map.
    */
   export interface IZoneMatch {
      /**
       * The zone name for the current map
       */
      map:string;
      /**
       * The zone name for the target location on the map
       */
      target:string;
      /**
       * The point that target refers to.
       */
      targetPoint:pow2.Point;
   }

   /**
    * A tile map that supports game feature objects and components.
    */
   export class GameTileMap extends TileMap {
      world:GameWorld;
      loaded(){
         super.loaded();
         // If there are map properties, take them into account.
         if(this.map.properties && this.map.properties.music){
            this.addComponent(new SoundComponent({
               url:this.map.properties.music,
               volume:0.1,
               loop:true
            }));
         }
         this.buildFeatures();
      }

      destroy(){
         this.unloaded();
         return super.destroy();
      }

      unloaded(){
         this.removeComponentByType(SoundComponent);
         this.removeFeaturesFromScene();
         super.unloaded();
      }
      getFeature(name:string){
         return _.find(<any>this.features.objects,(feature:any) => {
            return feature.name === name;
         });
      }
      // Construct
      addFeaturesToScene() {
         _.each(this.features.objects,(obj:any) => {
            obj._object = this.createFeatureObject(obj);
            if(obj._object){
               this.scene.addObject(obj._object);
            }
         });
      }
      removeFeaturesFromScene() {
         _.each(this.features.objects,(obj:any) => {
            var featureObject:SceneObject = <SceneObject>obj._object;
            delete obj._object;
            if(featureObject){
               featureObject.destroy();
            }
         });
      }
      buildFeatures():boolean {
         this.removeFeaturesFromScene();
         if (this.scene) {
            this.addFeaturesToScene();
         }
         return true;
      }
      createFeatureObject(tiledObject:tiled.ITiledObject):TileObject {
         var options = _.extend({}, tiledObject.properties || {}, {
            tileMap: this,
            type:tiledObject.type,
            x: Math.round(tiledObject.x / this.map.tilewidth),
            y: Math.round(tiledObject.y / this.map.tileheight)
         });
         var object = new GameFeatureObject(options);
         this.world.mark(object);

         var componentType:any = EntityContainerResource.getClassType(tiledObject.type);
         if(tiledObject.type && componentType){
            var component = <ISceneComponent>(new componentType());
            if(!object.addComponent(component)){
               throw new Error("Component " + component.name + " failed to connect to host " + this.name);
            }
         }
         return object;
      }

      /**
       * Enumerate the map and target combat zones for a given position on this map.
       * @param at The position to check for a sub-zone in the map
       * @returns {IZoneMatch} The map and target zones that are null if they don't exist
       */
      getCombatZones(at:pow2.Point):IZoneMatch {
         var result:IZoneMatch = {
            map:null,
            target:null,
            targetPoint:at
         };
         if(this.map && this.map.properties && this.map.properties){
            if(typeof this.map.properties.combatZone !== 'undefined'){
               result.map = this.map.properties.combatZone
            }
         }
         // Determine which zone and combat type
         var invTileSize = 1 / this.map.tilewidth;
         var zones:any[] = _.map(this.zones.objects,(z:any)=>{
            var x =  z.x * invTileSize;
            var y =  z.y * invTileSize;
            var w =  z.width * invTileSize;
            var h =  z.height * invTileSize;
            return {
               bounds:new Rect(x,y,w,h),
               name:z.name
            }
         });
         // TODO: This will always get the first zone.  What about overlapping zones?
         var zone = _.find(zones,(z:any)=>{
            return z.bounds.pointInRect(at) && z.name;
         });
         if(zone){
            result.target = zone.name;
         }
         return result;
      }

   }
}