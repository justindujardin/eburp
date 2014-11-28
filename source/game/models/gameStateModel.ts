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
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
/// <reference path="./itemModel.ts" />
module pow2 {

   var _gameData:pow2.GameDataResource = null;
   export class GameStateModel extends pow2.Events {
      party:HeroModel[]; // The player's party
      inventory:ItemModel[]; // The inventory of items owned by the player.
      loader:pow2.ResourceLoader;
      keyData:{
         [key:string]:any
      } = {};
      gold:number;
      combatZone:string;

      constructor(options?:any) {
         super();
         _.extend(this,{
            gold: 200,
            playerPosition: new pow2.Point(),
            playerMap:"",
            combatZone:"world-plains",
            party:[],
            inventory:[]
         },options||{});
      }
      initData(then?:(data:GameDataResource)=>any){
         GameStateModel.getDataSource(then);
      }
      /**
       * Get the game data sheets from google and callback when they're loaded.
       * @param then The function to call when spreadsheet data has been fetched
       */
      static getDataSource(then?:(data:GameDataResource)=>any) {
         if(_gameData){
            then && then(_gameData);
         }
         else {
            pow2.ResourceLoader.get().loadAsType(pow2.SPREADSHEET_ID,pow2.GameDataResource,(resource:pow2.GameDataResource) => {
               _gameData = resource;
               then && then(resource);
            });
         }
      }

      setKeyData(key:string,data:any){
         this.keyData[key] = data;
      }
      getKeyData(key:string):any{
         return this.keyData[key];
      }


      addInventory(item:ItemModel):ItemModel {
         this.inventory.push(item);
         return item;
      }
      // Remove an inventory item.  Return true if the item was removed, or false
      // if it was not found.
      removeInventory(item:ItemModel):boolean{
         for(var i = 0; i < this.inventory.length; i++) {
            if(this.inventory[i].cid === item.cid){
               this.inventory.splice(i, 1);
               return true;
            }
         }
         return false;
      }


      addHero(model:HeroModel){
         this.party.push(model);
         model.game = this;
      }

      addGold(amount:number){
         this.gold += amount;
      }

      parse(data:any,options?:any) {
         if(!_gameData){
            throw new Error("cannot instantiate inventory without valid data source.\nCall model.initData(loader) first.")
         }
         try{
            if(typeof data === 'string'){
               data = JSON.parse(data);
            }
         }
         catch(e){
            console.log("Failed to load save game.");
            return;
         }
         if(typeof data.keyData !== 'undefined'){
            try{
               this.keyData = JSON.parse(data.keyData);
            }
            catch(e){
               console.error("Failed to parse keyData");
               this.keyData = data.keyData;
            }

         }

         var theChoices: any[] = [];
         theChoices = theChoices.concat(_.map(_gameData.getSheetData('weapons'),(w)=>{
            return _.extend({ instanceModel: new WeaponModel(w) },w);
         }));
         theChoices = theChoices.concat(_.map(_gameData.getSheetData('armor'), (a)=> {
            return _.extend({ instanceModel: new ArmorModel(a) }, a);
         }));


         this.inventory = _.map(data.inventory,(item:any) => {
            var choice:any = _.where(theChoices,{id:item.id})[0];
            return <pow2.ItemModel>choice.instanceModel;
         });
         this.party = _.map(data.party,(partyMember) => {
            return new HeroModel(partyMember,{parse:true});
         });
         _.extend(this,_.omit(data,'party','inventory','keyData'));
      }

      toJSON() {
         var result:any = _.omit(data,'party','inventory','keyData','world');
         result.party = _.map(this.party,(p) => {
            return p.toJSON();
         });
         result.inventory = _.map(this.inventory,(p) => {
            return <any>_.pick(p.attributes,'id');
         });
         try{
            result.keyData = JSON.stringify(this.keyData);
         }
         catch(e){
            console.error("Failed to stringify keyData");
            result.keyData = {};
         }
         return result;
      }
   }
}