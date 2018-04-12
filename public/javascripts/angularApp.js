var app = angular.module('studis', ['ui.router']);


app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html', //home.html je inline template v index.html
      controller: 'MainCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);


app.directive("slide",function($timeout){
    return{
      restrict : 'AE',
      templateUrl : '/slide.html',
      scope: {
        images : '='
      },
      
      link: function($scope,elem,attrs){
         
        $scope.currentIndex = 0;
        $scope.next = function(){
          $scope.currentIndex < $scope.images.length-1 ? $scope.currentIndex++ : $scope.currentIndex = 0;        
        }
        $scope.prev = function(){
          $scope.currentIndex > 0 ? $scope.currentIndex-- : $scope.currentIndex = $scope.images.length-1;
          
        }
        $scope.$watch('currentIndex',function(){
          $scope.images.forEach(function(image){
            image.visible = false;
          })
          $scope.images[$scope.currentIndex].visible = true;
        })
      }
    }
  });

app.controller('MainCtrl', [
'$scope', '$http', '$window', '$location', 
function($scope, $http, $window, $location){
  $scope.firstUpl = "e8f5ee7b258a61ec9428676b299919bf";

  $scope.images = [{}];
  $http.get('/slike').then(function(response) {
    console.log("nalagam slike....");
    $scope.images = response.data;
  });


  //preverim ce je logiran v sistem
  $scope.jeVpisan = function() {
    if($window.localStorage['studis']) return true;
    return false;
  }

  //email trenutno vpisanega
  $scope.usernameTrenutnoVpisanega = function() {
    if ($scope.jeVpisan()) {
      var zeton = $window.localStorage['studis'];
      return JSON.parse($window.atob(zeton.split('.')[1]));
    }
    else return "prosim logiraj se";
  }

  //s to spremenljivko na prvi strani z ng-show nastavlam kaj je prikazano
  $scope.vpisanStudent = $window.localStorage['studis'];
  if ($scope.jeVpisan()) {
    $scope.trenutni_uporabnik = ($scope.usernameTrenutnoVpisanega()).username;
    $scope.id_trenutnega_uporabnika = ($scope.usernameTrenutnoVpisanega())._id;
  }  
  

  $scope.login_funkcija = function() {
    //alert($scope.elektronska_posta + $scope.geslo);
    if (!$scope.elektronska_posta || !$scope.geslo) {
      $scope.pokazi_napako_login = true;
      $scope.login_status = "prosim vnesi ime in geslo za logiranje v sistem";
      return;
    }
    
    $http.post('/prijava/preveriPrijavo',
     {elektronska_posta: $scope.elektronska_posta, geslo: $scope.geslo}).then(function(response) {      
      if (response.data.status == "200") {
        $window.localStorage['studis'] = response.data.token;
        $scope.vpisanStudent = $window.localStorage['studis'];
        $scope.trenutni_uporabnik = ($scope.usernameTrenutnoVpisanega()).username;
        $scope.id_trenutnega_uporabnika = ($scope.usernameTrenutnoVpisanega())._id;
      }
      else {
        //v primeru napake dobimo odgovor a je uporabniško ime al geslo narobe
        $scope.login_status = response.data.vzrok;
        $scope.pokazi_napako_login = true;
      }
    });
  };

  $scope.logoutFunkcija = function() {
    console.log("izpisujem see...");
    $window.localStorage.removeItem('studis');
    $scope.vpisanStudent = false;
  }

  $scope.shrani_sliko = function() {
    var data = new Blob([ 'Hey ho lets go!'], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, 'text.txt');

  }
}]);