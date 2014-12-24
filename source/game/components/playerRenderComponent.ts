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
/// <reference path="../../tile/tileObject.ts" />

module pow2 {

   export enum MoveFrames {
      LEFT = 10,
      RIGHT = 4,
      DOWN = 7,
      UP = 1,
      LEFTALT = 11,
      RIGHTALT = 5,
      DOWNALT = 8,
      UPALT = 2
   }

   // The order here maps to the first four frames in MoveFrames above.
   // It matters, don't change without care.
   export enum Headings {
      WEST = 0,
      EAST = 1,
      SOUTH = 2,
      NORTH = 3
   }
   export class PlayerRenderComponent extends TickedComponent {
      host:TileObject;
      private _animator:Animator = new Animator();
      heading:Headings = Headings.WEST;
      animating:boolean = false;
      setHeading(direction:Headings,animating:boolean){
         if(!this._animator.sourceAnims){
            this._animator.setAnimationSource(this.host.icon);
         }
         this.heading = direction;
         switch(this.heading){
            case Headings.SOUTH:
               this._animator.setAnimation('down');
               break;
            case Headings.NORTH:
               this._animator.setAnimation('up');
               break;
            case Headings.EAST:
               this._animator.setAnimation('right');
               break;
            case Headings.WEST:
               this._animator.setAnimation('left');
               break;
         }
         this.animating = animating;
      }

      setMoving(moving:boolean){
         this.animating = moving;
      }

      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);
         if(this.animating){
            this._animator.updateTime(elapsed);
         }
         this.host.frame = this._animator.getFrame();
      }
   }
}