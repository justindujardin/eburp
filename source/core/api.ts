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

///<reference path="../../web/bower/pow-core/lib/pow-core.d.ts"/>
///<reference path="../interfaces/IScene.ts"/>

module pow2 {

   /**
    * The Google Spreadsheet ID to load game data from.  This must be a published
    * google spreadsheet key.
    * @type {string} The google spreadsheet ID
    */
   export var SPREADSHEET_ID:string = "1IAQbt_-Zq1BUwRNiJorvt4iPEYb5HmZrpyMOkb-OuJo";


   export interface IGameItem {
      name:string; // The item name
      cost:number; // The cost of this item
      icon:string; // Sprite icon name, e.g. LongSword.png
      usedby?:any[]; // `HeroType`s that can use this item.
   }

   export interface IGameWeapon extends IGameItem {
      attack:number; // Damage value
      hit:number; // 0-100%
   }

   export interface IGameArmor extends IGameItem {
      defense:number; // Defensive value
      evade:number; // Value to add to evasion <= 0
   }

   export interface ISpriteMeta {
      width: number;// Pixel width
      height: number;// Pixel height
      cellWidth?:number; // Optional frame width (defaults to 16px)
      cellHeight?:number; // Optional frame height (defaults to 16px)
      frames: number;// The number of frames the sprite has.
      source: string; // The spritesheet source map
      x: number; // Pixel offset x in the sprite sheet.
      y: number; // Pixel offset y in the sprite sheet.
   }


   export var data = {
      maps: {},
      sprites: {},
      items:{},
      creatures:[],
      weapons:[],
      armor:[]
   };

   /**
    * Register data on the pow2 module.
    * @param {String} key The key to store the value under
    * @param {*} value The value
    */
   export function registerData(key:string,value:any){
      data[key] = value;
   }

   export function getData(key:string):any{
      return data[key];
   }

   export function registerMap(name:string,value:Object){
      data.maps[name] = value;
   }

   /**
    * Describe a dictionary of sprites.  This can be use to
    */
   export function describeSprites(value:Object){
      for(var prop in value){
         if(value.hasOwnProperty(prop)){
            data.sprites[prop] = _.extend(data.sprites[prop] || {},value[prop]);
         }
      }
   }

   /**
    * Resolve a map name to a valid url in the expected location.
    */
   export function getMapUrl(name:string):string {
      if(name.indexOf('.tmx') === -1){
         return '/maps/' + name + '.tmx';
      }
      return name;
   }

   /**
    * Register a dictionary of sprite meta data.  This is for automatically
    * generated sprite sheets, and only defaults to setting information if
    * it has not already been set by a call to describeSprites.
    */
   export function registerSprites(name:string,value:Object){
      for(var prop in value){
         if(value.hasOwnProperty(prop)){
            data.sprites[prop] = _.defaults(data.sprites[prop] || {},value[prop]);
         }
      }
   }

   export function getSpriteMeta(name:string):ISpriteMeta {
      return <ISpriteMeta>data.sprites[name];
   }

   export function registerCreatures(level,creatures){
      _.each(creatures,(c) => {
         data.creatures.push(_.extend(c,{level:level}));
      });
   }
   export function getMap(name:string){
      return data.maps[name];
   }
   export function getMaps(){
      return data.maps;
   }
}