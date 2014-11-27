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

/// <reference path="./api.ts"/>
/// <reference path="./state.ts" />
module pow2 {

   // State Machine Interfaces
   // -------------------------------------------------------------------------
   export interface IStateMachine extends IEvents {
      update(data:any);
      addState(state:IState);
      addStates(states:IState[]);
      getCurrentState():IState;
      getCurrentName():string;
      setCurrentState(name:string):boolean;
      setCurrentState(state:IState):boolean;
      setCurrentState(newState:any):boolean;
      getPreviousState():IState;
      getState(name:string):IState;
   }

   // Implementation
   // -------------------------------------------------------------------------
   export class StateMachine extends Events implements IStateMachine, IWorldObject{
      defaultState:string = null;
      states:IState[] = [];
      private _currentState:IState = null;
      private _previousState:IState = null;
      private _newState:boolean = false;

      world:IWorld;
      onAddToWorld(world){}
      onRemoveFromWorld(world){}


      update(data?:any){
         this._newState = false;
         if(this._currentState === null){
            this.setCurrentState(this.defaultState);
         }
         if(this._currentState !== null){
            this._currentState.update(this);
         }
         // Didn't transition, make sure previous === current for next tick.
         if(this._newState === false && this._currentState !== null){
            this._previousState = this._currentState;
         }
      }
      addState(state:IState){
         this.states.push(state);
      }
      addStates(states:IState[]){
         this.states = _.unique(this.states.concat(states));
      }

      getCurrentState():IState{
         return this._currentState;
      }
      getCurrentName():string{
         return this._currentState !== null ? this._currentState.name : null;
      }
      setCurrentState(state:IState):boolean;
      setCurrentState(state:string):boolean;
      setCurrentState(newState:any):boolean{
         var state = typeof newState === 'string' ? this.getState(newState) : <IState>newState;
         var oldState:IState = this._currentState;
         if(!state){
            console.error("STATE NOT FOUND: " + newState);
            return false;
         }
         // Already in the desired state.
         if(this._currentState && state.name === this._currentState.name){
            console.warn("Attempting to set current state to already active state");
            return true;
         }
         this._newState = true;
         this._previousState = this._currentState;
         this._currentState = state;
         // DEBUG:
         //console.log("STATE: " + (!!oldState ? oldState.name : oldState) + " -> " + this._currentState.name);
         if(oldState){
            this.trigger("exit",oldState,state);
            oldState.exit(this);
         }
         state.enter(this);
         this.trigger("enter",state,oldState);
         return true;
      }
      getPreviousState():IState{
         return this._previousState;
      }
      getState(name:string):IState{
         var state = _.find(this.states,(s:IState) => {
            return s.name === name;
         });
         return state;
      }
   }

   /**
    * A state machine that updates with every game tick.
    */
   export class TickedStateMachine extends StateMachine {
      paused:boolean = false;
      // IWorldObject interface
      world:IWorld;
      onAddToWorld(world){
         world.time.addObject(this);
      }
      onRemoveFromWorld(world){
         world.time.removeObject(this);
      }
      tick(elapsed:number){
         this.update(elapsed);
      }
   }

}