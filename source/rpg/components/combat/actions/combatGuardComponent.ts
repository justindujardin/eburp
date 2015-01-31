/*
 Copyright (C) 2014 by Justin DuJardin and Contributors

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

/// <reference path="../combatActionComponent.ts" />

module pow2 {
   export class CombatGuardComponent extends CombatActionComponent {
      name:string = "guard";
      canTarget():boolean {
         return false;
      }
      act(then?:pow2.IPlayerActionCallback):boolean {
         this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
         return super.act(then);
      }


      /**
       * Until the end of the next turn, or combat end, increase the
       * current players defense.
       */
      select() {
         this.combat.machine.on(CombatStateMachine.Events.ENTER,this.enterState,this);
         console.info("Adding guard defense buff to player: " + this.from.model.get('name'));
         if(!(this.from.model instanceof pow2.HeroModel)){
            throw new Error("This action is not currently applicable to non hero characters.");
         }
         var heroModel:HeroModel = <HeroModel>this.from.model;
         var multiplier:number = heroModel.get('level') < 10 ? 2 : 0.5;
         heroModel.defenseBuff += (heroModel.getDefense(true) * multiplier);
      }

      enterState(newState:pow2.CombatState,oldState:pow2.CombatState) {
         var exitStates:string[] = [
            CombatChooseActionState.NAME,
            CombatVictoryState.NAME,
            CombatDefeatState.NAME,
            CombatEscapeState.NAME
         ];
         if(_.indexOf(exitStates,newState.name) !== -1){
            console.info("Removing guard defense buff from player: " + this.from.model.get('name'));
            this.combat.machine.off(CombatStateMachine.Events.ENTER,this.enterState,this);
            var heroModel:HeroModel = <HeroModel>this.from.model;
            heroModel.defenseBuff = 0;
         }
      }
   }
}