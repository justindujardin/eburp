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
/// <reference path="./point.ts"/>
/// <reference path="../../types/jquery/jquery.d.ts"/>
/// <reference path="./scene/sceneView.ts"/>
module pow2 {
   export enum KeyCode {
      UP = 38,
      DOWN = 40,
      LEFT = 37,
      RIGHT = 39,
      BACKSPACE = 8,
      COMMA = 188,
      DELETE = 46,
      END = 35,
      ENTER = 13,
      ESCAPE = 27,
      HOME = 36,
      SPACE = 32,
      TAB = 9
   }

   export interface CanvasMouseCoords {
      point:Point; // Point on the canvas in pixels.
      world:Point; // Point in the world, accounting for camera scale and offset.
   }

   export interface NamedMouseElement extends CanvasMouseCoords {
      name:string;
      view:SceneView;
   }

   export class Input {
      _keysDown:Object = {};
      _mouseElements:NamedMouseElement[] = [];

      static mouseOnView(ev:MouseEvent,view:pow2.SceneView,coords?:CanvasMouseCoords) {
         var result:CanvasMouseCoords = coords || {
            point: new pow2.Point(),
            world: new pow2.Point()
         };
         var canoffset = $(ev.srcElement).offset();
         var x = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
         var y = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top);
         result.point.set(x,y);
         // Generate world mouse position
         var worldMouse = view.screenToWorld(result.point,view.cameraScale).add(view.camera.point).round();
         result.world.set(worldMouse.x,worldMouse.y);
         return result;
      }


      constructor() {
         window.addEventListener(<string>"keydown", (ev:KeyboardEvent) => {
            this._keysDown[ev.which] = true;
         });
         window.addEventListener(<string>'keyup', (ev:KeyboardEvent) => {
            this._keysDown[ev.which] = false;
         });
         var hooks = this._mouseElements;
         window.addEventListener(<string>'mousemove', (ev:MouseEvent) => {
            _.each(hooks,(hook:NamedMouseElement) => {
               if(ev.srcElement === hook.view.canvas){
                  Input.mouseOnView(ev,hook.view,hook);
               }
               else {
                  hook.point.set(-1,-1);
                  hook.world.set(-1,-1);
               }
               return false;
            });
         });
      }

      mouseHook(view:SceneView,name:string):NamedMouseElement{
         var hooks = <NamedMouseElement[]>_.where(this._mouseElements,{name:name});
         if(hooks.length > 0){
            return hooks[0];
         }
         var result:NamedMouseElement = {
            name:name,
            view:view,
            point: new Point(-1,-1),
            world: new Point(-1,-1)
         };
         this._mouseElements.push(result);
         return result;
      }

      mouseUnhook(name:string);
      mouseUnhook(view:SceneView);
      mouseUnhook(nameOrView:any){
         this._mouseElements = _.filter(this._mouseElements,(hook:NamedMouseElement) => {
            return hook.name === nameOrView || hook.view.id === nameOrView.id;
         });
      }

      getMouseHook(name:string):NamedMouseElement;
      getMouseHook(view:SceneView):NamedMouseElement;
      getMouseHook(nameOrView:any):NamedMouseElement{
         return <NamedMouseElement>_.find(this._mouseElements,(hook:NamedMouseElement) => {
            return hook.name === nameOrView || hook.view.id === nameOrView.id;
         });
      }

      keyDown(key:number):boolean {
         return !!this._keysDown[key];
      }

   }
}