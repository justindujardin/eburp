/**
Copyright (C) 2013 by Justin DuJardin

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
/// <reference path="./playerComponent.ts" />
/// <reference path="../gameComponent.ts" />

module pow2 {

   /**
    * A Component that collides with features that are directly in front
    * of a player, that the player is 'touching' by facing them.
    */
   export class PlayerTouchComponent extends TickedComponent {
      host:TileObject;
      collider:CollisionComponent = null;
      player:PlayerComponent = null;
      touch:GameFeatureObject = null;
      touchedComponent:GameFeatureComponent = null;
      syncComponent():boolean{
         super.syncComponent();
         this.player = <PlayerComponent>this.host.findComponent(PlayerComponent);
         this.collider = <CollisionComponent>this.host.findComponent(CollisionComponent);
         return !!(this.player && this.collider);
      }

      tick(elapsed:number){
         super.tick(elapsed);
         if(!this.player || !this.collider){
            return;
         }
         var results = [];
         var newTouch:boolean = this.collider.collide(this.host.point.x + this.player.heading.x,this.host.point.y + this.player.heading.y,GameFeatureObject,results);
         var touched = <GameFeatureObject>_.find(results,(r:GameFeatureObject) => {
            return !!r.findComponent(GameFeatureComponent);
         });
         if(!newTouch || !touched){
            if(this.touchedComponent){
               this.touchedComponent.exit(this.host);
               this.touchedComponent = null;
            }
            this.touch = null;
         }
         else {
            var touchComponent = <GameFeatureComponent>touched.findComponent(GameFeatureComponent);
            var previousTouch = this.touchedComponent ? this.touchedComponent._uid : null;
            if(this.touchedComponent && this.touchedComponent._uid !== touchComponent._uid){
               this.touchedComponent.exit(this.host);
               this.touchedComponent = null;
            }

            this.touchedComponent = touchComponent;
            if(touchComponent._uid !== previousTouch){
               this.touchedComponent.enter(this.host);
            }
            this.touch = touched;

         }
      }
   }
}