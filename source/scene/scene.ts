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

/// <reference path="../core/api.ts"/>
/// <reference path="./sceneWorld.ts"/>
/// <reference path="./sceneSpatialDatabase.ts"/>

module pow2 {

   export class Scene extends Events implements IScene, IProcessObject, IWorldObject {
      id:string = _.uniqueId('scene');
      name:string;
      db:SceneSpatialDatabase = new SceneSpatialDatabase;
      options:any = {};
      private _objects:ISceneObject[] = [];
      private _views:ISceneView[] = [];
      world:SceneWorld = null;
      fps:number = 0;
      time:number = 0;
      paused:boolean = false;

      constructor(options:any={}){
         super();
         this.options = _.defaults(options || {},{
            debugRender:false
         });
      }

      destroy() {
         if(this.world){
            this.world.erase(this);
         }
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            this.removeObject(this._objects[i],true);
         }
         l = this._views.length;
         for(var i = 0; i < l; i++){
            this.removeView(this._views[i]);
         }
         this.paused = true;
      }

      // IWorldObject
      // -----------------------------------------------------------------------------
      onAddToWorld(world:IWorld){
         world.time.addObject(this);
      }
      onRemoveFromWorld(world:IWorld){
         world.time.removeObject(this);
      }

      // IProcessObject
      // -----------------------------------------------------------------------------
      tick(elapsed:number) {
         if(this.paused){
            return;
         }
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            this._objects[i] && this._objects[i].tick(elapsed);
         }
      }
      processFrame(elapsed:number) {
         if(this.paused){
            return;
         }
         this.time = this.world.time.time;
         // Interpolate objects.
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:any = this._objects[i];
            if(o.interpolateTick){
               o.interpolateTick(elapsed);
            }
         }
         // Render frame.
         l = this._views.length;
         for(var i = 0; i < l; i++){
            this._views[i].render(elapsed);
         }
         // Update FPS
         var currFPS:number = elapsed ? 1000 / elapsed : 0;
         this.fps += (currFPS - this.fps) / 10;
      }

      // Object add/remove helpers.
      // -----------------------------------------------------------------------------
      removeIt(property:string,object:any):boolean{
         var removed:boolean = false;
         this[property] = _.filter(this[property], (obj:any) => {
            if(object && obj && obj._uid === object._uid){
               this.db.removeSpatialObject(obj);
               if(obj.onRemoveFromScene){
                  obj.onRemoveFromScene(this);
               }
               if(this.world){
                  this.world.erase(obj);
               }
               delete obj.scene;
               removed = true;
               return false;
            }
            else if(!obj){
               return false;
            }
            return true;
         });
         return removed;
      }

      addIt(property:string,object:any):boolean{

         // Remove object from any scene it might already be in.
         if(object.scene){
            object.scene.removeIt(property,object);
         }

         // Check that we're not adding this twice (though, I suspect the above
         // should make that pretty unlikely)
         if(_.where(this[property],{ _uid: object._uid}).length > 0){
            throw new Error("Object added to scene twice");
         }
         this[property].push(object);
         // Mark it in the scene's world.
         if(this.world){
            this.world.mark(object);
         }
         // Add to the scene's spatial database
         this.db.addSpatialObject(object);

         // Mark it in this scene, and trigger the onAdd
         object.scene = this;
         if(object.onAddToScene){
            object.onAddToScene(this);
         }
         return true;
      }

      findIt(property:string,object:any):any{
         return _.where(this[property],{_uid:object._uid});
      }


      // View management
      // -----------------------------------------------------------------------------

      addView(view:ISceneView):boolean {
         return this.addIt('_views',view);
      }
      removeView(view:ISceneView):boolean {
         return this.removeIt('_views',view);
      }
      findView(view):boolean{
         return !!this.findIt('_views',view);
      }
      getViewOfType(type:any):any{
         return _.find(this._views,(v:ISceneView)=>{
            return v instanceof type;
         });
      }

      // SceneObject management
      // -----------------------------------------------------------------------------
      addObject(object:ISceneObject):boolean {
         return this.addIt('_objects',object);
      }
      removeObject(object:ISceneObject,destroy?:boolean):boolean{
         destroy = typeof destroy === 'undefined' ? true : !!destroy;
         var o:any = object;
         var removed:boolean = this.removeIt('_objects',object);
         if(o && destroy && o.destroy){
            o.destroy();
         }
         return removed;
      }
      findObject(object:ISceneObject):boolean{
         return !!this.findIt('_objects',object);
      }

      componentByType(type):ISceneComponent {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            var c:ISceneComponent = o.findComponent(type);
            if(c){
               return c;
            }
         }
         return null;
      }

      componentsByType(type):ISceneComponent[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:ISceneComponent[] = [];
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            var c:ISceneComponent[] = o.findComponents(type);
            if(c){
               results = results.concat(c);
            }
         }
         return results;
      }


      objectsByName(name:string):ISceneObject[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:ISceneObject[] = [];
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            if(o.name === name){
               results.push(o);
            }
         }
         return results;
      }
      objectByName(name:string):ISceneObject {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            if(o.name === name){
               return o;
            }
         }
         return null;
      }
      objectsByType(type):ISceneObject[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:ISceneObject[] = [];
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            if(o instanceof type){
               results.push(o);
            }
         }
         return results;
      }
      objectByType(type):ISceneObject {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            if(o instanceof type){
               return o;
            }
         }
         return null;
      }
      objectsByComponent(type):ISceneObject[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:ISceneObject[] = [];
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            if(o.findComponent(type)){
               results.push(o);
            }
         }
         return results;
      }
      objectByComponent(type):ISceneObject {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:ISceneObject = values[i];
            if(o.findComponent(type)){
               return o;
            }
         }
         return null;
      }
   }
}