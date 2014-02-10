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
/// <reference path="./creatureModel.ts" />
/// <reference path="./gameStateModel.ts" />
/// <reference path="./armorModel.ts" />
/// <reference path="./weaponModel.ts" />
module pow2 {
   var levelExpChart = [
      0,
      32,
      96,
      208,
      400,
      672,
      1056,
      1552,
      2184,
      2976
   ];


   export enum HeroType {
      Warrior = 1,
      Wizard = 2,
      Ranger = 3,
      Thief = 4
   }
   export interface HeroModelOptions extends EntityModelOptions {
      type:HeroType;
      description:string; // An description of the hero.

      // Hidden attributes.
      baseStrength:number; // Strength = damage
      baseAgility:number; // Agility = evasion
      baseIntelligence:number; // Higher intelligence = more powerful magic and more mana
      baseVitality:number; // The base level of vitality for the character class

      hitPercentPerLevel:number; // How much the hit% increases per level.

      // The experience required to advance to the next level.
      nextLevelExp:number;
      prevLevelExp:number;

   }
   export class HeroModel extends EntityModel {

      static MAX_LEVEL:number = 50;
      static MAX_ATTR:number = 50;
      weapon:WeaponModel;
      armor:ArmorModel[];
      game:GameStateModel;
      static DEFAULTS:HeroModelOptions = {
         name: "Hero",
         icon: "warrior.png",
         type: HeroType.Warrior,
         level: 1,
         exp:0,
         nextLevelExp:0,
         prevLevelExp:0,
         hp:0,
         maxHP: 6,
         description: "",
         // Hidden attributes.
         baseStrength:0,
         baseAgility:0,
         baseIntelligence:0,
         baseVitality:0,
         hitPercent:5,
         hitPercentPerLevel:1,
         evade:0
      };
      defaults():any {
         return _.extend(super.defaults(), HeroModel.DEFAULTS);
      }

      initialize(options?:any) {
         super.initialize(options);
         if(typeof this.armor === 'undefined'){
            this.armor = [];
         }
      }

      getEvasion():number {
         var armorWeight:number = _.reduce<ArmorModel,number>(this.armor,(val:number,item) => {
            return val + item.attributes.evade;
         },0);
         return EntityModel.BASE_EVASION + this.attributes.agility - armorWeight;
      }

      attack(defender:EntityModel):number{
         var halfStrength = this.attributes.strength / 2;
         var weaponAttack = this.weapon ? this.weapon.attributes.attack : 0;
         var amount = halfStrength + weaponAttack;
         var max = amount * 1.2;
         var min = amount * 0.8;
         var damage = Math.max(1,Math.floor(Math.random() * (max - min + 1)) + min);
         if(this.rollHit(defender)){
            return defender.damage(damage);
         }
         return 0;
      }

      getXPForLevel(level=this.attributes.level){
         if(level == 0){
            return 0;
         }
         return levelExpChart[level-1];
      }


      getDefense():number {
         return _.reduce(this.armor,(val:number,item) => {
            return val + item.attributes.defense;
         },0);
      }

      getDamage():number {
         return ((this.weapon ? this.weapon.attributes.attack : 0) + this.attributes.strength / 2) | 0;
      }

      awardExperience(exp:number):boolean{
         var newExp:number = this.attributes.exp + exp;
         this.set({
            exp:newExp
         });
         if(newExp >= this.attributes.nextLevelExp){
            this.awardLevelUp();
            return true;
         }
         return false;
      }

      awardLevelUp(){
         var nextLevel:number = this.attributes.level+1;
         var newHP = this.getHPForLevel(nextLevel);
         this.set({
            level: nextLevel,
            maxHP: newHP,
            strength:this.getStrengthForLevel(nextLevel),
            agility:this.getAgilityForLevel(nextLevel),
            vitality:this.getVitalityForLevel(nextLevel),
            intelligence:this.getIntelligenceForLevel(nextLevel),

            nextLevelExp:this.getXPForLevel(nextLevel+1),
            prevLevelExp:this.getXPForLevel(nextLevel)
         });
         this.trigger('levelUp',this);
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
         if(!data){
            return {};
         }
         if(data.weapon){
            var weapon = _.where(pow2.data.weapons,{name:data.weapon})[0];
            this.weapon = new WeaponModel(weapon);
         }
         this.armor = _.map(data.armor,(item) => {
            var armor = _.where(pow2.data.armor,{name:item})[0];
            return new ArmorModel(armor);
         });
         return _.omit(data,'armor','weapon');

      }

      toJSON() {
         var result = super.toJSON();
         if(this.weapon){
            result.weapon = this.weapon.get('name');
         }
         result.armor = _.map(this.armor,(p) => {
            return p.get('name');
         });
         return result;
      }

      getHPForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.vitality * Math.pow(level,1.1)) + (this.attributes.baseVitality * 2);
      }
      getStrengthForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseStrength * Math.pow(level,0.95));
      }
      getAgilityForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseAgility * Math.pow(level,0.95));
      }
      getVitalityForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseVitality * Math.pow(level,0.95));
      }
      getIntelligenceForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseIntelligence * Math.pow(level,0.95));
      }


      static create(type:HeroType,name:string){
         var character:HeroModel = null;
         switch(type){
            case HeroType.Warrior:
               character = new HeroModel({
                  type:type,
                  level:0,
                  name:name,
                  icon: "warrior.png",
                  baseStrength:10,
                  baseAgility:2,
                  baseIntelligence:1,
                  baseVitality:7,
                  hitPercent:10,
                  hitPercentPerLevel:3
               });
               break;
            case HeroType.Wizard:
               character = new HeroModel({
                  type:type,
                  name:name,
                  level:0,
                  icon: "girlWizard.png",
                  baseStrength:1,
                  baseAgility:6,
                  baseIntelligence:9,
                  baseVitality:4,
                  hitPercent:5,
                  hitPercentPerLevel:1
               });
               break;
            case HeroType.Ranger:
               character = new HeroModel({
                  type:type,
                  name:name,
                  level:0,
                  icon: "girlArcher.png",
                  baseStrength:3,
                  baseAgility:10,
                  baseIntelligence:2,
                  baseVitality:5,
                  hitPercent:7,
                  hitPercentPerLevel:2
               });
               break;
            case HeroType.Thief:
               character = new HeroModel({
                  type:type,
                  name:name,
                  level:0,
                  icon: "assassin.png",
                  baseStrength:2,
                  baseAgility:10,
                  baseIntelligence:4,
                  baseVitality:4,
                  hitPercent:5,
                  hitPercentPerLevel:2
               });
               break;
         }
         character.awardLevelUp();
         character.set({
            hp:character.get('maxHP')
         });
         return character;
      }
   }
}