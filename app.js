var app = angular.module("app", ["ui.bootstrap", "firebase"]);

app.value("fbURL", "https://ovtracking.firebaseio.com/users/");
app.factory("Users", ["$firebaseArray", "fbURL",
  function($firebaseArray, fbURL) {
    var ref = new Firebase(fbURL);
    return $firebaseArray(ref);
  }
]);
app.directive("myVacations", function() {
  return {
    scope: {
      raw: '=info'
    },
    templateUrl: 'templates/my-vacations.html',
    link: function(scope) {
      
   
      scope.balance = 0;
      scope.numberofitems = 0;
      obj = scope.raw;
      angular.forEach(obj, function(value) {
        scope.balance = scope.balance + value.days;
        scope.numberofitems++;
      })
    }
  }
})
app.controller("Ctrl", ["$scope", "Users", "$modal", "fbURL", "$firebaseObject",
  function($scope, Users, $modal, fbURL, $firebaseObject) {

    $scope.dataModel = Users;
    $scope.currentUserVacations = null;
    $scope.open = function(userId) {
      var modalInstance = $modal.open({
        templateUrl: 'templates/add_user_modal.html',
        controller: $scope.model,
        //size: 'lg',
        resolve: {
          id: function() {
            //console.log(userId);
            return userId;
          }
        }
      });
    };
    $scope.select = function(userId) {
      //console.log(userId);
      var userUrl = fbURL + userId + '/';
      $scope.currentUserVacations = $firebaseObject(new Firebase(userUrl));
    };
    $scope.delete = function(userId) {
      var userUrl = fbURL + userId + '/';
      var userToDelete = $firebaseObject(new Firebase(userUrl));
      userToDelete.$bindTo($scope, "data").then(function() {
        $scope.data.isdeleted = "true";
        $scope.data.lastmodified = new Date().toJSON();
      });

    }
    $scope.newVacations = function(vacId) {
      var modalInstance = $modal.open({
        templateUrl: 'templates/add_vac_modal.html',
        controller: $scope.vacationsmodel,
        resolve: {
          id: function() {
            //console.log(vacId);
            return vacId;
          }
        }
      });
    };
    $scope.vacationsmodel = function($scope, $modalInstance, Users, id, $firebase, fbURL, $firebaseObject, $firebaseArray) {
      $scope.dpopen1 = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened1 = true;
      };
      $scope.dpopen2 = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened2 = true;
      };
      $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };
      $scope.format = 'dd-MMMM-yyyy';
      $scope.userNewVacations = {};
      // close modal
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
      // Add new user
      $scope.addVacations = function() {
        $scope.userNewVacations.enddate = $scope.userNewVacations.enddate.toJSON();
        $scope.userNewVacations.startdate = $scope.userNewVacations.startdate.toJSON();
        
        var ref = new Firebase(fbURL + id + '/vacations/');
        var vacationsArray = $firebaseArray(ref);
        
        var idAdded; 
      //  console.log("je rentre");

          vacationsArray.$add($scope.userNewVacations).then(function(idInserted){
          var id = idInserted.key();
        //  console.log("added " + id);
          idAdded = id;
        });
        
      //  console.log("je sors");
        $modalInstance.dismiss('cancel');
      };
      // Save edited user.
      $scope.save = function() {
        $scope.user.lastmodified = JSON.stringify(new Date());
        $scope.user.$save();
        $modalInstance.dismiss('cancel');
      };
    };
    $scope.model = function($scope, $modalInstance, Users, id, $firebase, fbURL, $firebaseObject) {
      $scope.user = {};
      // if clicked edit. id comes from $scope.modal->userId
      if (angular.isDefined(id)) {
        var userUrl = fbURL + id + '/';
        $scope.user = $firebaseObject(new Firebase(userUrl));
      } else {
        //  $scope.user.networkid = "new user";
        //    $scope.user.coming = "new user";
      }
      // close modal
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
      // Add new user
      $scope.add = function() {
        $scope.user.lastmodified = new Date().toJSON();
        $scope.user.isdeleted = "false";
        Users.$add($scope.user);
        $modalInstance.dismiss('cancel');
      };
      // Save edited user.
      $scope.save = function() {
        $scope.user.lastmodified = JSON.stringify(new Date());
        $scope.user.$save();
        $modalInstance.dismiss('cancel');
      };
    };

  }
]);