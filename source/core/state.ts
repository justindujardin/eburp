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

/// <reference path="../../types/underscore/underscore.d.ts" />
/// <reference path="./stateMachine.ts" />
module pow2 {

   // State Interfaces
   // -------------------------------------------------------------------------
   export interface IState {
      name:string;
      enter(machine:IStateMachine);
      exit(machine:IStateMachine);
      tick(machine:IStateMachine);
   }
   export interface IThinkState {
      getNextTickTime(machine:IStateMachine);
   }
   export interface IStateTransition {
      getTargetState():string;
      evaluate(machine:IStateMachine):boolean;
   }


   // Implementation
   // -------------------------------------------------------------------------
   export class State implements IState {
      name:string;
      transitions:IStateTransition[] = [];
      enter(machine:IStateMachine){}
      exit(machine:IStateMachine){}
      tick(machine:IStateMachine){
         _.any(this.transitions,(t:IStateTransition) => {
            return t.evaluate(machine) && machine.setCurrentState(t.getTargetState());
         });
      }
   }

   export class StateTransition implements IStateTransition {
      private _targetState:string;
      constructor(targetState:string){
         this.setTargetState(targetState);
      }
      getTargetState():string {
         return this._targetState;
      }
      setTargetState(state:string) {
         this._targetState = state;
      }
      evaluate(machine:IStateMachine):boolean {
         return true;
      }
   }
}