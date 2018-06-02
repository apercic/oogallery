var app = angular.module('galerija', ['ui.router', 'ui.bootstrap']);


app.config([
'$stateProvider',
'$urlRouterProvider',
'$windowProvider',
function($stateProvider, $urlRouterProvider, $windowProvider) {
  var $window = $windowProvider.$get();
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
            function($q, $state){
                if ($window.localStorage['galerija'])  {
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise.catch(function () { $state.go('galerije'); });
                }
            }
        }      

    })
    .state('galerije', {
      url: '/galerije',
      templateUrl: '/galerije.html',
      controller: 'MainCtrl',
      resolve: {
            function($q, $state){
                if (!$window.localStorage['galerija'])  {
                    var deferred = $q.defer();
                    deferred.reject();
                    return deferred.promise.catch(function () { $state.go('home'); });
                }
            }//*/
      }      
    })
    .state('prikazslik', {
      url: '/galerija/{ime}',
      templateUrl: '/prikazslik.html',
      controller: 'PrikazSlikCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);

//controller za modalno okno
app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, povecana_slika) {
  $scope.povecana_slika = povecana_slika;
});

app.controller('MainCtrl', [
'$scope', '$http', '$window', '$location', 
function($scope, $http, $window, $location){

  $scope.galerije = [];
  $http.get('/vse_galerije').then(function(response) {
    console.log("nalagam galerije....");
    $scope.galerije = response.data;
  });

  $scope.login_funkcija = function() {
    //alert($scope.elektronska_posta + $scope.geslo);
    if (!$scope.elektronska_posta || !$scope.geslo) {
      $scope.pokazi_napako_login = true;
      $scope.login_status = "prosim vnesi ime in geslo za logiranje v sistem";
      return;
    }    
    /*$http.post('/prijava/preveriPrijavo',
     {elektronska_posta: $scope.elektronska_posta, geslo: $scope.geslo}).then(function(response) {      
      if (response.data.status == "200") {
        $window.localStorage['galerija'] = response.data.token;
        $scope.vpisanStudent = $window.localStorage['galerija'];
        $scope.trenutni_uporabnik = ($scope.usernameTrenutnoVpisanega()).username;
        $scope.id_trenutnega_uporabnika = ($scope.usernameTrenutnoVpisanega())._id;
        $window.location.href = '/#!/galerije';
      }
      else {
        //v primeru napake dobimo odgovor a je uporabniško ime al geslo narobe
        $scope.login_status = response.data.vzrok;
        $scope.pokazi_napako_login = true;
      }
    }); //*/
    else if ($scope.elektronska_posta == "ana" && $scope.geslo == "ana") {
      $window.localStorage['galerija'] = true;
      $window.location.href = '/#!/galerije';
      $route.reload();
    }

    else {
      $scope.login_status = "Napačno ime ali geslo"
    }
  };

  $scope.logoutFunkcija = function() {
    localStorage.clear();
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

  if ($window.localStorage['galerija'])
    $scope.logged_in = true;

  $scope.odpri_vecjo_sliko = function(slika) {
    var modalInstance = $uibModal.open({
      controller: "ModalInstanceCtrl",
      templateUrl: '/myModalContent.html',
      windowClass: 'app-modal-window',
      resolve: { povecana_slika: 
          function() {
            console.log(slika);
            return slika;
          }
      }
    }).result.then(function(){}, function(res){});
  }

  $scope.zbrisi_sliko = function(galerija_ime, slika_ime, $index) {
    console.log(slika_ime);
    $http.get('/zbrisi_sliko/'+galerija_ime+'/'+slika_ime).then(function(response) {      
      $scope.slike_galerije.splice($index, 1);
    });
  }

   $scope.logoutFunkcija = function() {
    localStorage.clear();
    $window.location.href = '/#!/home';
  }
}]);