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

/// <reference path="../sceneObject.ts" />
/// <reference path="../../scene/sceneComponent.ts" />

module pow2 {
   export class CollisionComponent extends SceneComponent {
      collideBox: pow2.Rect = new pow2.Rect(0, 0, 1, 1);
      resultsArray: any[] = [];
      collide(x:number, y:number,type:Function=SceneObject,results=[]):boolean {
         if(!this.host || !this.host.scene){
            return false;
         }
         this.collideBox.point.x = x;
         this.collideBox.point.y = y;
         return this.host.scene.db.queryRect(this.collideBox, type, results);
      }
      collideFirst(x:number, y:number,type:Function=SceneObject):SceneObject {
         if(!this.host || !this.host.scene){
            return null;
         }
         this.collideBox.point.x = x;
         this.collideBox.point.y = y;
         this.resultsArray.length = 0;
         var hit:boolean = this.host.scene.db.queryRect(this.collideBox, type, this.resultsArray);
         return hit ? this.resultsArray[0] : null;
      }
  }
}