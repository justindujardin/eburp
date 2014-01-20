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
module pow2 {
   var maxLevel = 50;
   var maxAttr = 255;
   var baseExperience = 3;
   var experienceFactor = 2.75;

   export enum HeroType {
      Warrior = 1,
      Archer = 2
   }
   export interface HeroModelOptions extends EntityModelOptions {
      type:HeroType;
      description:string; // An description of the hero.

      // Hidden attributes.
      baseStrength:number;
      baseAgility:number;
      baseIntelligence:number;
      baseVitality:number;

      // The experience required to advance to the next level.
      nextLevelExp:number;

   }
   export class HeroModel extends EntityModel {
      static DEFAULTS:HeroModelOptions = {
         name: "Hero",
         icon: "warrior.png",
         type: HeroType.Warrior,
         level: 1,
         exp:0,
         nextLevelExp:0,
         hp:0,
         maxHP: 6,
         description: "",
         // Hidden attributes.
         baseStrength:0,
         baseAgility:0,
         baseIntelligence:0,
         baseVitality:0
      };
      getXPForLevel(level=this.attributes.level){
         if(level === 0){
            return 0;
         }
         return Math.floor(baseExperience * Math.pow(level,experienceFactor)) + this.getXPForLevel(level-1);
      }

      defaults():any {
         return _.extend(super.defaults(), HeroModel.DEFAULTS);
      }

      awardExperience(defeated:CreatureModel){
         var exp:number = defeated.get('exp');
         var newExp:number = this.attributes.exp + exp;
         this.set({
            exp:newExp
         });
         if(newExp >= this.attributes.nextLevelExp){
            this.awardLevelUp();
         }
      }

      awardLevelUp(){
         var nextLevel:number = this.attributes.level+1;
         var newHP = HeroModel.getHPForLevel(this,nextLevel);
         this.set({
            level: nextLevel,
            maxHP: newHP,
            hp: newHP,
            strength:HeroModel.getStrengthForLevel(this,nextLevel),
            agility:HeroModel.getAgilityForLevel(this,nextLevel),
            vitality:HeroModel.getVitalityForLevel(this,nextLevel),
            intelligence:HeroModel.getIntelligenceForLevel(this,nextLevel),

            nextLevelExp:this.getXPForLevel(nextLevel+1)
         });
         this.trigger('levelUp',this);

      }

      static getHPForLevel(character:HeroModel,level?:number){
         if(typeof level === 'undefined'){
            level = character.get('level');
         }
         var vitality = level * character.get('vitality');
         return Math.floor(vitality * Math.pow(level,1)) + 15;
         //return vitality * (maxAttr / maxLevel) + 30;
      }

      static getStrengthForLevel(character:HeroModel,level:number=character.attributes.level){
         return Math.floor(character.attributes.baseStrength * Math.pow(level,1));
      }
      static getAgilityForLevel(character:HeroModel,level:number=character.attributes.level){
         return Math.floor(character.attributes.baseAgility * Math.pow(level,1));
      }
      static getVitalityForLevel(character:HeroModel,level:number=character.attributes.level){
         return Math.floor(character.attributes.baseVitality * Math.pow(level,1));
      }
      static getIntelligenceForLevel(character:HeroModel,level:number=character.attributes.level){
         return Math.floor(character.attributes.baseIntelligence * Math.pow(level,1));
      }


      static create(type:HeroType){
         var character = new HeroModel({
            type:type,
            level:0,
            baseStrength:20,
            baseAgility:5,
            baseIntelligence:1,
            baseVitality:10

         });
         character.awardLevelUp();
         return character;
      }
   }
}