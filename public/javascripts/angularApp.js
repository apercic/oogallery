var app = angular.module('studis', ['ui.router', 'ui.bootstrap']);


app.config([
'$stateProvider',
'$urlRouterProvider',
'$windowProvider',
function($stateProvider, $urlRouterProvider, $windowProvider) {
  var $window = $windowProvider.$get();
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html', //home.html je inline template v index.html
      controller: 'MainCtrl',
      resolve: {
            function(){
                if ($window.localStorage['studis'])  {
                    $window.location.href = '/#!/galerije';
                    $window.location.reload();
                }
            }
        }      

    })
    .state('galerije', {
      url: '/galerije',
      templateUrl: '/galerije.html', //home.html je inline template v index.html
      controller: 'MainCtrl',
      resolve: {
            function(){
                if (!$window.localStorage['studis'])  {
                    $window.location.href = '/#!/home';
                }
            }
        }      
    })
    .state('prikazslik', {
      url: '/galerija/{ime}',
      templateUrl: '/prikazslik.html', //home.html je inline template v index.html
      controller: 'PrikazSlikCtrl',
      resolve: {
            function(){
                if (!$window.localStorage['studis'])  {
                    $window.location.href = '/#!/home';
                }
            }
        }
    });

  $urlRouterProvider.otherwise('home');
}]);

//controller za modalno okno
app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, customer) {
  $scope.customer = customer;
});


app.controller('MainCtrl', [
'$scope', '$http', '$window', '$location', 
function($scope, $http, $window, $location){

  $scope.galerije = [];
  $http.get('/vse_galerije').then(function(response) {
    console.log("nalagam galerije....");
    $scope.galerije = response.data;
  });


  //email trenutno vpisanega
  $scope.usernameTrenutnoVpisanega = function() {
    if ($window.localStorage['studis']) {
      var zeton = $window.localStorage['studis'];
      return JSON.parse($window.atob(zeton.split('.')[1]));
    }
    else return "prosim logiraj se";
  }

  //s to spremenljivko na prvi strani z ng-show nastavlam kaj je prikazano
  $scope.vpisanStudent = $window.localStorage['studis'];
  if ($window.localStorage['studis']) {
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
        $window.location.href = '/#!/galerije';
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
    $window.location.href = '/#!/home';
  }

  $scope.shrani_sliko = function() {
    var data = new Blob([ 'testing testing'], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, 'text.txt');
  }

  $scope.nova_galerija = function() {
    if (!$scope.ime_nove || $scope.ime_nove == "") {
      $scope.error_nova_galerija = "vnesi ime nove galerije";
      return;
    }
    $scope.error_nova_galerija = "";
    $http.get('/nova_galerija/'+$scope.ime_nove).then(function(response) {
      if (response.data == "Galerija s tem imenom že obstaja") {
        $scope.error_nova_galerija = "galerija s tem imenom že obstaja";
        return;
      }
      else {
        console.log(response);
        //dodam zadnji element  
        $scope.galerije.push(response.data[response.data.length - 1]);
        $scope.error_nova_galerija = "nova galerija uspešno ustvarjena";        
      }
    });
  }

  $scope.odstrani_galerijo = function(ime, $index) {
    $http.get('/zbrisi_galerija/'+ime).then(function(response) {      
      $scope.galerije.splice($index, 1);
    });
  }


}]);

app.controller('PrikazSlikCtrl', [
'$scope', '$http', '$window', '$location', '$stateParams', '$uibModal',
function($scope, $http, $window, $location, $stateParams, $uibModal){
  $scope.ime_galerije = $stateParams.ime;

  $scope.slike_galerije = [];
  $http.get('/vse_slike_iz_galerije/'+$stateParams.ime).then(function(response) {    
    $scope.slike_galerije = response.data;
  });

  //email trenutno vpisanega
  $scope.usernameTrenutnoVpisanega = function() {
    if ($window.localStorage['studis']) {
      var zeton = $window.localStorage['studis'];
      return JSON.parse($window.atob(zeton.split('.')[1]));
    }
    else return "prosim logiraj se";
  }
  //s to spremenljivko na prvi strani z ng-show nastavlam kaj je prikazano
  $scope.vpisanStudent = $window.localStorage['studis'];
  if ($window.localStorage['studis'])
    $scope.trenutni_uporabnik = ($scope.usernameTrenutnoVpisanega()).username;
    

  $scope.odpri_vecjo_sliko = function(slika) {
    var modalInstance = $uibModal.open({
      controller: "ModalInstanceCtrl",
      templateUrl: '/myModalContent.html',
      resolve: { customer: 
          function() {
            console.log(slika);
            return slika;
          }
      }


    }).result.then(function(){}, function(res){});
  }


  $scope.logoutFunkcija = function() {
    console.log("izpisujem see...");
    $window.localStorage.removeItem('studis');
    $window.location.href = '/#!/home';
  }


}]);