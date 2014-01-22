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
/// <reference path="../services/gameFactory.ts"/>

module pow2.ui {
   var stateKey = "_testPow2State";
   export function resetGame() {
      localStorage.removeItem(stateKey);
   }
   app.controller('RPGGameController',function($scope,$rootScope,$http,$timeout,game){
      $scope.overlayText = null;
      $scope.saveState = function(data){
         localStorage.setItem(stateKey,data);
      };
      $scope.range = function(n) {
         return new Array(n);
      };
      $scope.clearState = function() {
         localStorage.removeItem(stateKey);
      };
      $scope.getState = function(){
         return localStorage.getItem(stateKey);
      };
      // TODO: Resets state every page load.  Remove when persistence is desired.
      //resetGame();

      // TODO: Move level table elsewhere

      $scope.displayMessage = function(message,callback?,time:number=1000) {
         $scope.overlayText = message;
         $timeout(function(){
            $scope.overlayText = null;
            callback && callback();
         },time);
      };
      game.loadGame($scope.getState());
      $scope.gameModel = game.model;
      $scope.party = game.model.party;
      $scope.player = game.model.party[0];

      var warriorTable = [];
      var p:HeroModel = $scope.party[0];
      var wizardTable = [];
      var q:HeroModel = $scope.party[1];
      for(var i = 1; i <= HeroModel.MAX_LEVEL; i++){
         warriorTable.push({
            level:i,
            hp:p.getHPForLevel(i),
            experience:p.getXPForLevel(i),
            strength: p.getStrengthForLevel(i),
            agility: p.getAgilityForLevel(i),
            intelligence: p.getIntelligenceForLevel(i),
            vitality: p.getVitalityForLevel(i)
         });
         wizardTable.push({
            level:i,
            hp:q.getHPForLevel(i),
            experience:q.getXPForLevel(i),
            strength: q.getStrengthForLevel(i),
            agility: q.getAgilityForLevel(i),
            intelligence: q.getIntelligenceForLevel(i),
            vitality: q.getVitalityForLevel(i)
         });
      }
      $scope.warriorLevelTable = warriorTable;
      $scope.wizardLevelTable = wizardTable;


      // TODO: A better system for game event handling.
      game.machine.on('enter',function(state){
         console.log("UI: Entered state: " + state.name);
         $scope.$apply(function(){
            if(state.name === GameCombatState.NAME){
               $scope.combat = state.machine;
               $scope.inCombat = true;
               $scope.displayMessage(state.name);
               state.machine.on('combat:attack',function(damage,attacker,defender){
                  state.machine.paused = true;
                  $scope.$apply(function(){
                     var msg = attacker.model.get('name') + " attacked " + defender.model.get('name') + " for " + damage + " damage!";
                     $scope.displayMessage(msg,function(){
                        state.machine.paused = false;
                     });
                  });
               });
               state.machine.on('combat:victory',function(winner,loser) {
                  state.machine.paused = true;
                  $scope.$apply(function(){
                     var msg = winner.model.get('name') + " DEFEATED " + loser.model.get('name') + "!";
                     $scope.displayMessage(msg,function(){
                        state.machine.paused = false;
                        var data = game.model.toJSON();
                        //console.log(data);
                        $scope.saveState(JSON.stringify(data));
                     });
                  });
               });
            }
         });
      });
      game.machine.on('exit',function(state){
         $scope.$apply(function(){
            if(state.name === GameMapState.NAME){
               $scope.dialog = null;
               $scope.store = null;
            }
            else if(state.name === GameCombatState.NAME){
               $scope.inCombat = false;
               $scope.combat = null;
            }
         });
         console.log("UI: Exited state: " + state.name);
      });

      // TODO: Some kind of events mapping, that handles this (assigning to scope)
      // in a generic way.  Lots of duplication here.  Beware!
   });
}

