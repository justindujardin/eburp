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
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../lib/pow2.game.d.ts"/>
/// <reference path="./gameService.ts"/>

module pow2.ui {

   export interface IPowAlertObject {
      message:string; // The message to display.
      duration?:number; // The duration the message should be displayed after shown.
      elapsed?:number; // Elapsed time since the alert has been full shown (after any enter animations)
      dismissed?:boolean; // Set to dismiss.
      busy?:boolean; // Set to ignore all processing for this alert.
      done?(message:IPowAlertObject); // A callback for after this alert has been issued and dismissed.
   }

   export interface IAlertScopeService extends ng.IRootScopeService {
      powAlert:IPowAlertObject;
   }

   export interface IPowAlertService {
      show(message:string):IPowAlertObject;
      queue(config:IPowAlertObject);
   }

   /**
    * Provide a basic service for queuing and showing messages to the user.
    */
   export class PowAlertService extends pow2.Events implements pow2.IWorldObject, pow2.IProcessObject, IPowAlertService {
      scope:IAlertScopeService;
      timeout:ng.ITimeoutService;
      game:PowGameService;
      world:pow2.GameWorld;
      element:ng.IAugmentedJQuery;
      container:ng.IAugmentedJQuery;
      animate:any;
      id:number = _.uniqueId();
      paused:boolean = false;

      private _current:IPowAlertObject = null;
      private _queue:IPowAlertObject[] = [];
      constructor(element,container,scope:IAlertScopeService,timeout:ng.ITimeoutService,game:PowGameService,animate:any){
         super();
         this.scope = scope;
         this.timeout = timeout;
         this.game = game;
         this.element = element;
         this.container = container;
         this.animate = animate;

         this.container.on('click',(e) => {
            this.dismiss();
         });

         game.world.mark(this);
         game.world.time.addObject(this);
      }

      destroy() {
         this.game.world.time.removeObject(this);
         this.game.world.erase(this);
      }

      dismiss() {
         if(this._current){
            this._current.dismissed = true;
         }
      }
      show(message:string,done?:() => void,duration?:number):IPowAlertObject{
         var obj:IPowAlertObject = {
            message:message,
            duration: typeof duration === 'undefined' ? 1000 : duration,
            done:done
         };
         return this.queue(obj);
      }

      queue(config:IPowAlertObject){
         config.elapsed = 0;
         this._queue.push(config);
         return config;
      }

      /*
       * Update current message, and manage event generation for transitions
       * between messages.
       * @param elapsed number The elapsed time since the last invocation, in milliseconds.
       */
      processFrame(elapsed:number) {
         if(this._current && this.paused !== true){
            var c = this._current;
            var timeout:boolean = c.duration && c.elapsed > c.duration;
            var dismissed:boolean = c.dismissed === true;
            if(!timeout && !dismissed){
               c.elapsed += elapsed;
               return;
            }
            this.paused = true;
            this.scope.$apply(() => {
               this.animate.leave(this.element, () => {
                  this._current.done && this._current.done(this._current);
                  this.scope.powAlert = this._current = null;
                  this.paused = false;
               });
            });
         }
         if(this.paused || this._queue.length === 0){
            return;
         }
         this._current = this._queue.shift();
         this.scope.$apply(() => {
            this.scope.powAlert = this._current;
            this.animate.enter(this.element, this.container, null,() => {
               this.paused = false;
            });
         });
      }
   }
   app.factory('powAlert', [
      '$rootScope',
      '$timeout',
      'game',
      '$compile',
      '$document',
      '$animate',
      ($rootScope,$timeout,game,$compile,$document,$animate) => {
         var alertElement = $compile('<div class="drop-overlay fade"><div class="ebp">{{powAlert.message}}</div></div>')($rootScope);
         return new PowAlertService(alertElement,$document.find('body'),$rootScope,$timeout,game,$animate);
      }
   ]);
}