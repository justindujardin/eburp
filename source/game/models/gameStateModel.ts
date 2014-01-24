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

/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../core/api.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
module pow2 {

   export interface GameStateModelOptions {
      gold:number;
   }

   export class GameStateModel extends Backbone.Model {
      party:HeroModel[]; // The player's party
      inventory:any[]; // The inventory of items owned by the player.
      static DEFAULTS:GameStateModelOptions = {
         gold: 200
      };
      defaults():any {
         return _.extend({}, GameStateModel.DEFAULTS);
      }
      initialize(options?:any) {
         super.initialize(options);
         if(typeof this.party === 'undefined'){
            this.party = [];
         }
         if(typeof this.inventory === 'undefined'){
            this.inventory = [];
         }
      }


      addHero(model:HeroModel){
         this.party.push(model);
         model.game = this;
      }

      parse(data:any,options?:any):any {
         try{
            if(typeof data === 'string'){
               data = JSON.parse(data);
            }
         }
         catch(e){
            console.log("Failed to load save game.");
            return {};
         }
         this.party = _.map(data.party,(partyMember) => {
            return new HeroModel(partyMember,{parse:true});
         });
         this.inventory = [];
         return _.omit(data,'party');
      }

      toJSON() {
         var result = super.toJSON();
         result.party = _.map(this.party,(p) => {
            return p.toJSON();
         });
         return result;
      }
   }
}