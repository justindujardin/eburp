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

/// <reference path="../combatActionComponent.ts" />

module rpg.components.combat.actions {

  /**
   * Describe the result of a combat run action.
   */
  export interface CombatRunSummary {
    success:boolean;
    player:rpg.objects.GameEntityObject;
  }

  export class CombatRunComponent extends CombatActionComponent {
    name:string = "run";

    canTarget():boolean {
      return false;
    }

    act(then?:rpg.states.IPlayerActionCallback):boolean {
      if (!this.isCurrentTurn()) {
        return false;
      }
      var success:boolean = this._rollEscape();
      var data:CombatRunSummary = {
        success: success,
        player: this.combat.machine.current
      };
      this.combat.machine.notify("combat:run", data, ()=> {
        if (success) {
          this.combat.machine.setCurrentState(rpg.states.combat.CombatEscapeState.NAME);
        }
        else {
          this.combat.machine.setCurrentState(rpg.states.combat.CombatEndTurnState.NAME);
        }
        then && then(this);
      });
      return true;
    }


    /**
     * Determine if a run action results in a successful escape from
     * combat.
     *
     * TODO: This should really consider character attributes.
     *
     * @returns {boolean} If the escape will succeed.
     * @private
     */
    private _rollEscape():boolean {
      var roll:number = _.random(0, 200);
      var chance:number = 100;
      if (roll === 200) {
        return false;
      }
      if (roll === 0) {
        return true;
      }
      return roll <= chance;
    }

  }
}