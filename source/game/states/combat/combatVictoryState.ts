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

/// <reference path="../gameCombatState.ts" />
/// <reference path="../../../core/state.ts" />

module pow2 {
   export class CombatVictoryState extends CombatState {
      static NAME:string = "Combat Victory";
      name:string = CombatVictoryState.NAME;
      enter(machine:CombatStateMachine){
         super.enter(machine);
         var player:HeroModel = <HeroModel>machine.friendly.model;
         player.awardExperience(<CreatureModel>machine.enemy.model);
         machine.trigger("combat:victory",machine.friendly,machine.enemy);
      }

      tick(machine:CombatStateMachine){
         if(machine.paused){
            return;
         }
         machine.parent.setCurrentState(GameMapState.NAME);
      }
   }
}