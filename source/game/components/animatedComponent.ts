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

   export interface IAnimationConfig {
      // It may seem weird to require name, but it's to enforce
      // a human-readable naming scheme for debugging win.
      name: string;
      // The entire duration of this animation
      duration : number;
      // Optional number of times to the repeat frames during the duration of the animation.
      repeats?: number;
      // Optional frames to interpolate between (will use all frames if none are specified)
      frames? : any[];
      // Move translation
      move?: Point;

      // callback
      callback?:(config:IAnimationConfig) => void;
   }

   export interface IAnimationTask extends IAnimationConfig {
      elapsed?: number;
      start?:any; // starting value
      target?:any; // target value
      value:any; // current value
      complete?:boolean;
      startFrame:number; // The starting frame to restore when the animation is complete.
      done?:(config:IAnimationConfig) => void;

   }

   // Implementation
   // -------------------------------------------------------------------------
   export class AnimatedComponent extends TickedComponent {
      host:TileObject;

      static EVENTS = {
         Started: "start",
         Stopped: "stop",
         Repeated: "repeat"
      };
      private _tasks:IAnimationTask[] = [];
      private _animationKeys:any[] = [];
      private _currentAnim:any = null;
      play(config:IAnimationConfig) {
         var task:IAnimationTask = <any>config;
         task.elapsed = 0;
         if(task.move){
            task.startFrame = this.host.frame;
            task.start = this.host.point.clone();
            task.target = this.host.point.clone().add(task.move);
            task.value = this.host.point.clone();
         }
         if(typeof task.duration === 'undefined'){
            task.duration = 0;
         }
         this._tasks.push(task);
      }

      stop(config:IAnimationConfig) {
         for(var i = 0; i < this._tasks.length; i++) {
            var task:IAnimationTask = this._tasks[i];
            if(task.name === config.name){
               task.complete = true;
            }
         }
      }

      removeCompleteTasks(){
         for(var i = 0; i < this._tasks.length; i++) {
            var task:IAnimationTask = this._tasks[i];
            if(task.complete === true){
               this._tasks.splice(i, 1);
               task.done && task.done(task);
               task.callback && task.callback(task);
               //this.host.frame = task.startFrame;
               this.trigger(AnimatedComponent.EVENTS.Stopped,{
                  task:task,
                  component:this
               });
               i--;
            }
         }
      }
      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);
         this.update(elapsed);
         this.removeCompleteTasks();
      }
      update(elapsed:number) {
         if(this._tasks.length === 0){
            return;
         }
         // Interp each task and fire events where necessary.
         _.each(this._tasks,(task:IAnimationTask) => {
            if(task.elapsed > task.duration){
               task.complete = true;
               task.elapsed = task.duration;
            }
            if(task.duration > 0){
               var factor:number = task.elapsed / task.duration;
               // Interp point
               //console.log("Interp from " + task.start + " to " + task.target );
               if(task.move && task.move instanceof Point){
                  this.host.point.set(task.value.interpolate(task.start,task.target,factor));
               }
               if(task.frames && task.frames.length) {
                  var index = Math.round(this.interpolate(0,task.frames.length-1,factor));
                  var frame = task.frames[index];
                  //console.log("Interp frame = " + frame);
                  this.host.frame = frame;
               }
            }
            if(!task.complete){
               task.elapsed += elapsed;
            }
         });
      }
      interpolate(from:number,to:number,factor:number):number {
         factor = Math.min(Math.max(factor,0),1);
         return (from * (1.0 - factor)) + (to * factor);
      }

      playChain(animations:IAnimationConfig[], cb:() => void) {
         // Inject a 0 duration animation on the end of the list
         // if a callback is desired.  This is a convenience for
         // certain coding styles, and you could easily add your
         // own animation as a callback before invoking this.
         if(typeof cb !== 'undefined'){
            animations.push({
               name:"Chain Callback",
               duration:0,
               callback: cb
            });
         }
         // TODO: Need a list of these for multiple animations on
         // the same component. !!!!!!!!!!!!!!!!!!!!
         this._animationKeys = animations;
         this._animateNext();
      }
      private _animateNext() {
         if(this._animationKeys.length === 0){
            return;
         }
         this._currentAnim = this._animationKeys.shift();
         this._currentAnim.done = () => {
            _.defer(() => {
               this._animateNext();
            });
         };
         this.play(this._currentAnim);
      }

   }
}