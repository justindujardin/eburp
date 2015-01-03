/**
 Copyright (C) 2014 by Justin DuJardin

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

module pow2 {
   declare var Tabletop:any;
   /**
    * Use TableTop to load a published google spreadsheet.
    */
   export class GameDataResource extends Resource {

      static DATA_KEY:string = '__db';
      load() {
         // Attempt to load db from save game cache to avoid hitting
         // google spreadsheets API on ever page load.
         try{
            this.data = JSON.parse(this.getCache());
            if(this.data){
               _.defer(()=>{ this.ready(); });
            }
         }
         catch(e){
         }
         // TODO: ERROR Condition
         Tabletop.init( {
            key: this.url,
            callback: (data, tabletop) => {
               data = this.data = this.transformTypes(data);
               this.setCache(JSON.stringify(data));
               this.ready();
            }
         });
      }

      getCache():any {
         return localStorage.getItem(GameDataResource.DATA_KEY);
      }
      static clearCache(){
         localStorage.removeItem(GameDataResource.DATA_KEY);
      }
      setCache(data:any){
         localStorage.setItem(GameDataResource.DATA_KEY,data);
      }

      // TODO: Do we need to match - and floating point?
      static NUMBER_MATCHER:RegExp = /^-?\d+$/;

      // TODO: More sophisticated deserializing of types, removing hardcoded keys.
      transformTypes(data:any):any {
         var results:any = {};
         _.each(data,(dataValue:any,dataKey)=>{
            var sheetElements = dataValue.elements.slice(0);
            var length:number = sheetElements.length;
            for (var i = 0; i < length; i++){
               var entry:any = sheetElements[i];
               for (var key in entry) {
                  if (!entry.hasOwnProperty(key) || typeof entry[key] !== 'string') {
                     continue;
                  }
                  var value = entry[key];
                  // number values
                  if(value.match(pow2.GameDataResource.NUMBER_MATCHER)){
                     entry[key] = parseInt(value);
                  }
                  // boolean values
                  else if(key === 'benefit'){
                     switch(value.toLowerCase()){
                        case "true": case "yes": case "1":
                           entry[key] = true;
                           break;
                        case "false": case "no": case "0": case null:
                           entry[key] = false;
                           break;
                        default:
                           entry[key] = Boolean(value);
                     }
                  }
                  // pipe delimited array values
                  else if(key === 'usedby' || key === 'groups' || key === 'zones' || key === 'enemies'){
                     if(/^\s*$/.test(value)){
                        entry[key] = null;
                     }
                     else {
                        entry[key] = value.split('|');
                     }
                  }
               }
            }
            results[dataKey.toLowerCase()] = sheetElements;
         });
         return results;
      }
      getSheetData(name:string):any {
         if(!this.isReady()){
            throw new Error("Cannot query spreadsheet before it's loaded");
         }
         name = ('' + name).toLocaleLowerCase();
         if(!this.data[name]){
            return [];
         }
         return this.data[name];
      }

   }
}